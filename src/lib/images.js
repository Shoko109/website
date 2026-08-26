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
// 見つからない、などの場合でも、ビルドを失敗させずに fallback の画像を
// 表示します（fallback は呼び出し側で必ず渡してください）。
export function resolveImage(path, fallback) {
  return (path && uploads[path]) || fallback;
}
