import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { ArrowLeft, Bell, MessageCircle, MoreHorizontal } from "lucide-react-native";
import IconButton from "./IconButton";
import { colors } from "@/lib/theme";

interface AppHeaderProps {
  subtitle?: string;
  showBack?: boolean;
  /** @deprecated 右上のユーザーアイコンは廃止。互換のため受け取るが使用しない */
  showProfile?: boolean;
  showMenu?: boolean;
  /** タイトルを中央に置く(作品詳細など) */
  centerTitle?: boolean;
}

// 全画面共通の上部ヘッダー。SafeAreaは各画面のSafeAreaView側で確保する。
// 右上は「通知 + DM(メッセージ)」。ユーザーアイコン/検索アイコンは表示しない。
export default function AppHeader({
  subtitle,
  showBack = false,
  showMenu = false,
  centerTitle = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  // DM(メッセージ)画面にいるときは DM アイコンを出さない(それ以外では押せる)。
  const onDM = pathname.startsWith("/messages");

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
            <Image
              source={require("../../assets/logo-wide.png")}
              style={styles.logoImg}
              resizeMode="contain"
              accessibilityLabel="senseed"
            />
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </Pressable>
        ) : null}
      </View>

      {/* 中央タイトル */}
      {centerTitle ? (
        <View style={styles.center}>
          <Image
            source={require("../../assets/logo-wide.png")}
            style={styles.logoImg}
            resizeMode="contain"
            accessibilityLabel="senseed"
          />
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      {/* 右: 通知 + DM(+ メニュー) */}
      <View style={styles.side}>
        <IconButton
          accessibilityLabel="通知"
          onPress={() => router.push("/notifications")}
        >
          <Bell size={20} color={colors.text} />
        </IconButton>
        {!onDM ? (
          <IconButton
            accessibilityLabel="メッセージ"
            onPress={() => router.push("/messages")}
          >
            <MessageCircle size={20} color={colors.text} />
          </IconButton>
        ) : null}
        {showMenu ? (
          <IconButton accessibilityLabel="メニュー">
            <MoreHorizontal size={20} color={colors.text} />
          </IconButton>
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
  // 横長 SENSEED ロゴ画像(透過PNG)。黒背景に馴染む。右側アイコンに被らないサイズ。
  logoImg: {
    width: 100,
    height: 36,
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: -1,
  },
});
