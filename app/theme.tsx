import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Star, Users } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import StatCard from "@/components/StatCard";
import Countdown from "@/components/Countdown";
import {
  CURRENT_THEME,
  FEATURED_CREATOR,
  getThemeBillboardArtworks,
} from "@/lib/mockData";
import { generateTheme, useCurrentTheme } from "@/lib/themeApi";
import { useLanguage } from "@/context/LanguageContext";
import { usePosts } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { userPostToArtwork } from "@/lib/userPost";
import { colors, radius } from "@/lib/theme";

// 2. テーマビルボード。ビルボード配下のサブ画面。
// テーマ名/説明は backend の月間テーマ(API)に接続。未接続時は mock「境界」。
export default function ThemeScreen() {
  const { t } = useLanguage();
  const { posts } = usePosts();
  const { profile } = useProfile();
  // 【Sensedルール】テーマ参加作品から毎日入れ替わるビルボード。
  const baseArtworks = getThemeBillboardArtworks();
  // 自分のテーマ投稿を「自分の作品」として先頭に反映する。
  const author = {
    name: profile.name ?? "あなた",
    handle: FEATURED_CREATOR.handle,
    avatarUrl: profile.avatarUri ?? FEATURED_CREATOR.avatarUrl,
  };
  const myThemeArtwork = posts
    .filter((p) => p.target === "theme" && p.theme === CURRENT_THEME)
    .map((p) => userPostToArtwork(p, author))[0];
  const artworks = myThemeArtwork
    ? [myThemeArtwork, ...baseArtworks]
    : baseArtworks;
  const { theme, setTheme } = useCurrentTheme();
  // デモのテーマ名「境界」は翻訳キーに対応(API由来の他の値はそのまま表示)。
  const displayTheme = theme.title === "境界" ? t("common.boundary") : theme.title;
  const [generating, setGenerating] = useState(false);

  // 開発確認用: その月のテーマを AI 生成する(本番は月初cron/管理者専用の想定)。
  const onGenerate = async () => {
    setGenerating(true);
    const result = await generateTheme();
    setGenerating(false);
    if (result) {
      setTheme(result.theme);
      Alert.alert(
        "今月のテーマを生成しました",
        `テーマ：${result.theme.title}\n${result.theme.description}\n\n${
          result.usedAI
            ? "AI（Gemini）で生成しました。"
            : "ローカル候補から生成しました（AIキー未設定/失敗時のフォールバック）。"
        }`,
      );
    } else {
      Alert.alert(
        "テーマ生成に失敗しました",
        "AIサーバーに接続できませんでした。EXPO_PUBLIC_API_URL の設定と backend の起動を確認してください。",
      );
    }
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.themeBillboard")} showBack />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* テーマ見出し(青い光・星) */}
          <LinearGradient
            colors={["rgba(59,130,246,0.25)", "rgba(168,85,247,0.12)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.starWrap}>
              <Star size={26} color={colors.cyan} />
            </View>
            <Text style={styles.title}>{t("theme.themePrefix")}：{displayTheme}</Text>
            <Text style={styles.desc}>{theme.description}</Text>
            <View style={styles.remain}>
              <Text style={styles.remainDim}>残り</Text>
              <Text style={styles.remainStrong}>12日</Text>
              <Countdown
                initialSeconds={8 * 3600 + 34 * 60 + 56}
                style={styles.remainStrong}
              />
            </View>
          </LinearGradient>

          {/* 情報カード */}
          <View style={styles.stats}>
            <StatCard
              style={styles.statItem}
              value="824"
              label={t("theme.participatingLabel")}
              icon={<Sparkles size={16} color={colors.cyan} />}
            />
            <StatCard
              style={styles.statItem}
              value={t("theme.creators")}
              label={t("theme.creatorsDesc")}
              icon={<Users size={16} color={colors.cyan} />}
            />
          </View>

          {/* 開発確認用: その月のテーマをAI生成(本番は月初cron/管理者専用の想定)。
              本番ビルド(TestFlight)では非表示。 */}
          {__DEV__ ? (
            <View style={styles.center}>
              <Pressable
                style={styles.devButton}
                onPress={onGenerate}
                disabled={generating}
              >
                <Sparkles size={13} color={colors.textDim} />
                <Text style={styles.devButtonText}>
                  {generating ? "生成中…" : "AIで今月のテーマを生成"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* ビルボード(ハニカム2Dパン。ScrollView内なので高さを固定する) */}
          <View style={styles.themeCanvas}>
            <BillboardMosaic
              artworks={artworks}
              highlightId={myThemeArtwork?.id ?? "1"}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 20 },
  themeCanvas: { height: 460 },
  banner: {
    borderRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },
  starWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.glassStrong,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  desc: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  remain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  remainDim: { color: colors.textFaint, fontSize: 13 },
  remainStrong: { color: colors.cyan, fontSize: 14, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 12 },
  statItem: { flex: 1 },
  center: { alignItems: "center", gap: 12 },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.glass,
  },
  devButtonText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
});
