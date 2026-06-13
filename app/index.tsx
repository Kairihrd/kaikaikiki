import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import StatCard from "@/components/StatCard";
import Countdown from "@/components/Countdown";
import FloatingPostButton from "@/components/FloatingPostButton";
import {
  CURRENT_THEME,
  GENRES,
  getTodaysBillboardArtworks,
  type Genre,
} from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 1. 今日のビルボード(アプリのメイン画面)
export default function HomeScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [genre, setGenre] = useState<Genre | null>(null);

  // 【Sensedルール】毎日、表示回数の少ない人を優先して入れ替わるビルボード。
  const all = getTodaysBillboardArtworks();
  const artworks = genre ? all.filter((a) => a.genre === genre) : all;
  // フィルタ後も注目作品(id:1)があれば中央に、無ければ先頭を中央にする。
  const highlightId = artworks.some((a) => a.id === "1")
    ? "1"
    : artworks[0]?.id;

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="今日のビルボード" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 日付 + Today's 100(小さめ) */}
          <View style={styles.hero}>
            <View style={styles.dateRow}>
              <Text style={styles.date}>2025.05.24</Text>
              <ChevronDown size={13} color={colors.textDim} />
            </View>
            <Text style={styles.todays}>Today&apos;s 100</Text>
          </View>

          {/* 情報カード 2枚(小さめ) */}
          <View style={styles.stats}>
            <StatCard
              style={styles.statItem}
              value="100 Creators"
              label="毎日100人が登場"
              icon={<Users size={15} color={colors.cyan} />}
            />
            <Pressable style={styles.statItem} onPress={() => router.push("/theme")}>
              <StatCard
                value={`テーマ：${CURRENT_THEME}`}
                label="今月のお題を見る"
                icon={<Sparkles size={15} color={colors.cyan} />}
                right={<ChevronRight size={16} color={colors.textFaint} />}
              />
            </Pressable>
          </View>

          {/* ビルボード(最重要・中央集合型) */}
          <BillboardMosaic artworks={artworks} highlightId={highlightId} />

          {/* 下部: 次の更新 / フィルター */}
          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Text style={styles.footerLabel}>次の更新まで</Text>
              <Countdown
                initialSeconds={12 * 3600 + 34 * 60 + 56}
                style={styles.countdown}
              />
            </View>
            <Pressable
              style={[styles.footerCard, styles.filter]}
              onPress={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={16} color={colors.textDim} />
              <View>
                <Text style={styles.footerLabel}>フィルター</Text>
                <Text style={styles.filterValue}>{genre ?? "すべてのジャンル"}</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
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
  content: { paddingHorizontal: 16, paddingBottom: 140, gap: 14 },
  hero: { alignItems: "center", paddingTop: 2, gap: 1 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  date: {
    color: colors.textDim,
    fontSize: 12,
    letterSpacing: 3,
  },
  todays: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  stats: { flexDirection: "row", gap: 10 },
  statItem: { flex: 1 },
  footer: { flexDirection: "row", gap: 12 },
  footerCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerLabel: { color: colors.textFaint, fontSize: 10 },
  countdown: { color: colors.cyan, fontSize: 15, fontWeight: "700", marginTop: 2 },
  filter: { flexDirection: "row", alignItems: "center", gap: 10 },
  filterValue: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 2 },
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
