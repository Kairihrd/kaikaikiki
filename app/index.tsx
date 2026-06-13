import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, SlidersHorizontal, Sparkles, X } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import {
  FEATURED_CREATOR,
  GENRES,
  getTodaysBillboardArtworks,
  type Genre,
} from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { usePosts } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { userPostToArtwork } from "@/lib/userPost";
import { colors, radius } from "@/lib/theme";

// 1. 今日のビルボード(Apple Watch ホーム風のハニカム 2Dパン キャンバス)
export default function HomeScreen() {
  const { t } = useLanguage();
  const [filterOpen, setFilterOpen] = useState(false);
  const [genre, setGenre] = useState<Genre | null>(null);
  const { posts } = usePosts();
  const { profile } = useProfile();

  // 自分のビルボード投稿(今日の100)を「自分の作品」として先頭に反映する。
  const author = {
    name: profile.name ?? "あなた",
    handle: FEATURED_CREATOR.handle,
    avatarUrl: profile.avatarUri ?? FEATURED_CREATOR.avatarUrl,
  };
  const myTodayArtwork = posts
    .filter((p) => p.target === "today")
    .map((p) => userPostToArtwork(p, author))[0];

  // 【Sensedルール】毎日、表示回数の少ない人を優先して入れ替わるビルボード。
  const base = getTodaysBillboardArtworks();
  const all = myTodayArtwork ? [myTodayArtwork, ...base] : base;
  const artworks = genre ? all.filter((a) => a.genre === genre) : all;
  // 自分の投稿があれば中央に、無ければ注目作品(id:1)、それも無ければ先頭。
  const highlightId =
    myTodayArtwork && artworks.some((a) => a.id === myTodayArtwork.id)
      ? myTodayArtwork.id
      : artworks.some((a) => a.id === "1")
        ? "1"
        : artworks[0]?.id;

  // 今日の日付(毎日変わるビルボードであることを示す)。
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

  return (
    <View style={styles.root}>
      {/* ① ハニカムの2Dパン優先。iOSの横スワイプ戻りを無効化(この画面のみ) */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.billboard")} />

        {/* コンパクトな情報バー(テーマ / フィルター) */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.date}>{dateStr}</Text>
            <Text style={styles.todays}>{t("common.todays100")}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable style={styles.chip} onPress={() => router.push("/theme")}>
              <Sparkles size={14} color={colors.cyan} />
              <Text style={styles.chipText} numberOfLines={1}>
                {t("common.theme")}
              </Text>
            </Pressable>
            <Pressable style={styles.chip} onPress={() => setFilterOpen(true)}>
              <SlidersHorizontal size={14} color={colors.textDim} />
              <Text style={styles.chipText} numberOfLines={1}>
                {genre ?? t("common.all")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ハニカム 2Dパン キャンバス(表示領域いっぱい・縦スクロールしない) */}
        <View style={styles.canvasArea}>
          <BillboardMosaic artworks={artworks} highlightId={highlightId} />
        </View>
      </SafeAreaView>

      <BottomNav />

      {/* ジャンルフィルター(簡易モーダル) */}
      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>ジャンルで絞り込む</Text>
              <Pressable onPress={() => setFilterOpen(false)} accessibilityLabel="閉じる">
                <X size={22} color={colors.textDim} />
              </Pressable>
            </View>

            <FilterRow
              label="すべてのジャンル"
              active={genre === null}
              onPress={() => {
                setGenre(null);
                setFilterOpen(false);
              }}
            />
            {GENRES.map((g) => (
              <FilterRow
                key={g}
                label={g}
                active={genre === g}
                onPress={() => {
                  setGenre(g);
                  setFilterOpen(false);
                }}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function FilterRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterRow, active && styles.filterRowActive]}
    >
      <Text style={[styles.filterRowText, active && styles.filterRowTextActive]}>
        {label}
      </Text>
      {active ? <Check size={18} color={colors.cyan} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 8,
    gap: 10,
  },
  date: { color: colors.textDim, fontSize: 11, letterSpacing: 2 },
  todays: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 1 },
  topActions: { flexDirection: "row", gap: 8, flexShrink: 1 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: 150,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
  chipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  // ハニカムキャンバス領域。下部タブバーに被らないよう余白を確保。
  canvasArea: { flex: 1, marginBottom: 96 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0c0c0f",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  filterRowActive: { backgroundColor: colors.glassStrong },
  filterRowText: { color: colors.textDim, fontSize: 15 },
  filterRowTextActive: { color: colors.text, fontWeight: "700" },
});
