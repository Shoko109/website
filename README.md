# 鶴川はるな坂ピアノ教室 — Website

Astro static site for Tsurukawa Harunasaka Piano School with a small CMS at **`/admin`** (Sveltia CMS, Japanese UI) so Shoko can edit news, prices, testimonials, her profile, etc. herself. Hosts **free on Netlify**. Japanese-only, mobile-friendly, local SEO for 鶴川 / 町田市金井.

## Structure

| Path | What it is |
|---|---|
| `src/data/*.json` | **All editable content** (news, pricing, texts) — this is what the CMS edits |
| `src/pages/` | The four pages: `index`, `profile`, `contact`, `thanks` |
| `src/layouts/Base.astro` | Shared head/sidebar/nav/footer + the `STEALTH` noindex flag |
| `public/admin/` | The CMS (`index.html` loads Sveltia CMS, `config.yml` defines the edit forms) |
| `public/` | `style.css`, `script.js`, `images/`, `robots.txt`, `sitemap.xml`, `_headers` (unchanged from the static version) |
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

The CMS is git-based: edits in `/admin` become commits to GitHub, which trigger a Netlify rebuild (~1–2 min). So the site **must** deploy via GitHub (not drag & drop).

**Current state**: the repo lives at **`dub-G/tsurukawa-harunasaka-piano`** (private, Luigi's account) and the CMS uses **access-token login** — no OAuth app needed. Long-term plan: transfer the repo to a GitHub account owned by Shoko (then just update `repo:` in `public/admin/config.yml`), so any future developer can help her without going through Luigi.

1. **Netlify**: *Add new site → Import from Git* → pick the repo. Build command `npm run build`, publish `dist` (already in `netlify.toml`).
2. **CMS login (access token)**: `/admin` shows **"Sign In Using Access Token"** because no OAuth app is configured. Create a token at GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens*:
   - Repository access: **only this repo**
   - Permissions → Repository permissions → **Contents: Read and write** (add **Pull requests: Read and write** only if you ever enable editorial workflow)
   - Set a long expiry (or no expiry) so Shoko isn't locked out unexpectedly
   - Paste the token into the sign-in dialog; the browser remembers it on that device.
3. **Contact form**: after first deploy, *Site → Forms → contact → Notifications* → add email notification to `tsurupia@gmail.com`. Free tier: 100 submissions/month.

Optional later upgrade for one-button login ("Sign in with GitHub", no token to manage): create a GitHub OAuth app (callback `https://api.netlify.com/auth/done`) and install it under Netlify → *Access & security → OAuth*.

Local CMS testing without deploying: open `npm run dev` site at `http://localhost:4321/admin/`, and use Sveltia's "Work with Local Repository" button (Chrome/Edge only) — it edits the files on disk directly.

## ⚠️ Site is currently in STEALTH MODE (test deploy)

Indexing is blocked at three layers:

1. `STEALTH = true` in `src/layouts/Base.astro` → `<meta name="robots" content="noindex…">` on every page
2. `X-Robots-Tag` header on every file, set in **both** `public/_headers` and `netlify.toml` (marked TEST DEPLOY ONLY)
3. `public/robots.txt` — `Disallow: /` for all user agents

### Before the REAL launch, undo all of it:

- [ ] Set `STEALTH = false` in `src/layouts/Base.astro` (thanks page and /admin stay noindexed automatically)
- [ ] Delete `public/_headers`
- [ ] Delete the marked `[[headers]]` X-Robots-Tag `/*` block from `netlify.toml` (keep the `/admin/*` one)
- [ ] Replace `public/robots.txt` contents with:
  ```
  User-agent: *
  Allow: /
  Disallow: /thanks/
  Disallow: /admin/

  Sitemap: https://YOUR-DOMAIN/sitemap.xml
  ```

## When you buy the custom domain

1. Netlify → *Domain management* → add the domain (HTTPS automatic).
2. Change the `site:` URL in `astro.config.mjs` (canonical/OG URLs derive from it).
3. Search-replace the old URL in `public/sitemap.xml` and `public/robots.txt`.

## SEO — in place / to do

In the code: location-keyworded titles/descriptions, JSON-LD (`MusicSchool` on home, `Person` on profile), OG tags, canonicals, sitemap, semantic headings, Japanese alt text, embedded map.

After launch (both free): **Google Business Profile** (biggest local-search win), **Google Search Console** (submit sitemap), and a link from her note.com profile.
