# 鶴川はるな坂ピアノ教室 — Website

Astro static site for Tsurukawa Harunasaka Piano School with a small CMS at **`/admin`** (Sveltia CMS, Japanese UI) so Shoko can edit news, prices, testimonials, her profile, etc. herself. Hosts **free on Cloudflare Pages**. Japanese-only, mobile-friendly, local SEO for 鶴川 / 町田市金井.

## Structure

| Path | What it is |
|---|---|
| `src/data/*.json` | **All editable content** (news, pricing, texts) — this is what the CMS edits |
| `src/pages/` | The four pages: `index`, `profile`, `contact`, `thanks` |
| `src/layouts/Base.astro` | Shared head/sidebar/nav/footer + the `STEALTH` noindex flag |
| `public/admin/` | The CMS (`index.html` loads Sveltia CMS, `config.yml` defines the edit forms) |
| `public/` | `style.css`, `script.js`, `images/` (site chrome), `robots.txt`, `sitemap.xml`, `_headers` (all HTTP headers) |
| `src/images/uploads/` | **Photos uploaded through the CMS** — Astro resizes them to WebP at build time |
| `wrangler.toml`, `.node-version` | Cloudflare Pages build config |
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

The CMS is git-based: edits in `/admin` become commits to GitHub, which trigger a Cloudflare Pages rebuild (~1–2 min). So the site **must** deploy via GitHub (not drag & drop).

**Current state**: the repo lives at **`dub-G/tsurukawa-harunasaka-piano`** (private, Luigi's account) and the CMS uses **access-token login** — no OAuth app needed. Long-term plan: transfer the repo to a GitHub account owned by Shoko (then just update `repo:` in `public/admin/config.yml`), so any future developer can help her without going through Luigi.

1. **Cloudflare Pages**: *Workers & Pages → Create → Pages → Connect to Git* → pick the repo.
   - Framework preset: **Astro** (or set it manually)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: read automatically from `.node-version` (20)
   - Optional env var `SITE_URL` (Settings → Variables) — the canonical/OG/sitemap base URL. Defaults to the live site, `https://tsurukawa-piano.pages.dev`; set it only when a custom domain arrives, for **Production and Preview**.
2. **CMS login (access token)**: `/admin` shows **"Sign In Using Access Token"** because no OAuth app is configured. Create a token at GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens*:
   - Repository access: **only this repo**
   - Permissions → Repository permissions → **Contents: Read and write** (add **Pull requests: Read and write** only if you ever enable editorial workflow)
   - Set a long expiry (or no expiry) so Shoko isn't locked out unexpectedly
   - Paste the token into the sign-in dialog; the browser remembers it on that device.
3. **Contact form**: currently **disabled** — see below.

### Contact form (currently off)

Cloudflare Pages has no equivalent of Netlify Forms, so `/contact/` shows the form greyed out behind a notice pointing at `tsurupia@gmail.com`. The switch is one line at the top of `src/pages/contact.astro`:

```js
const FORM_ENABLED = false;   // ← true to turn the form back on
```

Turning it on needs somewhere for submissions to go. The form already posts to `/api/contact`, so the shape is: add `functions/api/contact.js` (a Pages Function — Cloudflare picks up a top-level `functions/` directory automatically), validate the fields plus the `bot-field` honeypot, relay to a mail service (Web3Forms, Formspree, Resend…) with the API key kept in a Cloudflare env var, then redirect to `/thanks/`.

Optional later upgrade for one-button login ("Sign in with GitHub", no token to manage): create a GitHub OAuth app and point Sveltia at an OAuth proxy — this needs a small Worker, so the access token is the simpler option while the site is small.

Local CMS testing without deploying: open `npm run dev` site at `http://localhost:4321/admin/`, and use Sveltia's "Work with Local Repository" button (Chrome/Edge only) — it edits the files on disk directly.

## Live since September 2026 (stealth mode is OFF)

The site is public at **https://shokomaedako.com** and open to all crawlers, search engines and AI assistants alike.

Indexing is controlled in three places. All three must agree — changing one alone does nothing:

1. `STEALTH` in `src/layouts/Base.astro` — now `false`. When `true`, every page gets `<meta name="robots" content="noindex…">`.
2. `public/_headers` — the `X-Robots-Tag` line in the `/*` block is gone. The `/admin/*` block still carries its own, so the CMS stays unindexed forever.
3. `public/robots.txt` — a single `User-agent: *` group allowing everything except `/admin/`, plus the `Sitemap:` pointer. AI crawlers are covered by that one group; **do not add per-bot blocks**. A crawler obeys only the most specific group matching its own name and inherits nothing from `*`, so naming GPTBot or ClaudeBot would quietly grant them the `/admin/` access the wildcard group denies.

`/thanks/` and `/business-card/` stay out of search through their own `noindex={true}` prop, and they are deliberately **not** listed in `robots.txt` — a `Disallow` would stop crawlers fetching the page and so stop them ever reading the `noindex`.

### To hide the site again

Reverse all three: `STEALTH = true`, put `X-Robots-Tag: noindex, nofollow` back in the `/*` block, and swap `robots.txt` for `User-agent: *` / `Disallow: /`. To make it *unreachable* rather than merely unindexed, add **Cloudflare Access** (Pages project → Settings → General → *Access policy*).

## The custom domain

The site runs on **shokomaedako.com** (apex, no `www`). That URL is the default `site` value in `astro.config.mjs`, so canonical tags, OG tags and the sitemap all derive from it with no env var needed.

The `SITE_URL` env var in the Cloudflare Pages dashboard still overrides the default if it is set. Leave it unset unless the domain changes again — a stale `SITE_URL` silently poisons every canonical tag on the site, which is exactly what happened before launch.

## SEO — in place / to do

In the code: location-keyworded titles/descriptions, JSON-LD (`MusicSchool` on home, `Person` on profile), OG tags, canonicals, sitemap, semantic headings, Japanese alt text, embedded map.

Still to do, all free and all off-site: **Google Business Profile** (biggest local-search win by far for a neighbourhood piano school), **Google Search Console** (verify the domain, submit `https://shokomaedako.com/sitemap.xml`), **Bing Webmaster Tools**, and a link back from the school's note.com profile.

One Cloudflare setting to check: since 2025 Cloudflare blocks AI crawlers by default on some new zones. If AI assistants should be able to read the site, confirm **Security → Bots → AI Scrapers and Crawlers** is set to *off* (allow) for this domain — `robots.txt` says yes, but a Cloudflare block overrules it at the edge.

## Images

Photos uploaded in `/admin` go to `src/images/uploads/` (set by `media_folder` in `public/admin/config.yml`), and every page renders them through `astro:assets`, which resizes them and converts to WebP at build time — the 2.5 MB photos straight off a phone ship as ~100 KB. `src/lib/images.js` maps the path stored in the JSON back to the imported image.

Only site chrome (`hero.jpg` for OG previews, `logo.png`, `rose-mark.svg`, favicons) lives in `public/images/` and is served as-is. **Don't put CMS photos there** — nothing resizes them.
