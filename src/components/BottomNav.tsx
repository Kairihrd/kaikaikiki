import { type ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutGrid, Play, User, type LucideProps } from "lucide-react-native";
import { colors } from "@/lib/theme";

type Href = "/" | "/timeline" | "/profile";

interface NavItem {
  href: Href;
  label: string;
  icon: ComponentType<LucideProps>;
}

// 3タブ構成: 左=タイムライン / 中央=ビルボード(強調) / 右=マイページ
const LEFT: NavItem = { href: "/timeline", label: "タイムライン", icon: Play };
const CENTER: NavItem = { href: "/", label: "ビルボード", icon: LayoutGrid };
const RIGHT: NavItem = { href: "/profile", label: "マイページ", icon: User };

// 全画面共通の下部タブバー(iOS風・フローティング)。
// 中央の「ビルボード」を少し大きく、active時は白く明るく強調する(投稿ボタンではない)。
export default function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (href: Href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        <NavLink item={LEFT} active={isActive(LEFT.href)} />
        <CenterLink item={CENTER} active={isActive(CENTER.href)} />
        <NavLink item={RIGHT} active={isActive(RIGHT.href)} />
      </View>
    </View>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const tint = active ? colors.text : colors.textFaint;
  return (
    <Pressable onPress={() => router.push(item.href)} style={styles.link}>
      <Icon size={22} color={tint} />
      <Text style={[styles.linkLabel, { color: tint }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

// 中央のビルボードタブ。少し大きめの円。active時は白背景+黒アイコンで明るく。
function CenterLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={() => router.push(item.href)}
      style={({ pressed }) => [styles.centerLink, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.centerCircle,
          active ? styles.centerCircleActive : styles.centerCircleInactive,
        ]}
      >
        <Icon size={26} color={active ? colors.bg : colors.text} />
      </View>
      <Text
        style={[styles.centerLabel, { color: active ? colors.text : colors.textDim }]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "92%",
    maxWidth: 440,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(10,10,12,0.85)",
    borderColor: colors.border,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  link: {
    width: 72,
    alignItems: "center",
    gap: 3,
  },
  linkLabel: {
    fontSize: 10,
  },
  centerLink: {
    width: 80,
    alignItems: "center",
    gap: 3,
  },
  centerCircle: {
    width: 58,
    height: 58,
    borderRadius: 999,
    marginTop: -22,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCircleActive: {
    backgroundColor: colors.text,
    shadowColor: colors.text,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  centerCircleInactive: {
    backgroundColor: colors.glassStrong,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
