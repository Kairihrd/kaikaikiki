import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SlidersHorizontal, Sparkles, Users } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BillboardMosaic from "@/components/BillboardMosaic";
import StatCard from "@/components/StatCard";
import Countdown from "@/components/Countdown";
import { CURRENT_THEME, getTodaysArtworks } from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 1. 今日のビルボード(アプリのメイン画面)
export default function HomeScreen() {
  const artworks = getTodaysArtworks();

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

          {/* ビルボード(最重要) */}
          <BillboardMosaic artworks={artworks} highlightId="1" />

          {/* 下部: 次の更新 / フィルター */}
          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Text style={styles.footerLabel}>次の更新まで</Text>
              <Countdown
                initialSeconds={12 * 3600 + 34 * 60 + 56}
                style={styles.countdown}
              />
            </View>
            <Pressable style={[styles.footerCard, styles.filter]}>
              <SlidersHorizontal size={16} color={colors.textDim} />
              <View>
                <Text style={styles.footerLabel}>フィルター</Text>
                <Text style={styles.filterValue}>すべてのジャンル</Text>
              </View>
            </Pressable>
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
});
