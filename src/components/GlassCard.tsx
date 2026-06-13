import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius } from "@/lib/theme";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

// ガラスっぽい半透明カードの共通ベース。RNでは実blurの代わりに
// 半透明背景 + 薄い枠線 + 影でガラス感を表現する。
export default function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
});
