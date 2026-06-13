// ============================================================================
// senseed — モックデータ
// ----------------------------------------------------------------------------
// MVP段階ではここからデータを読み込む。後で Supabase / API に差し替えやすいよう、
// データ取得は getXxx() 関数経由で行う(中身を fetch に変えるだけで移行できる)。
// ============================================================================

export type ArtworkSize = "small" | "medium" | "large" | "wide" | "tall";

// senseed が扱う11ジャンル(ジャンル横断のアート投稿アプリ)。
export type Genre =
  | "絵画"
  | "イラスト"
  | "写真"
  | "映像"
  | "音楽"
  | "文章"
  | "ファッション"
  | "立体・工芸"
  | "デジタル"
  | "パフォーマンス"
  | "その他";

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
  // 【Sensedルール】ビルボードに過去表示された回数(疑似値)。
  // DBが無いMVPでは固定値を持たせ、表示回数が少ない人を優先して選出する。
  shownCount: number;
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
  `https://picsum.photos/seed/senseed-${seed}/${w}/${h}${grayscale ? "?grayscale" : ""}`;

const avatar = (seed: string) =>
  `https://picsum.photos/seed/senseed-avatar-${seed}/200/200`;

// 画像が無いユーザー投稿でも「作品カード」に見せるためのデフォルトアート画像。
export const DEFAULT_ARTWORK_IMAGE = img("user-default-art", 1000, 1300, true);

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
  shownCount: 9, // 看板作品なので過去に多く表示されている
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
  { title: "都市の輪郭", name: "レン", handle: "@ren_arch", genre: "立体・工芸", tags: ["#建築", "#都市"] },
  { title: "色のない庭", name: "ミオ", handle: "@mio_paints", genre: "イラスト", tags: ["#イラスト", "#庭"] },
  { title: "重力の手紙", name: "ソウ", handle: "@sou_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#アンビエント"] },
  { title: "皮膚と空", name: "アヤ", handle: "@aya_mode", genre: "ファッション", tags: ["#ファッション", "#空"] },
  { title: "石の記憶", name: "タケル", handle: "@takeru_sculpt", genre: "立体・工芸", tags: ["#彫刻", "#石"] },
  { title: "境界線上のダンス", name: "ノア", handle: "@noa_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#身体"] },
  { title: "群青の窓", name: "ハル", handle: "@haru_photo", genre: "写真", tags: ["#写真", "#青"] },
  { title: "電子の海", name: "カイ", handle: "@kai_digital", genre: "デジタル", tags: ["#デジタル", "#海"] },
  { title: "無音のコーラス", name: "リン", handle: "@rin_voice", genre: "音楽", isAudio: true, tags: ["#音楽", "#声"] },
  { title: "折りたたまれた光", name: "ジン", handle: "@jin_arch", genre: "立体・工芸", tags: ["#建築", "#光"] },
  { title: "彼方のフレーム", name: "ミナ", handle: "@mina_film", genre: "映像", isVideo: true, tags: ["#映像", "#旅"] },
  { title: "余白の肖像", name: "トウマ", handle: "@toma_paint", genre: "イラスト", tags: ["#イラスト", "#余白"] },
  { title: "錆びた約束", name: "エマ", handle: "@ema_photo", genre: "写真", tags: ["#写真", "#廃墟"] },
  { title: "透明な重さ", name: "シオン", handle: "@shion_sculpt", genre: "立体・工芸", tags: ["#彫刻", "#ガラス"] },
  { title: "輪郭のない服", name: "ナギ", handle: "@nagi_mode", genre: "ファッション", tags: ["#ファッション", "#白"] },
  { title: "深夜の信号", name: "リク", handle: "@riku_digital", genre: "デジタル", tags: ["#デジタル", "#夜"] },
  { title: "風の譜面", name: "コト", handle: "@koto_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#風"] },
  { title: "立ち止まる影", name: "アオイ", handle: "@aoi_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#影"] },
  { title: "硝子の街", name: "セナ", handle: "@sena_arch", genre: "立体・工芸", tags: ["#建築", "#硝子"] },
  { title: "朝の温度", name: "ヒナ", handle: "@hina_photo", genre: "写真", tags: ["#写真", "#朝"] },
  { title: "粒子の庭園", name: "タイガ", handle: "@taiga_digital", genre: "デジタル", tags: ["#デジタル", "#粒子"] },
  { title: "ほどけた線", name: "マオ", handle: "@mao_illust", genre: "イラスト", tags: ["#イラスト", "#線"] },
  { title: "海鳴りの記譜", name: "ナル", handle: "@naru_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#海"] },
  { title: "重なる時間", name: "イオ", handle: "@io_film", genre: "映像", isVideo: true, tags: ["#映像", "#時間"] },
  { title: "白い境界", name: "ケイ", handle: "@kei_photo", genre: "写真", tags: ["#写真", "#雪"] },
  { title: "沈黙のドレス", name: "ルナ", handle: "@luna_mode", genre: "ファッション", tags: ["#ファッション", "#黒"] },
  { title: "金属の祈り", name: "ガク", handle: "@gaku_sculpt", genre: "立体・工芸", tags: ["#彫刻", "#金属"] },
  { title: "夢の解像度", name: "ソラ", handle: "@sora_digital", genre: "デジタル", tags: ["#デジタル", "#夢"] },
  { title: "踊る建築", name: "ダン", handle: "@dan_arch", genre: "立体・工芸", tags: ["#建築", "#曲線"] },
  { title: "光の通り道", name: "ミク", handle: "@miku_photo", genre: "写真", tags: ["#写真", "#光"] },
  { title: "余韻のスケッチ", name: "リョウ", handle: "@ryo_illust", genre: "イラスト", tags: ["#イラスト", "#余韻"] },
  { title: "境界のリズム", name: "ジェイ", handle: "@jay_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#リズム"] },
  { title: "消えゆく舞台", name: "サキ", handle: "@saki_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#舞台"] },
  { title: "霧のインスタレーション", name: "ノエル", handle: "@noel_sculpt", genre: "立体・工芸", tags: ["#彫刻", "#霧"] },
  { title: "深呼吸する街", name: "ハク", handle: "@haku_film", genre: "映像", isVideo: true, tags: ["#映像", "#街"] },
  { title: "未完成の空", name: "ナナ", handle: "@nana_photo", genre: "写真", tags: ["#写真", "#空"] },
  { title: "縫い目の宇宙", name: "ヴィヴ", handle: "@viv_mode", genre: "ファッション", tags: ["#ファッション", "#宇宙"] },
  { title: "電光のスケッチ", name: "ゲン", handle: "@gen_digital", genre: "デジタル", tags: ["#デジタル", "#電光"] },
  { title: "静けさの設計", name: "アサ", handle: "@asa_arch", genre: "立体・工芸", tags: ["#建築", "#静寂"] },
  { title: "遠い拍動", name: "モモ", handle: "@momo_music", genre: "音楽", isAudio: true, tags: ["#音楽", "#鼓動"] },
  { title: "ひかりの破片", name: "テオ", handle: "@teo_photo", genre: "写真", tags: ["#写真", "#破片"] },
  { title: "境界を編む", name: "ユイ", handle: "@yui_illust", genre: "イラスト", tags: ["#イラスト", "#編む"] },
  { title: "重力のない部屋", name: "リオ", handle: "@rio_film", genre: "映像", isVideo: true, tags: ["#映像", "#無重力"] },
  { title: "石膏の呼吸", name: "クウ", handle: "@kuu_sculpt", genre: "立体・工芸", tags: ["#彫刻", "#石膏"] },
  { title: "夜を着る", name: "メイ", handle: "@mei_mode", genre: "ファッション", tags: ["#ファッション", "#夜"] },
  { title: "輪郭の音楽", name: "シュン", handle: "@shun_sound", genre: "音楽", isAudio: true, tags: ["#音楽", "#輪郭"] },
  { title: "見えない振付", name: "ライ", handle: "@rai_perform", genre: "パフォーマンス", isVideo: true, tags: ["#パフォーマンス", "#振付"] },
  // 絵画(油彩・水彩・アクリル・抽象画・筆跡・色面)
  { title: "青の沈黙", name: "アイ", handle: "@ai_paint", genre: "絵画", tags: ["#抽象", "#油彩", "#色面"] },
  { title: "溶ける輪郭", name: "ナオ", handle: "@nao_canvas", genre: "絵画", tags: ["#水彩", "#にじみ", "#記憶"] },
  { title: "午前四時の色面", name: "ルイ", handle: "@rui_paint", genre: "絵画", tags: ["#アクリル", "#色面", "#孤独"] },
  { title: "記憶のキャンバス", name: "サヤ", handle: "@saya_canvas", genre: "絵画", tags: ["#抽象", "#筆跡", "#余白"] },
  { title: "滲む祈り", name: "ジョウ", handle: "@joe_paint", genre: "絵画", tags: ["#水彩", "#祈り", "#滲み"] },
  // 文章(詩・短編・エッセイ・言葉の断片)
  { title: "ノイズの手紙", name: "コトハ", handle: "@kotoha_words", genre: "文章", tags: ["#詩", "#余白", "#記憶"] },
  { title: "境界の余白", name: "フミ", handle: "@fumi_text", genre: "文章", tags: ["#エッセイ", "#静けさ"] },
  { title: "言葉のかけら", name: "アキ", handle: "@aki_poem", genre: "文章", tags: ["#詩", "#断片"] },
  { title: "夜の短編", name: "ジュン", handle: "@jun_story", genre: "文章", tags: ["#短編", "#夜"] },
  // その他(ジャンル横断・インスタレーション・実験作品)
  { title: "霧の部屋", name: "ノエル", handle: "@noel_space", genre: "その他", tags: ["#インスタレーション", "#空間"] },
  { title: "感覚の交差点", name: "ミライ", handle: "@mirai_x", genre: "その他", tags: ["#ジャンル横断", "#実験"] },
  { title: "未分類の実験", name: "ソウタ", handle: "@sota_lab", genre: "その他", tags: ["#実験", "#混合"] },
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

// モノクロ表示にすると相性の良いジャンル(写真・立体・工芸)。
// これに加えて一定間隔でもグレースケールにし、カラー/モノクロを混在させて
// 風景写真ばかりに見えないよう見た目のバリエーションを出す。
const GRAY_GENRES: Genre[] = ["写真", "立体・工芸"];

// 文章ジャンルはカード内に大きく出す「言葉の断片」を持たせる(写真の代わり)。
const TEXT_SNIPPETS: Record<string, string> = {
  "ノイズの手紙": "断片的な言葉で\n境界をなぞる。",
  "境界の余白": "余白にだけ、\n本当のことを書いた。",
  "言葉のかけら": "こわれた文字の\nすきまに光が差す。",
  "夜の短編": "夜は、\nだれかの続きだった。",
};

// 絵画ジャンルの作品説明(油彩・水彩・アクリルなどの質感が伝わる文)。
const PAINT_DESCRIPTIONS: Record<string, string> = {
  "青の沈黙": "油彩の厚みで、言葉にならない感情を重ねた作品。",
  "溶ける輪郭": "水彩の滲みで記憶の曖昧さを描いたペインティング。",
  "午前四時の色面": "アクリルの色面で都市の孤独を表現した抽象画。",
  "記憶のキャンバス": "幾層もの筆跡に、忘れたはずの風景を塗り込めた。",
  "滲む祈り": "にじむ水彩で、声にならない祈りを置いた一枚。",
};

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
    description:
      TEXT_SNIPPETS[s.title] ??
      PAINT_DESCRIPTIONS[s.title] ??
      `${s.title} — ${s.genre}の視点から「${CURRENT_THEME}」を描いた一枚。`,
    likes: 120 + ((i * 137) % 1900),
    comments: 3 + ((i * 17) % 90),
    isVideo: s.isVideo ?? false,
    isAudio: s.isAudio ?? false,
    tags: s.tags,
    size: pickSize(idx),
    // 表示回数をばらつかせる(0〜7)。0 の人はまだ一度も表示されていない想定。
    shownCount: (i * 3) % 8,
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

// マッチング(Resonance Agent)へ渡す「いいねした作品」のサンプル。
// 写真に偏らないよう、なるべく多ジャンルから1作品ずつ拾って AI が
// ジャンル横断で推薦理由を作れるようにする(文章・音楽なども必ず混ぜる)。
export function getLikedArtworksSample(count = 6): Artwork[] {
  const sample: Artwork[] = [];
  const usedIds = new Set<string>();
  for (const g of GENRES) {
    if (sample.length >= count) break;
    const a = ARTWORKS.find((x) => x.genre === g && !usedIds.has(x.id));
    if (a) {
      sample.push(a);
      usedIds.add(a.id);
    }
  }
  // 足りなければ likes 上位で補う。
  if (sample.length < count) {
    for (const a of [...ARTWORKS].sort((x, y) => y.likes - x.likes)) {
      if (sample.length >= count) break;
      if (!usedIds.has(a.id)) {
        sample.push(a);
        usedIds.add(a.id);
      }
    }
  }
  return sample.slice(0, count);
}

// ============================================================================
// 【Sensedルール】ビルボード選出ロジック
// ----------------------------------------------------------------------------
// ・毎日、表示されるアーティストが入れ替わる(今日の日付をseedにする)。
// ・全員が満遍なく露出するよう、過去の表示回数(shownCount)が少ない人を優先。
// ・表示回数が同じ場合は、日付seedによる擬似ランダムで並べる。
// ・作品/ユーザーが100人以下なら全件表示(順番だけ毎日変わる)。
// ・100人を超える想定でも上位 limit 件だけ返せるようにしてある。
// MVPではDBが無いため shownCount を固定値で持ち、ここで擬似的に再現する。
// 後でサーバ実装する際は、この関数の中身をクエリに差し替えるだけでよい。
// ============================================================================

// 今日の日付を数値seedにする(例: 2025-05-24 → 20250524)。毎日値が変わる。
function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// seed と id から決定論的に [0,1) の擬似乱数を作る(同点のシャッフル用)。
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 表示回数が少ない順 → 同点は日付seedでランダムに並べ替える。
function rankBillboard(pool: Artwork[]): Artwork[] {
  const seed = todaySeed();
  return [...pool].sort((a, b) => {
    if (a.shownCount !== b.shownCount) return a.shownCount - b.shownCount;
    return seededRandom(seed + Number(a.id)) - seededRandom(seed + Number(b.id));
  });
}

// ジャンルの偏りを防ぐビルボード選出。
// 1) まず各ジャンルから最低1作品ずつ選ぶ(プールに存在するジャンルのみ)。
// 2) 残り枠は通常ロジック(shownCount / dateSeed)で埋める。
// これでビルボードを見た瞬間に多ジャンルが混ざって見えるようにする。
function pickBillboard(pool: Artwork[], limit: number): Artwork[] {
  const ranked = rankBillboard(pool);
  const picked: Artwork[] = [];
  const usedIds = new Set<string>();

  // 1) 各ジャンルの代表を1作品ずつ先に確保(GENRES 順)。
  for (const g of GENRES) {
    if (picked.length >= limit) break;
    const rep = ranked.find((a) => a.genre === g && !usedIds.has(a.id));
    if (rep) {
      picked.push(rep);
      usedIds.add(rep.id);
    }
  }

  // 2) 残りを通常ロジックの順で埋める。
  for (const a of ranked) {
    if (picked.length >= limit) break;
    if (!usedIds.has(a.id)) {
      picked.push(a);
      usedIds.add(a.id);
    }
  }

  return picked.slice(0, limit);
}

// 実データが目標数に満たない場合、ビルボードを埋める補完作品を生成する。
// (Today's 100 を常に100枚にするための補完。後で実データが増えれば自然に置き換わる)
// 「Untitled」のような未完成感を避けるため、詩的なタイトル/作家名を割り当て、
// 必ず作品画像を持たせる(グラデーション + アイコンだけのカードは作らない)。
const PH_TITLES = [
  "余白の記憶", "遠い反射", "名もなき光", "静かな層", "気配の輪郭",
  "夜のかけら", "白い余韻", "境界の呼吸", "沈黙の粒", "光の通り道",
  "かすかな兆し", "透明な時間", "薄明の景色", "重なる静寂", "余白に咲く",
  "ほどけた線", "遠雷", "微熱の色", "残像", "空白の手紙",
];
const PH_NAMES = [
  "ren", "mio", "sora", "yua", "kai", "nao", "rin", "jun",
  "aoi", "kou", "mei", "riku", "saki", "tao", "emi", "yuto",
];

function makePlaceholder(i: number): Artwork {
  const genre = GENRES[i % GENRES.length];
  const title = PH_TITLES[i % PH_TITLES.length];
  const name = PH_NAMES[i % PH_NAMES.length];
  return {
    id: `ph-${i}`,
    title,
    creatorName: name,
    creatorHandle: `@${name}_${i}`,
    // 補完カードも必ず作品画像を持たせる(縦長で作品サムネらしく)。
    imageUrl: img(`ph-${name}-${i}`, 600, 800, GRAY_GENRES.includes(genre)),
    genre,
    theme: CURRENT_THEME,
    description: `${genre}の視点から「${CURRENT_THEME}」を見つめた一枚。`,
    likes: 50 + ((i * 53) % 1500),
    comments: 1 + ((i * 7) % 60),
    isVideo: false,
    isAudio: false,
    tags: [`#${genre}`],
    size: "small",
    shownCount: 5,
  };
}

// list を n 件に揃える(多ければ切り詰め、少なければプレースホルダーで補完)。
function padTo(list: Artwork[], n: number): Artwork[] {
  if (list.length >= n) return list.slice(0, n);
  const out = [...list];
  let i = 0;
  while (out.length < n) out.push(makePlaceholder(i++));
  return out;
}

// 今日のビルボード(Today's 100)。実データが足りなくても常に limit 件(既定100)を返す。
export function getTodaysBillboardArtworks(limit = 100): Artwork[] {
  return padTo(pickBillboard(ARTWORKS, limit), limit);
}

// テーマビルボード。テーマ参加作品から毎日 limit 件を同じルールで選出する。
export function getThemeBillboardArtworks(
  theme: string = CURRENT_THEME,
  limit = 100,
): Artwork[] {
  return pickBillboard(
    ARTWORKS.filter((a) => a.theme === theme),
    limit,
  );
}

// ============================================================================
// マッチング(Resonance Agent)用モックデータ
// ----------------------------------------------------------------------------
// AIは作品を「評価」しない。ユーザーのいいね履歴から感性を推定し、ジャンルを越えた
// クリエイター/作品との出会い(推薦)を作る、という設計をUIで表現するためのモック。
// 後で Embedding / Claude API に差し替えやすいよう、取得は関数経由にしている。
// ============================================================================

export interface ResonanceMatch {
  id: string;
  creator: Creator;
  resonance: number; // 共鳴度(%)
  genre: string;
  reason: string; // なぜ共鳴するか(言語化)
}

export interface SensibilityTrait {
  label: string;
  value: number; // 0-100
}

export interface Discovery {
  title: string; // 例: 映像作家 × 音楽
  body: string;
}

// 感性プロファイル(いいね履歴から推定した、という想定)
export function getSensibilityProfile(): SensibilityTrait[] {
  return [
    { label: "静寂", value: 93 },
    { label: "余白", value: 87 },
    { label: "孤独", value: 72 },
    { label: "光", value: 65 },
  ];
}

// あなたと共鳴する人(ジャンル横断で推薦)
export function getResonanceMatches(): ResonanceMatch[] {
  return [
    {
      id: "m1",
      creator: getCreatorByHandle("@mina_film"),
      resonance: 93,
      genre: "映像",
      reason:
        "あなたが惹かれる「静寂」と「余白」が、この映像作家の時間の余白の使い方と強く共鳴しています。",
    },
    {
      id: "m2",
      creator: getCreatorByHandle("@sou_sound"),
      resonance: 88,
      genre: "音楽",
      reason:
        "普段は写真を多く見ていますが、このアンビエント作家の“間”の取り方にあなたの感性と共通点があります。",
    },
    {
      id: "m3",
      creator: getCreatorByHandle("@shion_sculpt"),
      resonance: 81,
      genre: "立体・工芸",
      reason:
        "「光」と「孤独」への反応傾向から、透明なガラス彫刻のこの作家を未接触ジャンルとして提案します。",
    },
    {
      id: "m4",
      creator: getCreatorByHandle("@nagi_mode"),
      resonance: 76,
      genre: "ファッション",
      reason:
        "白と余白を生かす構成が、あなたがいいねした作品群の傾向と重なっています。",
    },
  ];
}

// 「あなたへの発見」(未接触ジャンルを優先した出会い)
export function getDiscovery(): Discovery {
  return {
    title: "映像作家 × 音楽",
    body: "普段は写真を見ていますが、この映像作家の作品にも強い共通点があります。ジャンルの外側に、あなたの感性と響き合う表現が見つかりました。",
  };
}

export const GENRES: Genre[] = [
  "絵画",
  "イラスト",
  "写真",
  "映像",
  "音楽",
  "文章",
  "ファッション",
  "立体・工芸",
  "デジタル",
  "パフォーマンス",
  "その他",
];

// ============================================================================
// タイムライン(TikTok風・縦スワイプフィード)用データ
// ----------------------------------------------------------------------------
// 写真に偏らないよう、芸術アプリらしい多ジャンルの作品を1画面1件で縦に流す。
// 画像が無いジャンル(音楽・詩・デジタル等)は外部画像を足さず、
// グラデーション/タイポグラフィ/プレースホルダー演出で見せる。
// mediaType に応じて timeline.tsx 側で見せ方を変える。
// 後で API 化する際は getTimelinePosts() の中身を fetch に差し替えるだけでよい。
// ============================================================================

// 見せ方(レンダリング)を決める種別。category(表示名)とは別に持つ。
export type TimelineMedia =
  | "image" // 写真
  | "architecture" // 建築(モノクロ写真 + グリッド線)
  | "painting" // 絵画(キャンバス風)
  | "digital" // デジタルアート(ネオン・グラデ)
  | "3d" // 3D / CG(立体図形)
  | "music" // 音楽(波形 + 音符)
  | "video" // 映像(再生アイコン)
  | "poem" // 詩 / 文章(大きめタイポグラフィ)
  | "fashion" // ファッション(ルックブック)
  | "product" // プロダクトデザイン
  | "installation" // インスタレーション(空間展示)
  | "dance"; // ダンス / パフォーマンス(再生 + モーション)

export interface TimelinePost {
  id: string;
  category: string; // 表示用ジャンル名(建築 / 絵画 / 音楽 …)
  title: string;
  creatorName: string;
  username: string; // @handle
  avatarUrl: string;
  description: string;
  body?: string; // 詩 / 文章の本文抜粋(poem で大きく表示)
  tags: string[];
  likes: number;
  comments: number;
  soundLabel: string;
  mediaType: TimelineMedia;
  imageUrl?: string; // 画像系(写真 / 建築 / 映像 / ファッション)で使用
  // 非画像系の背景グラデーション(2色以上)。
  gradient: readonly [string, string, ...string[]];
  accent: string; // アクセント色(アイコン・波形など)
  supporting?: boolean; // サポート中クリエイターの作品か
}

const TIMELINE_POSTS: TimelinePost[] = [
  {
    id: "architecture-quiet-boundary",
    category: "建築",
    title: "静けさの設計",
    creatorName: "アサ",
    username: "@asa_arch",
    avatarUrl: avatar("asa-arch"),
    description: "建築の視点から「境界」を描いた一枚。線と余白で静寂を設計する。",
    tags: ["#建築", "#静寂", "#図面"],
    likes: 1934,
    comments: 70,
    soundLabel: "オリジナルサウンド - アサ",
    mediaType: "architecture",
    imageUrl: img("asa-arch-quiet", 1000, 1400, true),
    gradient: ["#0b0d10", "#1c2026", "#05070a"],
    accent: "#22d3ee",
  },
  {
    id: "painting-margin-portrait",
    category: "絵画",
    title: "余白の肖像",
    creatorName: "トウマ",
    username: "@toma_paint",
    avatarUrl: avatar("toma-paint"),
    description: "キャンバスに残した筆跡の余白。塗らない部分にこそ感情を置いた。",
    tags: ["#絵画", "#余白", "#油彩"],
    likes: 1245,
    comments: 58,
    soundLabel: "アトリエの環境音 - トウマ",
    mediaType: "painting",
    imageUrl: img("toma-paint-canvas", 1000, 1400),
    gradient: ["#1c1917", "#7c2d12", "#0c0a09"],
    accent: "#f59e0b",
  },
  {
    id: "digital-electron-sea",
    category: "デジタルアート",
    title: "電子の海",
    creatorName: "カイ",
    username: "@kai_digital",
    avatarUrl: avatar("kai-digital"),
    description: "粒子で満たされた海をジェネラティブに生成。ネオンの境界が揺らぐ。",
    tags: ["#デジタル", "#ジェネラティブ", "#ネオン"],
    likes: 2810,
    comments: 132,
    soundLabel: "Synth Drift - カイ",
    mediaType: "digital",
    imageUrl: img("kai-digital-sea", 1000, 1400),
    gradient: ["#3b0764", "#9333ea", "#06b6d4"],
    accent: "#22d3ee",
    supporting: true,
  },
  {
    id: "music-letter-of-gravity",
    category: "音楽",
    title: "重力の手紙",
    creatorName: "ソウ",
    username: "@sou_sound",
    avatarUrl: avatar("sou-sound"),
    description: "アンビエントで綴る、届かない手紙。低音の余韻に身をあずける。",
    body: "ゆっくりと沈んでいく音。\n沈黙のあいだに、言葉が浮かぶ。",
    tags: ["#音楽", "#アンビエント", "#環境音"],
    likes: 1620,
    comments: 64,
    soundLabel: "重力の手紙 (Full) - ソウ",
    mediaType: "music",
    imageUrl: img("sou-sound-ambient", 1000, 1400, true),
    gradient: ["#0f172a", "#1e1b4b", "#312e81"],
    accent: "#22d3ee",
    supporting: true,
  },
  {
    id: "video-echo-of-dawn",
    category: "映像",
    title: "夜明けの残響",
    creatorName: "ユウキ",
    username: "@yuki_visuals",
    avatarUrl: avatar("yuki-visuals"),
    description: "夜と朝の境界をスローモーションで。光が満ちる10秒間の短編。",
    tags: ["#映像", "#短編", "#夜明け"],
    likes: 2240,
    comments: 96,
    soundLabel: "Dawn Field - ユウキ",
    mediaType: "video",
    imageUrl: img("yuki-dawn", 1000, 1400),
    gradient: ["#0c0a1a", "#312e81", "#0c0a1a"],
    accent: "#a855f7",
    supporting: true,
  },
  {
    id: "photo-silent-entrance",
    category: "写真",
    title: "静寂の入口",
    creatorName: "カナタ",
    username: "@kanata__photo",
    avatarUrl: avatar("kanata"),
    description: "誰もいない世界の、誰かのための入口。光の先を想像してみる。",
    tags: ["#写真", "#モノクロ", "#光と影"],
    likes: 1834,
    comments: 28,
    soundLabel: "オリジナルサウンド - カナタ",
    mediaType: "image",
    imageUrl: img("kanata-entrance", 1000, 1400, true),
    gradient: ["#000000", "#111111", "#000000"],
    accent: "#22d3ee",
  },
  {
    id: "poem-boundary-words",
    category: "詩 / 文章",
    title: "境界の詩",
    creatorName: "コトハ",
    username: "@kotoha_words",
    avatarUrl: avatar("kotoha-words"),
    description: "ことばで引いた一本の線。読む人ごとに境界の位置は変わる。",
    body: "ここから先は、\nまだ名前のない場所。\n\n境界は、\n越えるためにある。",
    tags: ["#詩", "#文章", "#言葉"],
    likes: 980,
    comments: 41,
    soundLabel: "朗読 - コトハ",
    mediaType: "poem",
    imageUrl: img("kotoha-words-paper", 1000, 1400, true),
    gradient: ["#05070a", "#0f172a", "#05070a"],
    accent: "#22d3ee",
  },
  {
    id: "fashion-wearing-night",
    category: "ファッション",
    title: "夜を着る",
    creatorName: "メイ",
    username: "@mei_mode",
    avatarUrl: avatar("mei-mode"),
    description: "闇のグラデーションをまとうルックブック。布の境界が夜に溶ける。",
    tags: ["#ファッション", "#ルックブック", "#夜"],
    likes: 1510,
    comments: 73,
    soundLabel: "Runway Pulse - メイ",
    mediaType: "fashion",
    imageUrl: img("mei-night", 1000, 1400),
    gradient: ["#0a0a0a", "#1f1147", "#0a0a0a"],
    accent: "#ec4899",
  },
  {
    id: "product-tools-of-margin",
    category: "プロダクトデザイン",
    title: "余白の道具",
    creatorName: "イツキ",
    username: "@itsuki_design",
    avatarUrl: avatar("itsuki-design"),
    description: "使わない時間も美しい日用品。引き算で残した機能の輪郭。",
    tags: ["#プロダクト", "#デザイン", "#ミニマル"],
    likes: 1120,
    comments: 49,
    soundLabel: "Studio Ambience - イツキ",
    mediaType: "product",
    imageUrl: img("itsuki-product-minimal", 1000, 1400),
    gradient: ["#111827", "#374151", "#0b0f17"],
    accent: "#22d3ee",
  },
  {
    id: "installation-room-of-fog",
    category: "インスタレーション",
    title: "霧の部屋",
    creatorName: "ノエル",
    username: "@noel_space",
    avatarUrl: avatar("noel-space"),
    description: "歩くと輪郭が消える霧の空間展示。体験そのものが作品になる。",
    tags: ["#インスタレーション", "#空間", "#霧"],
    likes: 1340,
    comments: 60,
    soundLabel: "Spatial Drone - ノエル",
    mediaType: "installation",
    imageUrl: img("noel-fog-space", 1000, 1400, true),
    gradient: ["#0b1417", "#0f766e", "#0b1417"],
    accent: "#2dd4bf",
    supporting: true,
  },
  {
    id: "cg-particle-garden",
    category: "3D / CG",
    title: "粒子の庭園",
    creatorName: "タイガ",
    username: "@taiga_cg",
    avatarUrl: avatar("taiga-cg"),
    description: "物理シミュレーションで育てた立体の庭。光が粒の上を転がる。",
    tags: ["#3DCG", "#レンダリング", "#粒子"],
    likes: 1990,
    comments: 88,
    soundLabel: "Render Hum - タイガ",
    mediaType: "3d",
    imageUrl: img("taiga-cg-particle", 1000, 1400),
    gradient: ["#0ea5e9", "#6366f1", "#a855f7"],
    accent: "#818cf8",
  },
  {
    id: "dance-on-the-boundary",
    category: "ダンス / パフォーマンス",
    title: "境界線上のダンス",
    creatorName: "ノア",
    username: "@noa_perform",
    avatarUrl: avatar("noa-perform"),
    description: "舞台と客席の境界で踊る即興。身体だけが越えていく。",
    tags: ["#ダンス", "#パフォーマンス", "#身体"],
    likes: 2070,
    comments: 110,
    soundLabel: "Improv Beat - ノア",
    mediaType: "dance",
    imageUrl: img("noa-dance", 1000, 1400),
    gradient: ["#1a0a14", "#831843", "#1a0a14"],
    accent: "#ec4899",
    supporting: true,
  },
  {
    id: "photo-ultramarine-window",
    category: "写真",
    title: "群青の窓",
    creatorName: "ハル",
    username: "@haru_photo",
    avatarUrl: avatar("haru-photo"),
    description: "夜明け前の群青に染まる窓辺。内と外の境界がいちばん青い時間。",
    tags: ["#写真", "#青", "#朝"],
    likes: 1430,
    comments: 52,
    soundLabel: "オリジナルサウンド - ハル",
    mediaType: "image",
    imageUrl: img("haru-window", 1000, 1400),
    gradient: ["#020617", "#0c1a3a", "#020617"],
    accent: "#3b82f6",
  },
  {
    id: "music-sea-notation",
    category: "音楽",
    title: "海鳴りの記譜",
    creatorName: "ナル",
    username: "@naru_sound",
    avatarUrl: avatar("naru-sound"),
    description: "波の音を五線譜に起こした実験的サウンドスケープ。",
    body: "寄せては返す音を、\n譜面にとじこめる。",
    tags: ["#音楽", "#サウンドスケープ", "#海"],
    likes: 1180,
    comments: 44,
    soundLabel: "海鳴りの記譜 - ナル",
    mediaType: "music",
    imageUrl: img("naru-sea-notation", 1000, 1400, true),
    gradient: ["#082f49", "#0e7490", "#022c3a"],
    accent: "#67e8f9",
  },
  {
    id: "digital-resolution-of-dream",
    category: "デジタルアート",
    title: "夢の解像度",
    creatorName: "ソラ",
    username: "@sora_digital",
    avatarUrl: avatar("sora-digital"),
    description: "記憶のノイズをアップスケール。曖昧さの中の鮮明さを描く。",
    tags: ["#デジタル", "#グリッチ", "#夢"],
    likes: 2360,
    comments: 101,
    soundLabel: "Glitch Lullaby - ソラ",
    mediaType: "digital",
    imageUrl: img("sora-digital-dream", 1000, 1400),
    gradient: ["#4c1d95", "#db2777", "#f59e0b"],
    accent: "#ec4899",
    supporting: true,
  },
];

// タイムライン「おすすめ」: 多ジャンルの全投稿(縦スワイプ用)。
export function getTimelinePosts(): TimelinePost[] {
  return TIMELINE_POSTS;
}

// タイムライン「サポート中」: サポートしているクリエイターの作品のみ。
export function getSupportingTimelinePosts(): TimelinePost[] {
  return TIMELINE_POSTS.filter((p) => p.supporting);
}
