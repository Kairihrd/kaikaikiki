// 月間ビルボードテーマの取得 / 生成(backend 接続)。
// EXPO_PUBLIC_API_URL が設定され backend が起動していれば API を使い、
// 未設定・失敗時は mock の「境界」にフォールバックする(落ちない)。
import { useEffect, useState } from "react";
import { CURRENT_THEME } from "./mockData";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ThemeInfo {
  id: string;
  title: string;
  description: string;
  generatedByAI: boolean;
  generatedAt: string;
}

// API 未接続/失敗時に使う mock テーマ(アプリ既定の「境界」)。
export const DEFAULT_THEME: ThemeInfo = {
  id: "theme-mock",
  title: CURRENT_THEME,
  description: "今月のお題：境界線を越える / 境界を感じる作品",
  generatedByAI: false,
  generatedAt: "",
};

// 生成時に重複回避のため backend へ渡す過去テーマ(MVP では固定リスト)。
export const PAST_THEMES = ["境界", "余白", "反射"];

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// GET /theme/current。API 未設定/失敗時は null(呼び出し側で mock にフォールバック)。
export async function fetchCurrentTheme(): Promise<ThemeInfo | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/theme/current`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { month: string; theme: ThemeInfo } = await res.json();
    return data.theme;
  } catch {
    return null;
  }
}

// POST /theme/generate。成功で { theme, usedAI }、未設定/失敗で null。
export async function generateTheme(
  pastThemes: string[] = PAST_THEMES,
): Promise<{ theme: ThemeInfo; usedAI: boolean } | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/theme/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: currentMonth(), pastThemes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { theme: ThemeInfo; usedAI: boolean } = await res.json();
    return { theme: data.theme, usedAI: data.usedAI };
  } catch {
    return null;
  }
}

// 現在テーマを取得するフック。API 未設定/失敗時は DEFAULT_THEME のまま落ちない。
// setTheme を返すので、生成後に画面のテーマを差し替えられる。
export function useCurrentTheme() {
  const [theme, setTheme] = useState<ThemeInfo>(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const t = await fetchCurrentTheme();
      if (alive && t) setTheme(t);
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { theme, setTheme, loading };
}
