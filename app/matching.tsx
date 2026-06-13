import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Brain,
  HeartHandshake,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import {
  getDiscovery,
  getResonanceMatches,
  getSensibilityProfile,
  type ResonanceMatch,
} from "@/lib/mockData";
import { formatCount } from "@/lib/format";
import { colors, gradient, radius } from "@/lib/theme";

// マッチング(Resonance Agent)
// AIは作品を評価しない。いいね履歴から感性を推定し、ジャンルを越えた出会いを推薦する。
// 現状はすべて mockData 駆動(Embedding / Claude API は未接続)。
export default function MatchingScreen() {
  const matches = getResonanceMatches();
  const profile = getSensibilityProfile();
  const discovery = getDiscovery();
  const top = matches[0];

  const onReanalyze = () =>
    Alert.alert(
      "感性プロファイルを更新しました",
      "最新のいいね履歴をもとに、あなたの感性プロファイルと共鳴相手を再計算しました。",
    );

  const onOpenMatch = (m: ResonanceMatch) =>
    Alert.alert(
      `${m.creator.name}（共鳴度 ${m.resonance}%）`,
      `${m.genre}・${m.creator.handle}\n\n${m.reason}`,
      [
        { text: "閉じる", style: "cancel" },
        { text: "作品を見る", onPress: () => router.push(`/artwork/${m.creator.id}`) },
      ],
    );

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="マッチング" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* メイン見出し */}
          <View style={styles.hero}>
            <Text style={styles.heading}>あなたと共鳴する人</Text>
            <Text style={styles.headingSub}>
              ジャンルを越えて、感性が響き合うクリエイターを見つけます。
            </Text>
          </View>

          {/* 共鳴度カード(トップマッチを大きく) */}
          {top ? (
            <Pressable onPress={() => onOpenMatch(top)}>
              <LinearGradient
                colors={["rgba(34,211,238,0.18)", "rgba(168,85,247,0.12)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topCard}
              >
                <View style={styles.topRow}>
                  <Image source={{ uri: top.creator.avatarUrl }} style={styles.topAvatar} contentFit="cover" />
                  <View style={styles.topInfo}>
                    <Text style={styles.topName}>{top.creator.name}</Text>
                    <Text style={styles.topGenre}>
                      {top.genre}・{top.creator.handle}
                    </Text>
                  </View>
                  <View style={styles.resonanceWrap}>
                    <Text style={styles.resonanceValue}>{top.resonance}%</Text>
                    <Text style={styles.resonanceLabel}>共鳴度</Text>
                  </View>
                </View>
                <Text style={styles.topReason}>{top.reason}</Text>
              </LinearGradient>
            </Pressable>
          ) : null}

          {/* 感性プロファイルカード */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHead}>
              <Sparkles size={16} color={colors.cyan} />
              <Text style={styles.cardTitle}>あなたの感性プロファイル</Text>
            </View>
            <View style={styles.traits}>
              {profile.map((t) => (
                <View key={t.label} style={styles.trait}>
                  <View style={styles.traitLabelRow}>
                    <Text style={styles.traitLabel}>{t.label}</Text>
                    <Text style={styles.traitValue}>{t.value}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={gradient.brand}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barFill, { width: `${t.value}%` }]}
                    />
                  </View>
                </View>
              ))}
            </View>
            <Pressable style={styles.reanalyze} onPress={onReanalyze}>
              <RefreshCw size={15} color={colors.text} />
              <Text style={styles.reanalyzeText}>再解析する</Text>
            </Pressable>
          </GlassCard>

          {/* あなたへの発見 */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHead}>
              <HeartHandshake size={16} color={colors.pink} />
              <Text style={styles.cardTitle}>あなたへの発見</Text>
            </View>
            <Text style={styles.discoveryTitle}>{discovery.title}</Text>
            <Text style={styles.discoveryBody}>{discovery.body}</Text>
          </GlassCard>

          {/* AIは作品を評価しません(説明カード) */}
          <View style={styles.aiNote}>
            <View style={styles.aiNoteHead}>
              <Brain size={16} color={colors.cyan} />
              <Text style={styles.aiNoteTitle}>AIは作品を評価しません</Text>
            </View>
            <Text style={styles.aiNoteBody}>
              いいね履歴から感性を推定し、ジャンルを越えた新しい創作との出会いを生み出します。
              ランキングではなく「推薦」を担当します。
            </Text>
          </View>

          {/* 推薦クリエイター(縦リスト) */}
          <View>
            <Text style={styles.sectionTitle}>共鳴するクリエイター</Text>
            <View style={styles.list}>
              {matches.map((m) => (
                <Pressable key={m.id} onPress={() => onOpenMatch(m)}>
                  <GlassCard style={styles.matchRow}>
                    <Image source={{ uri: m.creator.avatarUrl }} style={styles.matchAvatar} contentFit="cover" />
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName} numberOfLines={1}>
                        {m.creator.name}
                        <Text style={styles.matchGenre}>　{m.genre}</Text>
                      </Text>
                      <Text style={styles.matchReason} numberOfLines={2}>
                        {m.reason}
                      </Text>
                      <Text style={styles.matchSupport}>
                        {formatCount(m.creator.supporterCount)} サポーター
                      </Text>
                    </View>
                    <View style={styles.matchResonance}>
                      <Text style={styles.matchResonanceValue}>{m.resonance}%</Text>
                    </View>
                  </GlassCard>
                </Pressable>
              ))}
            </View>
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
  content: { paddingHorizontal: 16, paddingBottom: 140, gap: 16 },
  hero: { paddingTop: 4 },
  heading: { color: colors.text, fontSize: 24, fontWeight: "800" },
  headingSub: { color: colors.textDim, fontSize: 13, marginTop: 6 },

  topCard: {
    borderRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  topAvatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  topInfo: { flex: 1 },
  topName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  topGenre: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  resonanceWrap: { alignItems: "flex-end" },
  resonanceValue: { color: colors.cyan, fontSize: 24, fontWeight: "800" },
  resonanceLabel: { color: colors.textFaint, fontSize: 10 },
  topReason: { color: colors.text, fontSize: 13, lineHeight: 20, opacity: 0.9 },

  card: { padding: 18, gap: 14 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },

  traits: { gap: 12 },
  trait: { gap: 6 },
  traitLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  traitLabel: { color: colors.text, fontSize: 13 },
  traitValue: { color: colors.textDim, fontSize: 13, fontWeight: "700" },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999 },
  reanalyze: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingVertical: 11,
  },
  reanalyzeText: { color: colors.text, fontSize: 14, fontWeight: "700" },

  discoveryTitle: { color: colors.cyan, fontSize: 16, fontWeight: "800" },
  discoveryBody: { color: colors.textDim, fontSize: 13, lineHeight: 20 },

  aiNote: {
    borderRadius: radius.lg,
    borderColor: "rgba(34,211,238,0.25)",
    borderWidth: 1,
    backgroundColor: "rgba(34,211,238,0.06)",
    padding: 16,
    gap: 8,
  },
  aiNoteHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiNoteTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  aiNoteBody: { color: colors.textDim, fontSize: 12, lineHeight: 19 },

  sectionTitle: { color: colors.textDim, fontSize: 14, fontWeight: "700", marginBottom: 12 },
  list: { gap: 10 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  matchAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  matchInfo: { flex: 1, gap: 2 },
  matchName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  matchGenre: { color: colors.textFaint, fontSize: 12, fontWeight: "400" },
  matchReason: { color: colors.textDim, fontSize: 12, lineHeight: 17 },
  matchSupport: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  matchResonance: { alignItems: "center", minWidth: 44 },
  matchResonanceValue: { color: colors.cyan, fontSize: 16, fontWeight: "800" },
});
