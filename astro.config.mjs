import { defineConfig } from 'astro/config';

// サイトのURL（canonical・OGP・サイトマップの元になります）。
// Cloudflare Pages の環境変数 SITE_URL を設定すると、そちらが使われます。
// 独自ドメインは shokomaedako.com です（2026年9月〜）。
//
// The canonical/OG/sitemap base URL. Set SITE_URL in the Cloudflare Pages
// dashboard (Settings → Environment variables) to override the default.
const site = process.env.SITE_URL || 'https://shokomaedako.com';

export default defineConfig({
  site,
});
