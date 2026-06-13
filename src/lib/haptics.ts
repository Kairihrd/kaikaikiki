// 触覚フィードバック(expo-haptics)の薄いラッパー。
// 失敗しても落ちないよう全て catch する。ビルボードのスワイプ用は throttle 済み。
import * as Haptics from "expo-haptics";

// 投稿完了などの成功フィードバック(トゥクン)。
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
}

// いいね等の軽いフィードバック。
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

// ビルボードのハニカムをスワイプ中の「チリチリ」。
// 鳴りすぎないよう 120ms に1回までに throttle する。
let lastTick = 0;
export function hapticBillboardTick() {
  const now = Date.now();
  if (now - lastTick < 120) return;
  lastTick = now;
  Haptics.selectionAsync().catch(() => {});
}
