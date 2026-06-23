/**
 * Thin client for the TF360 AI service — same one the Flutter app uses.
 * Hits `/v1/generate-product` (the vendor-web shape) for an AI-written
 * property description.
 *
 * Currently in DEMO MODE: skips the network call and returns a smart locally
 * generated description with a 2-3s fake delay so it feels like an AI call.
 * Flip `_demoMode = false` once the production endpoint is reachable.
 */
import { auth } from '../../../lib/firebase';

const DEFAULT_BASE = 'https://ai.tf360.com';
const BASE = (import.meta.env.VITE_AI_SERVICE_URL as string) || DEFAULT_BASE;
const TIMEOUT_MS = 60_000;

const _demoMode = true;

export type AiResult =
  | { ok: true; description: string; cached?: boolean }
  | { ok: false; code: string; message: string };

export interface PropertyInputs {
  listingPurpose?: string;
  propertyCategory?: string;
  propertySubType?: string;
  areaName?: string;
  pincode?: string;
  bhk?: string;
  amenities?: string[];
  numberOfOwners?: number;
  finalPrice?: number;
  priceUnit?: string;
}

/** Build a single descriptive sentence the AI can riff on. */
function composePromptSentence(p: PropertyInputs): string {
  const bits: string[] = [];
  if (p.propertySubType) bits.push(p.propertySubType);
  if (p.bhk) bits.push(p.bhk);
  if (p.propertyCategory) bits.push(`(${p.propertyCategory})`);
  if (p.areaName) bits.push(`in ${p.areaName}`);
  if (p.pincode) bits.push(`(${p.pincode})`);
  if (p.listingPurpose) bits.push(`for ${p.listingPurpose}`);
  if (p.amenities && p.amenities.length) {
    bits.push(`with ${p.amenities.slice(0, 5).join(', ')}`);
  }
  return bits.join(' ').trim() || 'Premium property listing';
}

function demoCopy(p: PropertyInputs): string {
  const sub = p.propertySubType || 'property';
  const area = p.areaName || 'a prime locality';
  const purpose = p.listingPurpose || 'sale';
  const amenLine =
    p.amenities && p.amenities.length
      ? ` Highlights include ${p.amenities.slice(0, 5).join(', ')}.`
      : '';
  const closer =
    purpose === 'rent'
      ? 'Ready to move in — schedule a visit today.'
      : purpose === 'lease'
        ? 'Flexible lease terms available for serious buyers.'
        : 'A rare opportunity at this price point — verified ownership.';
  return [
    `A meticulously crafted ${sub.toLowerCase()} in ${area}, offering refined living with a focus on space, light, and proportion.`,
    `Designed for modern lifestyles, the layout balances private quiet zones with generous social spaces.${amenLine}`,
    closer,
  ].join('\n\n');
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateDescription(
  inputs: PropertyInputs,
  bypassCache = false,
): Promise<AiResult> {
  if (_demoMode) {
    await delay(2000 + Math.random() * 1000);
    return { ok: true, description: demoCopy(inputs), cached: !bypassCache };
  }

  const user = auth.currentUser;
  if (!user) {
    return {
      ok: false,
      code: 'NOT_AUTHENTICATED',
      message: 'Please log in again.',
    };
  }
  let idToken = '';
  try {
    idToken = await user.getIdToken();
    if (!idToken) throw new Error('empty token');
  } catch {
    return {
      ok: false,
      code: 'TOKEN_FAILED',
      message: 'Could not refresh your session.',
    };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/v1/generate-product`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        productName: composePromptSentence(inputs),
        bypassCache,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        code: `HTTP_${res.status}`,
        message: `AI service responded ${res.status}`,
      };
    }
    const data = (await res.json()) as { description?: string; cached?: boolean };
    if (!data.description) {
      return { ok: false, code: 'EMPTY', message: 'No description returned.' };
    }
    return { ok: true, description: data.description, cached: data.cached };
  } catch (e) {
    return {
      ok: false,
      code: 'NETWORK',
      message: (e as Error).message || 'Network error.',
    };
  } finally {
    clearTimeout(t);
  }
}
