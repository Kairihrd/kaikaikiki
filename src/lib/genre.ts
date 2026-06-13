// ============================================================================
// ジャンルの見た目メタ情報(アイコン・アクセント色・カード表現の種別)
// ----------------------------------------------------------------------------
// senseed は写真アプリではなくジャンル横断のアート投稿アプリ。
// ビルボード/タイムライン/プロフィールのカードで「どのジャンルの作品か」が
// ひと目で分かるよう、ジャンルごとのアイコン・色・表示スタイルをここに集約する。
// データ層(mockData)からは独立した UI ヘルパー。
// ============================================================================
import { type ComponentType } from "react";
import {
  Box,
  Camera,
  Cpu,
  Film,
  Music,
  Palette,
  PenTool,
  PersonStanding,
  Quote,
  Shirt,
  Sparkles,
  type LucideProps,
} from "lucide-react-native";
import type { Genre } from "./mockData";
import { colors } from "./theme";

// カードの見せ方の種別。
// image/video は写真素材を使う。paint/music/text/digital/mix は写真を使わず
// グラデーション + アイコン(+ 筆跡/文章)で表現する。
export type GenreVisual = "image" | "video" | "paint" | "music" | "text" | "digital" | "mix";

export interface GenreMeta {
  Icon: ComponentType<LucideProps>;
  accent: string;
  visual: GenreVisual;
  gradient: readonly [string, string, ...string[]];
}

export const GENRE_META: Record<Genre, GenreMeta> = {
  絵画: { Icon: Palette, accent: "#fcd34d", visual: "paint", gradient: ["#1e3a8a", "#7c3aed", "#b45309"] },
  イラスト: { Icon: PenTool, accent: "#f472b6", visual: "image", gradient: ["#3b1f3a", "#7c2d6b", "#1a0f1a"] },
  写真: { Icon: Camera, accent: colors.cyan, visual: "image", gradient: ["#0b0d10", "#1c2026", "#05070a"] },
  映像: { Icon: Film, accent: colors.purple, visual: "video", gradient: ["#0c0a1a", "#312e81", "#0c0a1a"] },
  音楽: { Icon: Music, accent: "#67e8f9", visual: "music", gradient: ["#0f172a", "#1e1b4b", "#312e81"] },
  文章: { Icon: Quote, accent: "#fbbf24", visual: "text", gradient: ["#05070a", "#1a160a", "#05070a"] },
  ファッション: { Icon: Shirt, accent: colors.pink, visual: "image", gradient: ["#0a0a0a", "#1f1147", "#0a0a0a"] },
  "立体・工芸": { Icon: Box, accent: "#d6d3d1", visual: "image", gradient: ["#1c1917", "#44403c", "#0c0a09"] },
  デジタル: { Icon: Cpu, accent: colors.cyan, visual: "digital", gradient: ["#3b0764", "#9333ea", "#06b6d4"] },
  パフォーマンス: { Icon: PersonStanding, accent: "#fb7185", visual: "video", gradient: ["#1a0a14", "#831843", "#1a0a14"] },
  その他: { Icon: Sparkles, accent: "#c4b5fd", visual: "mix", gradient: ["#0ea5e9", "#6366f1", "#a855f7"] },
};

export function genreMeta(g: Genre): GenreMeta {
  return GENRE_META[g] ?? GENRE_META["その他"];
}

// 写真素材を使うジャンルか(false ならグラデーション主体で表現する)。
export function usesPhoto(g: Genre): boolean {
  const v = genreMeta(g).visual;
  return v === "image" || v === "video";
}
