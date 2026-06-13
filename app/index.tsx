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
import { Check, SlidersHorizontal, Sparkles, Users, X } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import StatCard from "@/components/StatCard";
import Countdown from "@/components/Countdown";
import {
  CURRENT_THEME,
  GENRES,
  getTodaysArtworks,
  type Genre,
} from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 1. 今日のビルボード(アプリのメイン画面)
export default function HomeScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [genre, setGenre] = useState<Genre | null>(null);

  const all = getTodaysArtworks();
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
          {/* 日付 + Today's 100 */}
          <View style={styles.hero}>
            <Text style={styles.date}>2025.05.24</Text>
            <Text style={styles.todays}>Today&apos;s 100</Text>
            <Text style={styles.heroSub}>
              今日選ばれた100の作品が、空間に浮かびあがる。
            </Text>
          </View>

          {/* 情報カード 2枚 */}
          <View style={styles.stats}>
            <StatCard
              style={styles.statItem}
              value="100 Creators"
              label="毎日100人が登場"
              icon={<Users size={16} color={colors.cyan} />}
            />
            <Pressable style={styles.statItem} onPress={() => router.push("/theme")}>
              <StatCard
                value={`テーマ：${CURRENT_THEME}`}
                label="今月のお題を見る"
                icon={<Sparkles size={16} color={colors.cyan} />}
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
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 20 },
  hero: { alignItems: "center", paddingTop: 6 },
  date: {
    color: colors.textDim,
    fontSize: 13,
    letterSpacing: 6,
  },
  todays: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  heroSub: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  stats: { flexDirection: "row", gap: 12 },
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
