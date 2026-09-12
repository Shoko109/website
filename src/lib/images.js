// CMSは画像のパスを src/data/*.json に文字列で保存します（例：
// "/src/images/uploads/hero-town.jpg"）。astro:assets の <Image> で
// 最適化（リサイズ・軽量化）するには、その文字列を実際に import した
// 画像データに変換する必要があります。この関数がその変換をします。
//
// 新しい画像フォルダを増やすときは、下の glob 対象を追記してください。
const uploads = import.meta.glob('/src/images/uploads/*', {
  eager: true,
  import: 'default',
});

// CMSで欄が空のまま保存された・外部URLが貼られた・アップロード後にファイルが
// 見つからない、などの場合でも、ビルドを失敗させずに fallback を返します
// （fallback を渡さない場合は null＝呼び出し側で普通の <img> を出せます）。
export function resolveImage(path, fallback = null) {
  if (!path) return fallback;
  // 保存され方によっては先頭の「/」が付かないことがあるので、そろえてから探します
  // （例："src/images/uploads/IMG_3195.jpeg" → "/src/images/uploads/IMG_3195.jpeg"）
  const key = path.startsWith('/') ? path : `/${path}`;
  return uploads[key] || fallback;
}
