import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  getLikedArtworksSample,
  getResonanceMatches,
  getSensibilityProfile,
  getTodaysArtworks,
  type Creator,
  type Discovery,
  type ResonanceMatch,
  type SensibilityTrait,
} from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { formatCount } from "@/lib/format";
import { colors, gradient, radius } from "@/lib/theme";

// backend(FastAPI)の URL。未設定ならモック表示のまま動作する。
// 例: EXPO_PUBLIC_API_URL=http://127.0.0.1:8000 npx expo start
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// /resonance のレスポンス型
interface ApiProfile { label: string; score: number }
interface ApiMatch { id: string; name: string; genre: string; resonance: number; reason: string }
interface ApiDiscovery { title: string; description: string }
interface ApiResponse {
  profile: ApiProfile[];
  matches: ApiMatch[];
  discoveries: ApiDiscovery[];
  usedAI: boolean;
}

// --- 1日1回ルール(端末ローカル保存) -----------------------------------------
// MVP ではログイン/DB が無いため、AsyncStorage で端末内に「最終解析日」を保存し、
// 1ユーザー1日1回までに制限する(Gemini API の使用量を抑えるため)。
const USER_ID = "current-user";
const STORAGE_KEY = `senseed:matching:lastAnalysis:${USER_ID}`;

// ローカル日付(YYYY-MM-DD)。日付が変われば再解析できる。
function getToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

interface StoredAnalysis {
  date: string; // 最終解析日(YYYY-MM-DD)
  usedAI: boolean;
  result: { profile: SensibilityTrait[]; matches: ResonanceMatch[]; discovery: Discovery };
  updatedAt: string;
}

// API の match(クリエイター名のみ)を、画面が使う Creator 付き ResonanceMatch に変換する。
function toResonanceMatch(m: ApiMatch): ResonanceMatch {
  const creator: Creator = {
    id: m.id,
    name: m.name,
    handle: `@${m.name}`,
    avatarUrl: `https://picsum.photos/seed/senseed-avatar-${encodeURIComponent(m.name)}/200/200`,
    bio: "",
    location: "",
    role: "クリエイター",
    supporterCount: 200 + m.resonance * 12,
  };
  return { id: m.id, creator, resonance: m.resonance, genre: m.genre, reason: m.reason };
}

// マッチング(Resonance Agent)
// AIは作品を評価しない。いいね履歴から感性を推定し、ジャンルを越えた出会いを推薦する。
// EXPO_PUBLIC_API_URL が設定され backend が起動していれば API を使い、失敗時はモックにフォールバック。
export default function MatchingScreen() {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<ResonanceMatch[]>(() => getResonanceMatches());
  const [profile, setProfile] = useState<SensibilityTrait[]>(() => getSensibilityProfile());
  const [discovery, setDiscovery] = useState<Discovery>(() => getDiscovery());
  const [loading, setLoading] = useState(false);
  const [analyzedToday, setAnalyzedToday] = useState(false);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const top = matches[0];

  // 初回表示: 今日の解析結果が保存済みなら復元、無ければモックのまま。
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved: StoredAnalysis = JSON.parse(raw);
        setLastDate(saved.date);
        if (saved.date === getToday()) {
          setAnalyzedToday(true);
          if (saved.result?.profile?.length) setProfile(saved.result.profile);
          if (saved.result?.matches?.length) setMatches(saved.result.matches);
          if (saved.result?.discovery) setDiscovery(saved.result.discovery);
        }
      } catch {
        // 破損データは無視してモック表示を継続
      }
    })();
  }, []);

  const onReanalyze = async () => {
    // 1日1回ルール: 今日すでに解析済みなら API を呼ばず、保存済み結果のままにする。
    if (analyzedToday) {
      Alert.alert(
        "今日のマッチング解析は完了しています。",
        "明日また解析できます。",
      );
      return;
    }
    if (!API_URL) {
      Alert.alert(
        "感性プロファイルを更新しました",
        "最新のいいね履歴をもとに再計算しました。（モック表示・AIサーバー未設定）",
      );
      return;
    }
    setLoading(true);
    try {
      // 写真だけに偏らないよう、多ジャンルから集めた「いいね作品」を渡す。
      // これで AI がジャンル横断(文章・音楽・デジタル等)で推薦理由を作れる。
      const likedArtworks = getLikedArtworksSample(6).map((a) => ({
        id: a.id,
        title: a.title,
        genre: a.genre,
        description: a.description,
        tags: a.tags,
      }));
      const res = await fetch(`${API_URL}/resonance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedArtworks }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      const nextProfile = data.profile?.length
        ? data.profile.map((p) => ({ label: p.label, value: p.score }))
        : profile;
      const nextMatches = data.matches?.length
        ? data.matches.map(toResonanceMatch)
        : matches;
      const nextDiscovery = data.discoveries?.length
        ? { title: data.discoveries[0].title, body: data.discoveries[0].description }
        : discovery;

      setProfile(nextProfile);
      setMatches(nextMatches);
      setDiscovery(nextDiscovery);

      // HTTP 200 を受け取れたら(usedAI:true/false どちらでも)保存し、今日は解析済みにする。
      const today = getToday();
      const stored: StoredAnalysis = {
        date: today,
        usedAI: data.usedAI,
        result: { profile: nextProfile, matches: nextMatches, discovery: nextDiscovery },
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setAnalyzedToday(true);
      setLastDate(today);

      Alert.alert(
        "感性プロファイルを更新しました",
        data.usedAI
          ? "Gemini を使って感性プロファイルと共鳴相手を再解析しました。"
          : "ローカル解析で再計算しました（AIキー未設定）。",
      );
    } catch {
      // API 接続失敗時は保存しない(=今日は未解析のまま再試行できる)。
      Alert.alert(
        "オフライン",
        "AIサーバーに接続できないため、モック結果を表示しています。",
      );
    } finally {
      setLoading(false);
    }
  };

  const statusText = analyzedToday
    ? `今日の解析済み・明日また解析できます${lastDate ? `（最終解析：${lastDate.replace(/-/g, ".")}）` : ""}`
    : "今日の解析はまだです";
  const buttonLabel = loading
    ? "解析中…"
    : analyzedToday
      ? "今日の解析済み"
      : "今日のマッチングを解析する";

  // クリエイターのハンドルから実在する作品IDを引く(無ければ undefined)。
  // creator.id は作品IDではないため、誤った作品詳細へ飛ばさないようにする。
  const artworkIdForMatch = (m: ResonanceMatch): string | undefined =>
    getTodaysArtworks().find((a) => a.creatorHandle === m.creator.handle)?.id;

  const onOpenMatch = (m: ResonanceMatch) => {
    const artworkId = artworkIdForMatch(m);
    // 実在作品がある時だけ「作品を見る」を表示し、正しい作品詳細へ遷移する。
    Alert.alert(
      `${m.creator.name}（共鳴度 ${m.resonance}%）`,
      `${m.genre}・${m.creator.handle}\n\n${m.reason}`,
      artworkId
        ? [
            { text: "閉じる", style: "cancel" },
            { text: "作品を見る", onPress: () => router.push(`/artwork/${artworkId}`) },
          ]
        : [{ text: "閉じる", style: "cancel" }],
    );
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.matching")} />

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
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, analyzedToday && styles.statusDone]}>
                {statusText}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.reanalyze,
                (pressed || loading) && styles.reanalyzePressed,
                analyzedToday && styles.reanalyzeDone,
              ]}
              onPress={onReanalyze}
              disabled={loading}
            >
              <RefreshCw size={15} color={analyzedToday ? colors.textDim : colors.text} />
              <Text style={[styles.reanalyzeText, analyzedToday && styles.reanalyzeTextDone]}>
                {buttonLabel}
              </Text>
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
  reanalyzePressed: { opacity: 0.6 },
  reanalyzeDone: { backgroundColor: "rgba(255,255,255,0.03)", borderColor: colors.border },
  reanalyzeText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  reanalyzeTextDone: { color: colors.textDim },
  statusRow: { alignItems: "center" },
  statusText: { color: colors.textFaint, fontSize: 11 },
  statusDone: { color: colors.cyan },

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
