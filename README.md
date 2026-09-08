# 鶴川はるな坂ピアノ教室 — Website

Astro static site for Tsurukawa Harunasaka Piano School with a small CMS at **`/admin`** (Sveltia CMS, Japanese UI) so Shoko can edit news, prices, testimonials, her profile, etc. herself. Hosts **free on Cloudflare Workers** (static assets). Japanese-only, mobile-friendly, local SEO for 鶴川 / 町田市金井.

## Structure

| Path | What it is |
|---|---|
| `src/data/*.json` | **All editable content** (news, pricing, texts) — this is what the CMS edits |
| `src/pages/` | The four pages: `index`, `profile`, `contact`, `thanks` |
| `src/layouts/Base.astro` | Shared head/sidebar/nav/footer + the `STEALTH` noindex flag |
| `public/admin/` | The CMS (`index.html` loads Sveltia CMS, `config.yml` defines the edit forms) |
| `public/` | `style.css`, `script.js`, `images/` (site chrome), `robots.txt`, `sitemap.xml`, `_headers` (all HTTP headers) |
| `src/images/uploads/` | **Photos uploaded through the CMS** — Astro resizes them to WebP at build time |
| `wrangler.toml`, `.node-version` | Cloudflare build config (Worker name + `dist/` as static assets) |
| `編集ガイド.md` | Editing guide for Shoko, in Japanese (how to use /admin) |

URLs are now directory-style: `/profile/`, `/contact/`, `/thanks/` (was `profile.html` etc.).

## Develop / build

Needs Node ≥ 18.17 (`nvm use 20` or newer; system node 16 is too old).

```bash
npm install
npm run dev      # local dev server
npm run build    # outputs to dist/
```

## Deploy + CMS setup (one-time)

The CMS is git-based: edits in `/admin` become commits to GitHub, which trigger a Cloudflare rebuild (~1–2 min). So the site **must** deploy via GitHub (not drag & drop).

**Current state**: the repo lives at **`dub-G/tsurukawa-harunasaka-piano`** (private, Luigi's account) and the CMS uses **access-token login** — no OAuth app needed. Long-term plan: transfer the repo to a GitHub account owned by Shoko (then just update `repo:` in `public/admin/config.yml`), so any future developer can help her without going through Luigi.

1. **Cloudflare Workers**: *Workers & Pages → Create → Import a repository* → pick the repo. (Cloudflare Pages is legacy now; this is a Worker that serves `dist/` as static assets — no Worker script.)
   - Worker name: **must match `name` in `wrangler.toml`** (`tsurukawa-harunasaka-piano`), or the deploy publishes to a different Worker
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (the default)
   - Node version: read automatically from `.node-version` (20)
   - Build variable `SITE_URL` — the canonical/OG/sitemap base URL. It must be a **build** variable, not a runtime one, because Astro reads it at build time. Defaults to `https://tsurukawa-harunasaka-piano.pages.dev`, so set it to the real `*.workers.dev` URL (or the custom domain once you have one).
2. **CMS login (access token)**: `/admin` shows **"Sign In Using Access Token"** because no OAuth app is configured. Create a token at GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens*:
   - Repository access: **only this repo**
   - Permissions → Repository permissions → **Contents: Read and write** (add **Pull requests: Read and write** only if you ever enable editorial workflow)
   - Set a long expiry (or no expiry) so Shoko isn't locked out unexpectedly
   - Paste the token into the sign-in dialog; the browser remembers it on that device.
3. **Contact form**: currently **disabled** — see below.

### Contact form (currently off)

Cloudflare has no equivalent of Netlify Forms, so `/contact/` shows the form greyed out behind a notice pointing at `tsurupia@gmail.com`. The switch is one line at the top of `src/pages/contact.astro`:

```js
const FORM_ENABLED = false;   // ← true to turn the form back on
```

Turning it on needs somewhere for submissions to go. The form already posts to `/api/contact`, so the shape is: give the Worker a script (`main` in `wrangler.toml`) that handles `POST /api/contact` and passes everything else to `env.ASSETS`, validate the fields plus the `bot-field` honeypot, relay to a mail service (Web3Forms, Formspree, Resend…) with the API key kept in a Worker secret, then redirect to `/thanks/`.

Optional later upgrade for one-button login ("Sign in with GitHub", no token to manage): create a GitHub OAuth app and point Sveltia at an OAuth proxy — this needs a small Worker, so the access token is the simpler option while the site is small.

Local CMS testing without deploying: open `npm run dev` site at `http://localhost:4321/admin/`, and use Sveltia's "Work with Local Repository" button (Chrome/Edge only) — it edits the files on disk directly.

## ⚠️ Site is currently in STEALTH MODE (test deploy)

Indexing is blocked at three layers:

1. `STEALTH = true` in `src/layouts/Base.astro` → `<meta name="robots" content="noindex…">` on every page
2. `X-Robots-Tag` header on every file, set in `public/_headers` (marked TEST DEPLOY ONLY — Cloudflare reads this file from `dist/`)
3. `public/robots.txt` — `Disallow: /` for all user agents

Preview builds from other branches get the same `_headers`, so they are noindexed too. If you want the test site *unreachable* rather than merely unindexed, put **Cloudflare Access** in front of the Worker (Zero Trust → Access → Applications) — a one-time email code before the site loads. `/admin` stays reachable behind it once you sign in.

### Before the REAL launch, undo all of it:

- [ ] Set `STEALTH = false` in `src/layouts/Base.astro` (thanks page and /admin stay noindexed automatically)
- [ ] Delete the `X-Robots-Tag` line from the `/*` block in `public/_headers` (keep the rest of the file — the `/admin/*` rule, the security headers and the cache rules all stay)
- [ ] Replace `public/robots.txt` contents with:
  ```
  User-agent: *
  Allow: /
  Disallow: /thanks/
  Disallow: /admin/

  Sitemap: https://YOUR-DOMAIN/sitemap.xml
  ```

## When you buy the custom domain

1. The Worker → *Settings → Domains & Routes* → add the domain (HTTPS automatic).
2. Set the `SITE_URL` build variable to the new URL and redeploy (canonical/OG/sitemap URLs derive from it — no code change needed).
3. Search-replace the old URL in `public/sitemap.xml` and `public/robots.txt`.

## SEO — in place / to do

In the code: location-keyworded titles/descriptions, JSON-LD (`MusicSchool` on home, `Person` on profile), OG tags, canonicals, sitemap, semantic headings, Japanese alt text, embedded map.

After launch (both free): **Google Business Profile** (biggest local-search win), **Google Search Console** (submit sitemap), and a link from the school's note.com profile.

## Images

Photos uploaded in `/admin` go to `src/images/uploads/` (set by `media_folder` in `public/admin/config.yml`), and every page renders them through `astro:assets`, which resizes them and converts to WebP at build time — the 2.5 MB photos straight off a phone ship as ~100 KB. `src/lib/images.js` maps the path stored in the JSON back to the imported image.

Only site chrome (`hero.jpg` for OG previews, `logo.png`, `rose-mark.svg`, favicons) lives in `public/images/` and is served as-is. **Don't put CMS photos there** — nothing resizes them.
