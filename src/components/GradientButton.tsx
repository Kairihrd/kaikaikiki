import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradient, radius } from "@/lib/theme";

interface GradientButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: "solid" | "ring";
  style?: ViewStyle | ViewStyle[];
}

// 虹色グラデーションのアクセントボタン。
// solid: グラデーション塗り / ring: グラデーション枠 + 黒塗り
export default function GradientButton({
  label,
  onPress,
  icon,
  variant = "solid",
  style,
}: GradientButtonProps) {
  const content = (
    <View style={styles.inner}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (variant === "ring") {
    return (
      <Pressable onPress={onPress} style={style}>
        {({ pressed }) => (
          <LinearGradient
            colors={gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.ringOuter, pressed && styles.pressed]}
          >
            <View style={styles.ringInner}>{content}</View>
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.solid, pressed && styles.pressed]}
        >
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  solid: {
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    borderRadius: radius.pill,
    padding: 2,
  },
  ringInner: {
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
