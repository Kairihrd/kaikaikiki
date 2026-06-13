import { type ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  HeartHandshake,
  LayoutGrid,
  Play,
  Plus,
  User,
  type LucideProps,
} from "lucide-react-native";
import { colors, gradient } from "@/lib/theme";

interface NavItem {
  href: "/" | "/matching" | "/timeline" | "/profile";
  label: string;
  icon: ComponentType<LucideProps>;
}

// 5タブ構成: ビルボード / マッチング / [中央=投稿] / タイムライン / マイページ
// 「テーマ」はビルボード配下のサブ画面(/theme)として扱い、下部タブには置かない。
// 「サポーター中」もマイページ配下の機能として /supporting に集約する。
const LEFT: NavItem[] = [
  { href: "/", label: "ビルボード", icon: LayoutGrid },
  { href: "/matching", label: "マッチング", icon: HeartHandshake },
];
const RIGHT: NavItem[] = [
  { href: "/timeline", label: "タイムライン", icon: Play },
  { href: "/profile", label: "マイページ", icon: User },
];

// 全画面共通の下部タブバー(iOS風・フローティング)。中央は虹色グラデの投稿ボタン。
export default function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // テーマ(/theme)はビルボード配下なのでビルボードを、サポーター中(/supporting)は
  // マイページ配下なのでマイページを、それぞれアクティブ扱いにする。
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/theme");
    if (href === "/profile")
      return pathname.startsWith("/profile") || pathname.startsWith("/supporting");
    return pathname.startsWith(href);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {LEFT.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        {/* 中央投稿ボタン(虹色グラデーション枠・大きめ) */}
        <Pressable
          accessibilityLabel="投稿"
          onPress={() => router.push("/post")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <LinearGradient
            colors={gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabOuter}
          >
            <View style={styles.fabInner}>
              <Plus size={26} color={colors.text} />
            </View>
          </LinearGradient>
        </Pressable>

        {RIGHT.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
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
    justifyContent: "space-between",
    width: "92%",
    maxWidth: 440,
    paddingHorizontal: 14,
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
    width: 58,
    alignItems: "center",
    gap: 2,
  },
  linkLabel: {
    fontSize: 9.5,
  },
  fabOuter: {
    width: 56,
    height: 56,
    borderRadius: 999,
    padding: 2,
    marginTop: -24,
    alignItems: "center",
    justifyContent: "center",
  },
  fabInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
