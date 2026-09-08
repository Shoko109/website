import { defineConfig } from 'astro/config';

// サイトのURL（canonical・OGP・サイトマップの元になります）。
// Cloudflare Pages の環境変数 SITE_URL を設定すると、そちらが使われます。
// 独自ドメインを取得したら SITE_URL を書き換えるだけでOKです。
//
// The canonical/OG/sitemap base URL. Set SITE_URL in the Cloudflare Pages
// dashboard (Settings → Environment variables) to override the default.
const site = process.env.SITE_URL || 'https://tsurukawa-piano.pages.dev';

export default defineConfig({
  site,
});
