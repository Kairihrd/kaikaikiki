import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
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
// 通常ビルボード(index)と同じ「画面内固定・全幅」のレイアウトにする(縦スクロールしない)。
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
      {/* 通常ビルボードと同様、パン優先で iOS の横スワイプ戻りを無効化(戻るはヘッダーの戻るボタン) */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.themeBillboard")} showBack />

        {/* コンパクトなテーマ情報バー(通常ビルボードの topBar に揃える) */}
        <View style={styles.topBar}>
          <View style={styles.topInfo}>
            <Text style={styles.kicker}>{t("theme.themePrefix")}</Text>
            <Text style={styles.themeTitle} numberOfLines={1}>
              {displayTheme}
            </Text>
            {theme.description ? (
              <Text style={styles.themeDesc} numberOfLines={1}>
                {theme.description}
              </Text>
            ) : null}
          </View>
          <View style={styles.remainChip}>
            <Text style={styles.remainDim}>残り</Text>
            <Countdown
              initialSeconds={8 * 3600 + 34 * 60 + 56}
              style={styles.remainStrong}
            />
          </View>
        </View>

        {/* 開発確認用ボタン(本番ビルドでは非表示)。固定レイアウトを圧迫しない細い行。 */}
        {__DEV__ ? (
          <View style={styles.devRow}>
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

        {/* ハニカム 2Dパン キャンバス(全幅・画面いっぱい・縦スクロールしない) */}
        <View style={styles.canvasArea}>
          <BillboardMosaic
            artworks={artworks}
            highlightId={myThemeArtwork?.id ?? "1"}
          />
        </View>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  // 通常ビルボード(index)の topBar と同じ余白基準
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 8,
    gap: 10,
  },
  topInfo: { flex: 1 },
  kicker: { color: colors.textDim, fontSize: 11, letterSpacing: 1 },
  themeTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 1 },
  themeDesc: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  remainChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
  remainDim: { color: colors.textFaint, fontSize: 12 },
  remainStrong: { color: colors.cyan, fontSize: 13, fontWeight: "700" },
  devRow: { paddingHorizontal: 16, paddingBottom: 6, alignItems: "flex-start" },
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
  // 通常ビルボードと同じ: 全幅・flex で画面いっぱい、下部タブ分の余白のみ確保
  canvasArea: { flex: 1, marginBottom: 96 },
});
