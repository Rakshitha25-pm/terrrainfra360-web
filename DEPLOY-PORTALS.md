# Deploy Vendor & Contractor portals (one time) — then they're always live, no gitbash ever

Goal: put the **real** vendor-web and contractor-web apps online once, so the
website's Vendor/Contractor buttons open them with **nothing to run locally**.

Both apps now carry their own Firebase (tf360-360) config, so they work on any
host with **no env setup**.

---

## Option A — Vercel (easiest, free, recommended)

Do this once per app. (Vercel is the simplest host for Next.js.)

1. Install the CLI (once):
   ```
   npm i -g vercel
   ```

2. Deploy **vendor-web**:
   ```
   cd C:\Users\Ruchitha\TI360-Application-\vendor-web
   vercel --prod
   ```
   - First time it asks you to log in and confirm a few prompts (just accept defaults).
   - When it finishes it prints a URL like `https://vendor-web-xxxx.vercel.app`. Copy it.

3. Deploy **contractor-web** (new terminal or same):
   ```
   cd C:\Users\Ruchitha\TI360-Application-\contractor-web
   vercel --prod
   ```
   - Copy its URL, e.g. `https://contractor-web-xxxx.vercel.app`.

4. **Allow these domains in Firebase Auth** (so login works on the live apps):
   Firebase Console → project **tf360-360** → Authentication → Settings →
   Authorized domains → **Add domain** → paste each vercel.app domain.

5. Point the website at the live URLs — edit
   `C:\Users\Ruchitha\Downloads\TerraInfra360-complete\rakshithapm-new-web\.env.local`
   and add (use YOUR URLs):
   ```
   VITE_VENDOR_PORTAL_URL=https://vendor-web-xxxx.vercel.app/login
   VITE_CONTRACTOR_PORTAL_URL=https://contractor-web-xxxx.vercel.app/auth/login
   ```

6. Restart the website (`npm run dev`). Done — clicking Vendor/Contractor now
   opens the live real apps embedded in the site. Nothing to start, ever.

To publish later changes: re-run `vercel --prod` in that app's folder.

---

## Option B — Firebase Hosting (your existing project)

Uses tf360-360. Next.js SSR on Firebase needs the **Blaze** (pay-as-you-go)
plan; the free tier usually covers light use.

1. Install + log in (once):
   ```
   npm i -g firebase-tools
   firebase login
   firebase experiments:enable webframeworks
   ```

2. For **each** app folder (`vendor-web`, then `contractor-web`):
   ```
   cd C:\Users\Ruchitha\TI360-Application-\vendor-web
   firebase init hosting
   ```
   - "Use an existing project" → **tf360-360**
   - When it detects Next.js, accept building/deploying the web framework
   - Then:
   ```
   firebase deploy --only hosting
   ```
   - Copy the printed Hosting URL (e.g. `https://tf360-360.web.app` or a named site).

3. (Recommended) Give each app its own site so they don't collide:
   `firebase hosting:sites:create tf360-vendor` and
   `firebase hosting:sites:create tf360-contractor`, then target each in its
   `firebase.json`. Or just deploy them as two separate Firebase projects.

4. Authorized domains: the `*.web.app` domain is already authorized for its own
   project. If you use a custom domain, add it under Authentication → Settings.

5. Put the URLs in the website `.env.local` (same as Option A step 5), restart.

---

## After deploying

- The website's Vendor/Contractor buttons embed the **live real apps** — same
  data, all tabs, all features — with no local servers and no gitbash.
- You no longer need `start-all.bat` for the portals (still handy for local dev).
- I can't run the deploy for you (it needs your machine + your Firebase/Vercel
  login), but every step above is exact — send me the two URLs once you have
  them and I'll drop them into `.env.local` and verify the wiring.
