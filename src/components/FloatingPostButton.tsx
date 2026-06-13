import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PenLine } from "lucide-react-native";
import { colors, gradient } from "@/lib/theme";

interface FloatingPostButtonProps {
  /** 投稿先の初期選択を決めるモード(billboard=今日のビルボード / theme=テーマ) */
  mode: "billboard" | "theme";
  accessibilityLabel: string;
}

// X(旧Twitter)のようなフローティング投稿ボタン。各ビルボード画面の右下に置き、
// 「今このビルボードに投稿できる」導線として使う。下部タブバーには被らない高さに配置。
export default function FloatingPostButton({
  mode,
  accessibilityLabel,
}: FloatingPostButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={() => router.push(`/post?mode=${mode}`)}
      style={({ pressed }) => [
        styles.wrap,
        { bottom: Math.max(insets.bottom, 12) + 84 },
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={gradient.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ring}
      >
        <View style={styles.inner}>
          <PenLine size={22} color={colors.text} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 18,
    zIndex: 20,
  },
  ring: {
    width: 52,
    height: 52,
    borderRadius: 999,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  inner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
