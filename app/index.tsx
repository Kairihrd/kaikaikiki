import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, SlidersHorizontal, Sparkles, X } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import FloatingPostButton from "@/components/FloatingPostButton";
import {
  GENRES,
  getTodaysBillboardArtworks,
  type Genre,
} from "@/lib/mockData";
import { useCurrentTheme } from "@/lib/themeApi";
import { useLanguage } from "@/context/LanguageContext";
import { colors, radius } from "@/lib/theme";

// 1. 今日のビルボード(Apple Watch ホーム風のハニカム 2Dパン キャンバス)
export default function HomeScreen() {
  const { t } = useLanguage();
  const [filterOpen, setFilterOpen] = useState(false);
  const [genre, setGenre] = useState<Genre | null>(null);
  const { theme } = useCurrentTheme();

  // 【Sensedルール】毎日、表示回数の少ない人を優先して入れ替わるビルボード。
  const all = getTodaysBillboardArtworks();
  const artworks = genre ? all.filter((a) => a.genre === genre) : all;
  // 注目作品(id:1)があれば中央に、無ければ先頭を中央にする。
  const highlightId = artworks.some((a) => a.id === "1")
    ? "1"
    : artworks[0]?.id;

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.billboard")} />

        {/* コンパクトな情報バー(テーマ / フィルター) */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.date}>2025.05.24</Text>
            <Text style={styles.todays}>{t("common.todays100")}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable style={styles.chip} onPress={() => router.push("/theme")}>
              <Sparkles size={14} color={colors.cyan} />
              <Text style={styles.chipText} numberOfLines={1}>
                {theme.title === "境界" ? t("common.boundary") : theme.title}
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

      {/* X風フローティング投稿ボタン(今日のビルボードに応募) */}
      <FloatingPostButton mode="billboard" accessibilityLabel="今日のビルボードに投稿" />

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
