import { type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors, radius } from "@/lib/theme";

interface IconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
}

// ガラス調の丸いアイコンボタン(ヘッダーの検索・通知など)。
export default function IconButton({
  children,
  onPress,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glassStrong,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
});
