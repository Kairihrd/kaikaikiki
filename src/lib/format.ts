// 数値を 1.4K / 12.3K のような表記に整形する小さなユーティリティ。
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : k.toFixed(1)}K`;
}
