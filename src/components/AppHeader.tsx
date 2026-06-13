import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Bell, MoreHorizontal, Search } from "lucide-react-native";
import IconButton from "./IconButton";
import { colors } from "@/lib/theme";

interface AppHeaderProps {
  subtitle?: string;
  showBack?: boolean;
  showProfile?: boolean;
  showMenu?: boolean;
  /** タイトルを中央に置く(作品詳細など) */
  centerTitle?: boolean;
}

const AVATAR = "https://picsum.photos/seed/billdist-avatar-kanata/100/100";

// 全画面共通の上部ヘッダー。SafeAreaは各画面のSafeAreaView側で確保する。
export default function AppHeader({
  subtitle,
  showBack = false,
  showProfile = true,
  showMenu = false,
  centerTitle = false,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {/* 左 */}
      <View style={styles.side}>
        {showBack ? (
          <IconButton accessibilityLabel="戻る" onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.text} />
          </IconButton>
        ) : null}
        {!centerTitle ? (
          <Pressable onPress={() => router.push("/")}>
            <Text style={styles.logo}>Billdist</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </Pressable>
        ) : null}
      </View>

      {/* 中央タイトル */}
      {centerTitle ? (
        <View style={styles.center}>
          <Text style={styles.logo}>Billdist</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      {/* 右 */}
      <View style={styles.side}>
        <IconButton accessibilityLabel="検索">
          <Search size={20} color={colors.text} />
        </IconButton>
        <IconButton accessibilityLabel="通知">
          <Bell size={20} color={colors.text} />
        </IconButton>
        {showMenu ? (
          <IconButton accessibilityLabel="メニュー">
            <MoreHorizontal size={20} color={colors.text} />
          </IconButton>
        ) : null}
        {showProfile ? (
          <Pressable
            onPress={() => router.push("/profile")}
            accessibilityLabel="マイページ"
          >
            <Image source={{ uri: AVATAR }} style={styles.avatar} contentFit="cover" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  center: {
    alignItems: "center",
  },
  logo: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: -1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
});
