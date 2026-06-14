import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Play } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import StatusIcon from "@/components/StatusIcon";
import {
  FEATURED_CREATOR,
  getCreatorByHandle,
  getTodaysArtworks,
} from "@/lib/mockData";
import { genreMeta } from "@/lib/genre";
import { userPostToArtwork } from "@/lib/userPost";
import {
  getSenseedStatus,
  statusProgress,
  STATUS_UNIT,
  type StatusKind,
  type StatusLevel,
} from "@/lib/status";
import {
  fetchProfileByHandle,
  fetchCreatorWorks,
  type SupaCreator,
  type CreatorWork,
} from "@/lib/posts";
import { usePosts } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { useSupport } from "@/context/SupportContext";
import { colors, gradient, radius } from "@/lib/theme";

// クリエイタープロフィール。タイムライン等の投稿者タップから開く。
// 表示: ヘッダー / Senseed Status / 自信作(代表作) / 過去の投稿。
// MVP: mockData の作者 + 自分の投稿(PostsContext)に対応。Supabase 未接続。
// ※ クリエイター単位サポートは未実装のため出さない(サポートは作品詳細に集約)。
export default function CreatorScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const decoded = decodeURIComponent(handle ?? "");
  const rawHandle = decoded.replace(/^@/, ""); // profiles は @ なしで保存
  const { posts: myPosts, featuredPost } = usePosts();
  const { profile } = useProfile();
  const { supports } = useSupport();

  // Supabase の相手プロフィール(見つかれば最優先。カナタ固定にはフォールバックしない)。
  const [supa, setSupa] = useState<SupaCreator | null>(null);
  const [supaWorks, setSupaWorks] = useState<CreatorWork[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await fetchProfileByHandle(rawHandle);
      if (!alive) return;
      setSupa(p);
      if (p) {
        const w = await fetchCreatorWorks(p.id);
        if (alive) setSupaWorks(w ?? []);
      } else if (alive) {
        setSupaWorks([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [rawHandle]);

  // --- モック/ローカル フォールバック(Supabase に居ない作者用) ---
  const baseCreator = getCreatorByHandle(decoded);
  const isMe = decoded === FEATURED_CREATOR.handle;
  const author = {
    name: isMe ? profile.name ?? baseCreator.name : baseCreator.name,
    handle: decoded,
    avatarUrl: isMe
      ? profile.avatarUri ?? baseCreator.avatarUrl
      : baseCreator.avatarUrl,
  };
  const mockWorks: CreatorWork[] = [
    ...(isMe ? myPosts.map((p) => userPostToArtwork(p, author)) : []),
    ...getTodaysArtworks().filter((a) => a.creatorHandle === decoded),
  ].map((a) => ({
    id: a.id,
    title: a.title,
    genre: a.genre,
    imageUrl: a.imageUrl,
    isVideo: a.isVideo,
  }));

  // --- 表示用(Supabase 優先) ---
  const dispName = supa ? supa.display_name || supa.handle || "ユーザー" : author.name;
  const dispHandle = supa ? (supa.handle ? `@${supa.handle}` : "") : author.handle;
  const dispAvatar = supa
    ? supa.avatar_url ||
      `https://picsum.photos/seed/senseed-avatar-${supa.handle ?? supa.id}/200/200`
    : author.avatarUrl;
  const dispBio = supa ? supa.bio : isMe ? profile.bio ?? baseCreator.bio : baseCreator.bio;
  const dispLocation = supa ? supa.location : baseCreator.location;
  const dispRole = supa ? supa.role : baseCreator.role;
  const works: CreatorWork[] = supa ? supaWorks : mockWorks;

  // 自信作/代表作: mock の自分は featuredPost 優先、それ以外は先頭。
  const mockFeatured =
    !supa && isMe && featuredPost ? userPostToArtwork(featuredPost, author) : null;
  const featured: CreatorWork | null = supa
    ? supaWorks[0] ?? null
    : mockFeatured
      ? {
          id: mockFeatured.id,
          title: mockFeatured.title,
          genre: mockFeatured.genre,
          imageUrl: mockFeatured.imageUrl,
          isVideo: mockFeatured.isVideo,
        }
      : works[0] ?? null;

  // Senseed Status: 表現=投稿数、発掘=自分のみサポート数(他人は不明=0)。
  const status = getSenseedStatus(works.length, supa ? 0 : isMe ? supports.length : 0);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="クリエイター" showBack showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <LinearGradient colors={gradient.brand} style={styles.avatarRing}>
              <Image source={{ uri: dispAvatar }} style={styles.avatar} contentFit="cover" />
            </LinearGradient>
            <Text style={styles.name}>{dispName}</Text>
            {dispHandle ? <Text style={styles.handle}>{dispHandle}</Text> : null}
            {dispLocation || dispRole ? (
              <Text style={styles.meta}>
                {[dispLocation, dispRole].filter(Boolean).join("・")}
              </Text>
            ) : null}
            {dispBio ? <Text style={styles.bio}>{dispBio}</Text> : null}
          </View>

          {/* Senseed Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Senseed Status</Text>
            <StatusRow kind="expression" level={status.expressionLevel} count={status.expressionCount} />
            <StatusRow kind="discovery" level={status.discoveryLevel} count={status.discoveryCount} />
          </View>

          {/* 自信作 / 代表作 */}
          {featured ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{!supa && isMe ? "自信作" : "代表作"}</Text>
              <Pressable onPress={() => router.push(`/artwork/${featured.id}`)}>
                <GlassCard style={styles.featured}>
                  <Image source={{ uri: featured.imageUrl }} style={styles.featuredImage} contentFit="cover" />
                  {featured.isVideo ? (
                    <View style={styles.featuredPlay} pointerEvents="none">
                      <Play size={20} color={colors.text} fill={colors.text} />
                    </View>
                  ) : null}
                  <View style={styles.featuredBody}>
                    <Text style={styles.featuredTitle} numberOfLines={1}>{featured.title}</Text>
                    <Text style={styles.featuredGenre}>{featured.genre}</Text>
                  </View>
                </GlassCard>
              </Pressable>
            </View>
          ) : null}

          {/* 過去の投稿 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>投稿した作品</Text>
            {works.length === 0 ? (
              <Text style={styles.empty}>まだ投稿がありません。</Text>
            ) : (
              <View style={styles.grid}>
                {works.map((a) => {
                  const meta = genreMeta(a.genre as never);
                  const GenreIcon = meta.Icon;
                  return (
                    <Pressable
                      key={a.id}
                      style={styles.gridItem}
                      onPress={() => router.push(`/artwork/${a.id}`)}
                    >
                      <Image source={{ uri: a.imageUrl }} style={styles.gridImage} contentFit="cover" />
                      {a.isVideo ? (
                        <View style={styles.gridPlay} pointerEvents="none">
                          <Play size={13} color={colors.text} fill={colors.text} />
                        </View>
                      ) : null}
                      <View style={styles.gridBadge}>
                        <GenreIcon size={11} color={meta.accent} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const STATUS_META: Record<StatusKind, { label: string }> = {
  expression: { label: "表現者ステータス" },
  discovery: { label: "発掘者ステータス" },
};

function StatusRow({
  kind,
  level,
  count,
}: {
  kind: StatusKind;
  level: StatusLevel;
  count: number;
}) {
  const prog = statusProgress(count, level);
  const meta = STATUS_META[kind];
  return (
    <GlassCard style={styles.statusCard}>
      <Image source={level.image} style={styles.statusImg} contentFit="cover" />
      <View style={styles.statusBody}>
        <View style={styles.statusKindRow}>
          <StatusIcon kind={kind} size={20} />
          <Text style={styles.statusKind}>{meta.label}</Text>
        </View>
        <Text style={styles.statusLevel}>Lv.{level.level} {level.name}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.round(prog.ratio * 100)}%` }]} />
        </View>
        <Text style={styles.statusSub}>
          {prog.isMax
            ? "最大レベル"
            : `${STATUS_UNIT[kind]} ${prog.current} / 次まで ${prog.remaining}`}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 18 },
  header: { alignItems: "center", paddingTop: 6 },
  avatarRing: { borderRadius: 999, padding: 3 },
  avatar: { width: 92, height: 92, borderRadius: 999 },
  name: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 12 },
  handle: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 6 },
  bio: { color: colors.text, fontSize: 14, marginTop: 10, textAlign: "center" },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  empty: { color: colors.textDim, fontSize: 13 },

  // Senseed Status
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  statusImg: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#0a0a0a",
    borderColor: "rgba(101,212,110,0.4)",
    borderWidth: 1,
  },
  statusBody: { flex: 1, gap: 4 },
  statusKindRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusKind: { color: colors.text, fontSize: 13, fontWeight: "700" },
  statusLevel: { color: "#86efac", fontSize: 15, fontWeight: "800" },
  barTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    marginTop: 2,
  },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: "#4ade80" },
  statusSub: { color: colors.textDim, fontSize: 12 },

  // 自信作 / 代表作
  featured: { overflow: "hidden" },
  featuredImage: { width: "100%", height: 180 },
  featuredPlay: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredBody: { padding: 14 },
  featuredTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  featuredGenre: { color: colors.textDim, fontSize: 12, marginTop: 2 },

  // グリッド
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  gridImage: { width: "100%", height: "100%" },
  gridPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 28,
    height: 28,
    marginTop: -14,
    marginLeft: -14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
