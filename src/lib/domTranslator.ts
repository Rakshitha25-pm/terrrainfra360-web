/**
 * domTranslator — runtime DOM text translator.
 *
 * Walks every text node in the document and replaces its content with a
 * translation fetched from MyMemory (https://mymemory.translated.net) — a
 * free public translation API. Results are cached in memory + localStorage
 * so subsequent renders are instant.
 *
 * The translator also installs a MutationObserver, so newly mounted React
 * subtrees (drawers, modals, lazy-loaded sections) are translated as soon
 * as they appear in the DOM.
 *
 * Usage:
 *   import { setDocumentLanguage } from './domTranslator';
 *   setDocumentLanguage('hi');  // translates to Hindi
 *   setDocumentLanguage('en');  // resets to original English
 */

type Target = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | 'mr' | 'gu';

// In-memory cache: target -> (englishText -> translatedText)
const memCache: Record<string, Map<string, string>> = {};

// Tracks pending translations to dedupe in-flight requests.
const inflight: Record<string, Map<string, Promise<string>>> = {};

// Currently active target language. Used by the MutationObserver so it
// translates new nodes to whatever language the user picked last.
let activeTarget: Target = 'en';

// Has the observer been installed yet?
let observerInstalled = false;

// ─── Cache helpers ─────────────────────────────────────────────────────
function getCache(target: Target): Map<string, string> {
  let c = memCache[target];
  if (!c) {
    c = new Map<string, string>();
    memCache[target] = c;
    // Hydrate from localStorage so repeated visits skip API calls.
    try {
      const raw = localStorage.getItem(`tf360_trans_${target}`);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, string>;
        Object.entries(obj).forEach(([k, v]) => c!.set(k, v));
      }
    } catch {}
  }
  return c;
}

let saveTimer: number | null = null;
function persistCacheSoon(target: Target) {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const c = memCache[target];
    if (!c) return;
    const obj: Record<string, string> = {};
    c.forEach((v, k) => { obj[k] = v; });
    try { localStorage.setItem(`tf360_trans_${target}`, JSON.stringify(obj)); } catch {}
  }, 700);
}

// ─── Translation call ──────────────────────────────────────────────────
async function translateOne(text: string, target: Target): Promise<string> {
  if (target === 'en') return text;
  const cache = getCache(target);
  const cached = cache.get(text);
  if (cached) return cached;

  // Dedupe — if the same text is already in-flight, wait on it.
  inflight[target] = inflight[target] || new Map<string, Promise<string>>();
  const existing = inflight[target].get(text);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const data = await res.json();
      const translated: string =
        data?.responseData?.translatedText && typeof data.responseData.translatedText === 'string'
          ? data.responseData.translatedText
          : text;
      cache.set(text, translated);
      persistCacheSoon(target);
      return translated;
    } catch {
      return text;
    } finally {
      inflight[target].delete(text);
    }
  })();
  inflight[target].set(text, promise);
  return promise;
}

// ─── Text-node collection ──────────────────────────────────────────────
function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.textContent;
      if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' ||
          tag === 'CODE' || tag === 'PRE') return NodeFilter.FILTER_REJECT;
      if (parent.closest('[translate="no"], .notranslate')) return NodeFilter.FILTER_REJECT;
      // Skip nodes we already translated to current target.
      if ((node as any)._tf360Lang === activeTarget) return NodeFilter.FILTER_REJECT;
      // Skip text that's just symbols / numbers / punctuation.
      if (!/[A-Za-zÀ-ſ]{2,}/.test(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

// Snapshot the original English text on a node the first time we touch it
// so we can restore it when the user picks 'en' again.
function snapshotOriginal(node: Text) {
  if (!(node as any)._tf360Original) {
    (node as any)._tf360Original = node.textContent;
  }
}

// ─── Public API ────────────────────────────────────────────────────────
export async function setDocumentLanguage(target: Target): Promise<void> {
  activeTarget = target;
  document.documentElement.lang = target;

  if (target === 'en') {
    withObserverSuspended(() => {
      document.querySelectorAll('*').forEach((el) => {
        el.childNodes.forEach((child) => {
          if (child.nodeType === 3) {
            const orig = (child as any)._tf360Original;
            if (typeof orig === 'string') {
              (child as Text).textContent = orig;
              (child as any)._tf360Lang = 'en';
            }
          }
        });
      });
    });
    installObserver();
    return;
  }

  installObserver();
  await translateSubtree(document.body, target);
}

async function translateSubtree(root: Node, target: Target): Promise<void> {
  const nodes = collectTextNodes(root);
  if (nodes.length === 0) return;

  // Apply cached translations synchronously first (avoids visible flash).
  const cache = getCache(target);
  const toFetch: Text[] = [];
  withObserverSuspended(() => {
    for (const node of nodes) {
      snapshotOriginal(node);
      const original = (node as any)._tf360Original as string;
      const trimmed = original.trim();
      const cached = cache.get(trimmed);
      if (cached) {
        const lead = original.match(/^\s*/)?.[0] ?? '';
        const tail = original.match(/\s*$/)?.[0] ?? '';
        node.textContent = lead + cached + tail;
        (node as any)._tf360Lang = target;
      } else {
        toFetch.push(node);
      }
    }
  });

  // Fetch missing translations in parallel batches.
  const BATCH = 8;
  for (let i = 0; i < toFetch.length; i += BATCH) {
    if (activeTarget !== target) return; // user switched language mid-flight
    const slice = toFetch.slice(i, i + BATCH);
    const results = await Promise.all(slice.map(async (node) => {
      const original = (node as any)._tf360Original as string;
      const trimmed = original.trim();
      const translated = await translateOne(trimmed, target);
      return { node, original, translated };
    }));
    if (activeTarget !== target) return;
    withObserverSuspended(() => {
      for (const { node, original, translated } of results) {
        const lead = original.match(/^\s*/)?.[0] ?? '';
        const tail = original.match(/\s*$/)?.[0] ?? '';
        node.textContent = lead + translated + tail;
        (node as any)._tf360Lang = target;
      }
    });
  }
}

// ─── Mutation observer — translates new content as it appears ──────────
let scheduled: number | null = null;
const pending = new Set<Node>();
let observer: MutationObserver | null = null;
// Set to true while we are writing translations to the DOM so the
// observer ignores those self-induced mutations (otherwise it would
// loop forever).
let suspended = false;

export function withObserverSuspended<T>(fn: () => T): T {
  suspended = true;
  try { return fn(); } finally {
    // Re-arm on next frame so any pending characterData events from our
    // own writes are flushed before we listen again.
    window.requestAnimationFrame(() => { suspended = false; });
  }
}

function installObserver() {
  if (observerInstalled) return;
  observerInstalled = true;
  observer = new MutationObserver((records) => {
    if (suspended) return;
    if (activeTarget === 'en') return;
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n.nodeType === 1 || n.nodeType === 3) pending.add(n);
      });
      if (r.type === 'characterData' && r.target.nodeType === 3) {
        const tn = r.target as Text;
        // Only re-translate if the node is now in its original English.
        if ((tn as any)._tf360Lang === activeTarget) continue;
        delete (tn as any)._tf360Original;
        pending.add(tn);
      }
    }
    if (pending.size === 0) return;
    if (scheduled) window.cancelAnimationFrame(scheduled);
    scheduled = window.requestAnimationFrame(async () => {
      const batch = Array.from(pending);
      pending.clear();
      scheduled = null;
      for (const node of batch) {
        if (!document.contains(node)) continue;
        await translateSubtree(node, activeTarget);
      }
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
