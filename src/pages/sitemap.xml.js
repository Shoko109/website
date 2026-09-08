// サイトマップ（検索エンジン向けのページ一覧）を、ビルド時に自動で作ります。
// URL は astro.config.mjs の site（＝環境変数 SITE_URL）から作られるので、
// 独自ドメインに変えても、ここを直す必要はありません。
//
// Generated from Astro.site, so the URLs follow SITE_URL automatically.
// /thanks/ と /business-card/ は載せません（検索結果に出したくないページ）。
const pages = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/profile/', changefreq: 'yearly', priority: '0.8' },
  { path: '/concerts/', changefreq: 'monthly', priority: '0.7' },
  { path: '/lessons/', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact/', changefreq: 'yearly', priority: '0.9' },
];

export function GET({ site }) {
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${new URL(p.path, site).href}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
