// アプリ全体のデザイントークン。色・グラデーション・角丸を一元管理する。
export const colors = {
  bg: "#000000",
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.6)",
  textFaint: "rgba(255,255,255,0.4)",
  glass: "rgba(255,255,255,0.05)",
  glassStrong: "rgba(255,255,255,0.1)",
  border: "rgba(255,255,255,0.1)",
  borderStrong: "rgba(255,255,255,0.2)",
  cyan: "#22d3ee",
  purple: "#a855f7",
  pink: "#ec4899",
  blue: "#3b82f6",
};

// 虹色グラデーション(サポーターになる・投稿ボタン・強調枠)
export const gradient = {
  brand: ["#22d3ee", "#a855f7", "#ec4899"] as const,
  brandSoft: ["#38bdf8", "#a78bfa", "#fde047"] as const,
};

export const radius = {
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};
