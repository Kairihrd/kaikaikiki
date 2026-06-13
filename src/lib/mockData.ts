// ============================================================================
// Billdist — モックデータ
// ----------------------------------------------------------------------------
// MVP段階ではここからデータを読み込む。後で Supabase / API に差し替えやすいよう、
// データ取得は getXxx() 関数経由で行う(中身を fetch に変えるだけで移行できる)。
// ============================================================================

export type ArtworkSize = "small" | "medium" | "large" | "wide" | "tall";

export type Genre =
  | "写真"
  | "デジタルアート"
  | "イラスト"
  | "建築"
  | "音楽"
  | "映像"
  | "ファッション"
  | "彫刻"
  | "パフォーマンス";

export interface Artwork {
  id: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  imageUrl: string;
  genre: Genre;
  theme: string;
  description: string;
  likes: number;
  comments: number;
  isVideo: boolean;
  isAudio: boolean;
  tags: string[];
  size: ArtworkSize;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  location: string;
  role: string;
  supporterCount: number;
}

export interface Comment {
  id: string;
  handle: string;
  body: string;
}

// ----------------------------------------------------------------------------
// 画像ヘルパー
// 信頼性のある picsum.photos をシード付きで使用(デモ中に画像が確実に表示される)。
// 後で実画像 URL に差し替え可能。
// ----------------------------------------------------------------------------
const img = (seed: string, w = 600, h = 800, grayscale = false) =>
  `https://picsum.photos/seed/billdist-${seed}/${w}/${h}${grayscale ? "?grayscale" : ""}`;

const avatar = (seed: string) =>
  `https://picsum.photos/seed/billdist-avatar-${seed}/200/200`;

// 月間テーマ
export const CURRENT_THEME = "境界";

// ----------------------------------------------------------------------------
// メイン作品(仕様で指定された「静寂の入口 / カナタ」)
// ----------------------------------------------------------------------------
export const FEATURED_ARTWORK: Artwork = {
  id: "1",
  title: "静寂の入口",
  creatorName: "カナタ",
  creatorHandle: "@kanata__photo",
  imageUrl: img("featured", 1000, 1300),
  genre: "写真",
  theme: "境界",
  description:
    "誰もいない世界の、誰かのための入口。\n光の先にあるものを、想像してみる。",
  likes: 1834,
  comments: 28,
  isVideo: false,
  isAudio: true,
  tags: ["#写真", "#建築", "#モノクロ", "#光と影"],
  size: "large",
};

export const FEATURED_CREATOR: Creator = {
  id: "1",
  name: "カナタ",
  handle: "@kanata__photo",
  avatarUrl: avatar("kanata"),
  bio: "光の先にあるものを、想像してみる。",
  location: "19歳・東京",
  role: "写真家 / 大学生",
  supporterCount: 1400,
};

export const FEATURED_COMMENTS: Comment[] = [
  {
    id: "c1",
    handle: "sora",
    body: "まるで別世界に続いているみたい…すごく惹き込まれました。",
  },
  {
    id: "c2",
    handle: "mugi",
    body: "構図と光のバランスが最高です。壁の質感も好き。",
  },
  { id: "c3", handle: "reo", body: "自分もこんな写真を撮ってみたい。" },
];

// ----------------------------------------------------------------------------
// 作品データ(メイン1件 + 追加48件 = 49件)
// ----------------------------------------------------------------------------
interface Seed {
  title: string;
  name: string;
  handle: string;
  genre: Genre;
  isVideo?: boolean;
  isAudio?: boolean;
  tags: string[];
}

const SEEDS: Seed[] = [
  { title: "夜明けの残響", name: "ユウキ", handle: "@yuki_visuals", genre: "映像", isVideo: true, tags: ["#映像", "#夜明け"] },
  { title: "都市の輪郭", name: "レン", handle: "@ren_arch", genre: "建築", tags: ["#建築", "#都市"] },
  { title: "色のない庭", name: "ミオ", handle: "@mio_paints", genre: "イラスト", tags: ["#イラスト", "#庭"] },
  { title: "重力の手紙", name: "ソウ", handle: "@sou_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#アンビエント"] },
  { title: "皮膚と空", name: "アヤ", handle: "@aya_mode", genre: "ファッション", tags: ["#ファッション", "#空"] },
  { title: "石の記憶", name: "タケル", handle: "@takeru_sculpt", genre: "彫刻", tags: ["#彫刻", "#石"] },
  { title: "境界線上のダンス", name: "ノア", handle: "@noa_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#身体"] },
  { title: "群青の窓", name: "ハル", handle: "@haru_photo", genre: "写真", tags: ["#写真", "#青"] },
  { title: "電子の海", name: "カイ", handle: "@kai_digital", genre: "デジタルアート", tags: ["#デジタル", "#海"] },
  { title: "無音のコーラス", name: "リン", handle: "@rin_voice", genre: "音楽", isAudio: true, tags: ["#音楽", "#声"] },
  { title: "折りたたまれた光", name: "ジン", handle: "@jin_arch", genre: "建築", tags: ["#建築", "#光"] },
  { title: "彼方のフレーム", name: "ミナ", handle: "@mina_film", genre: "映像", isVideo: true, tags: ["#映像", "#旅"] },
  { title: "余白の肖像", name: "トウマ", handle: "@toma_paint", genre: "イラスト", tags: ["#イラスト", "#余白"] },
  { title: "錆びた約束", name: "エマ", handle: "@ema_photo", genre: "写真", tags: ["#写真", "#廃墟"] },
  { title: "透明な重さ", name: "シオン", handle: "@shion_sculpt", genre: "彫刻", tags: ["#彫刻", "#ガラス"] },
  { title: "輪郭のない服", name: "ナギ", handle: "@nagi_mode", genre: "ファッション", tags: ["#ファッション", "#白"] },
  { title: "深夜の信号", name: "リク", handle: "@riku_digital", genre: "デジタルアート", tags: ["#デジタル", "#夜"] },
  { title: "風の譜面", name: "コト", handle: "@koto_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#風"] },
  { title: "立ち止まる影", name: "アオイ", handle: "@aoi_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#影"] },
  { title: "硝子の街", name: "セナ", handle: "@sena_arch", genre: "建築", tags: ["#建築", "#硝子"] },
  { title: "朝の温度", name: "ヒナ", handle: "@hina_photo", genre: "写真", tags: ["#写真", "#朝"] },
  { title: "粒子の庭園", name: "タイガ", handle: "@taiga_digital", genre: "デジタルアート", tags: ["#デジタル", "#粒子"] },
  { title: "ほどけた線", name: "マオ", handle: "@mao_illust", genre: "イラスト", tags: ["#イラスト", "#線"] },
  { title: "海鳴りの記譜", name: "ナル", handle: "@naru_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#海"] },
  { title: "重なる時間", name: "イオ", handle: "@io_film", genre: "映像", isVideo: true, tags: ["#映像", "#時間"] },
  { title: "白い境界", name: "ケイ", handle: "@kei_photo", genre: "写真", tags: ["#写真", "#雪"] },
  { title: "沈黙のドレス", name: "ルナ", handle: "@luna_mode", genre: "ファッション", tags: ["#ファッション", "#黒"] },
  { title: "金属の祈り", name: "ガク", handle: "@gaku_sculpt", genre: "彫刻", tags: ["#彫刻", "#金属"] },
  { title: "夢の解像度", name: "ソラ", handle: "@sora_digital", genre: "デジタルアート", tags: ["#デジタル", "#夢"] },
  { title: "踊る建築", name: "ダン", handle: "@dan_arch", genre: "建築", tags: ["#建築", "#曲線"] },
  { title: "光の通り道", name: "ミク", handle: "@miku_photo", genre: "写真", tags: ["#写真", "#光"] },
  { title: "余韻のスケッチ", name: "リョウ", handle: "@ryo_illust", genre: "イラスト", tags: ["#イラスト", "#余韻"] },
  { title: "境界のリズム", name: "ジェイ", handle: "@jay_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#リズム"] },
  { title: "消えゆく舞台", name: "サキ", handle: "@saki_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#舞台"] },
  { title: "霧のインスタレーション", name: "ノエル", handle: "@noel_sculpt", genre: "彫刻", tags: ["#彫刻", "#霧"] },
  { title: "深呼吸する街", name: "ハク", handle: "@haku_film", genre: "映像", isVideo: true, tags: ["#映像", "#街"] },
  { title: "未完成の空", name: "ナナ", handle: "@nana_photo", genre: "写真", tags: ["#写真", "#空"] },
  { title: "縫い目の宇宙", name: "ヴィヴ", handle: "@viv_mode", genre: "ファッション", tags: ["#ファッション", "#宇宙"] },
  { title: "電光のスケッチ", name: "ゲン", handle: "@gen_digital", genre: "デジタルアート", tags: ["#デジタル", "#電光"] },
  { title: "静けさの設計", name: "アサ", handle: "@asa_arch", genre: "建築", tags: ["#建築", "#静寂"] },
  { title: "遠い拍動", name: "モモ", handle: "@momo_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#鼓動"] },
  { title: "ひかりの破片", name: "テオ", handle: "@teo_photo", genre: "写真", tags: ["#写真", "#破片"] },
  { title: "境界を編む", name: "ユイ", handle: "@yui_illust", genre: "イラスト", tags: ["#イラスト", "#編む"] },
  { title: "重力のない部屋", name: "リオ", handle: "@rio_film", genre: "映像", isVideo: true, tags: ["#映像", "#無重力"] },
  { title: "石膏の呼吸", name: "クウ", handle: "@kuu_sculpt", genre: "彫刻", tags: ["#彫刻", "#石膏"] },
  { title: "夜を着る", name: "メイ", handle: "@mei_mode", genre: "ファッション", tags: ["#ファッション", "#夜"] },
  { title: "輪郭の音楽", name: "シュン", handle: "@shun_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#輪郭"] },
  { title: "見えない振付", name: "ライ", handle: "@rai_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#振付"] },
];

// 決定論的にサイズを割り当てる(乱数を使わず、起動毎にレイアウトが安定する)。
// 大きいカードを散りばめてモザイク感を出す。
const pickSize = (i: number): ArtworkSize => {
  if (i % 11 === 0) return "large";
  if (i % 7 === 0) return "wide";
  if (i % 5 === 0) return "tall";
  if (i % 3 === 0) return "medium";
  return "small";
};

// モノクロ表示にすると相性の良いジャンル(写真・建築・彫刻)。
// これに加えて一定間隔でもグレースケールにし、カラー/モノクロを混在させて
// 風景写真ばかりに見えないよう見た目のバリエーションを出す。
const GRAY_GENRES: Genre[] = ["写真", "建築", "彫刻"];

const GENERATED: Artwork[] = SEEDS.map((s, idx) => {
  const i = idx + 2; // id=1 は featured
  // seed をハンドル(ascii)ベースにして、毎回バラけた画像になるようにする。
  const seed = `${s.handle.replace(/[@_]/g, "")}-${i}`;
  const grayscale = GRAY_GENRES.includes(s.genre) || idx % 5 === 2;
  // ジャンルごとに少し縦横比を変えて、サムネイルの雰囲気を散らす。
  const tall = idx % 3 === 0;
  return {
    id: String(i),
    title: s.title,
    creatorName: s.name,
    creatorHandle: s.handle,
    imageUrl: img(seed, 600, tall ? 820 : 600, grayscale),
    genre: s.genre,
    theme: CURRENT_THEME,
    description: `${s.title} — ${s.genre}の視点から「${CURRENT_THEME}」を描いた一枚。`,
    likes: 120 + ((i * 137) % 1900),
    comments: 3 + ((i * 17) % 90),
    isVideo: s.isVideo ?? false,
    isAudio: s.isAudio ?? false,
    tags: s.tags,
    size: pickSize(idx),
  };
});

export const ARTWORKS: Artwork[] = [FEATURED_ARTWORK, ...GENERATED];

// ----------------------------------------------------------------------------
// データ取得関数(後で Supabase / API に差し替える窓口)
// ----------------------------------------------------------------------------
export function getTodaysArtworks(): Artwork[] {
  return ARTWORKS;
}

export function getThemeArtworks(theme: string = CURRENT_THEME): Artwork[] {
  return ARTWORKS.filter((a) => a.theme === theme);
}

export function getArtworkById(id: string): Artwork | undefined {
  return ARTWORKS.find((a) => a.id === id);
}

export function getCreatorByHandle(handle: string): Creator {
  if (handle === FEATURED_CREATOR.handle) return FEATURED_CREATOR;
  const art = ARTWORKS.find((a) => a.creatorHandle === handle);
  return {
    id: art?.id ?? "0",
    name: art?.creatorName ?? "Unknown",
    handle,
    avatarUrl: avatar(handle.replace(/[@_]/g, "")),
    bio: "境界を越えていく。",
    location: "東京",
    role: "クリエイター",
    supporterCount: 200 + ((Number(art?.id ?? 0) * 91) % 1800),
  };
}

export function getCommentsForArtwork(id: string): Comment[] {
  if (id === FEATURED_ARTWORK.id) return FEATURED_COMMENTS;
  return [
    { id: `${id}-c1`, handle: "sora", body: "色の使い方がすごく好きです。" },
    { id: `${id}-c2`, handle: "mugi", body: "この世界観に引き込まれました。" },
  ];
}

// 応援(サポート/フォロー)しているクリエイターのハンドル
export const SUPPORTING_HANDLES = [
  "@yuki_visuals",
  "@ren_arch",
  "@mio_paints",
  "@aya_mode",
  "@kai_digital",
];

// サポーター中ページ用: 応援しているクリエイター数名
export function getSupportingCreators(): Creator[] {
  return SUPPORTING_HANDLES.map((h) => getCreatorByHandle(h));
}

// タイムライン「おすすめ」: 注目度(いいね数)の高い順
export function getRecommendedArtworks(): Artwork[] {
  return [...ARTWORKS].sort((a, b) => b.likes - a.likes);
}

// タイムライン「フォロー」: フォロー/サポート中クリエイターの作品
export function getFollowingArtworks(): Artwork[] {
  return ARTWORKS.filter((a) => SUPPORTING_HANDLES.includes(a.creatorHandle));
}

export const GENRES: Genre[] = [
  "写真",
  "デジタルアート",
  "イラスト",
  "建築",
  "音楽",
  "映像",
  "ファッション",
  "彫刻",
  "パフォーマンス",
];
