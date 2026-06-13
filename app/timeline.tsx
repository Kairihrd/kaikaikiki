import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Box,
  Building2,
  Camera,
  Feather,
  Film,
  Frame,
  Heart,
  MessageCircle,
  Music,
  Package,
  Palette,
  PersonStanding,
  Play,
  Share2,
  Shirt,
  Sparkles,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import BottomNav from "@/components/BottomNav";
import IconButton from "@/components/IconButton";
import Tag from "@/components/Tag";
import {
  FEATURED_CREATOR,
  getArtworkById,
  getCreatorByHandle,
  getTimelinePosts,
  getTodaysArtworks,
  type TimelineMedia,
  type TimelinePost,
} from "@/lib/mockData";
import { usePosts } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { useNotifications } from "@/context/NotificationContext";
import { useLikes } from "@/context/LikesContext";
import { useSupport } from "@/context/SupportContext";
import { userPostToTimelinePost } from "@/lib/userPost";
import { hapticLight } from "@/lib/haptics";
import { formatCount } from "@/lib/format";
import { colors } from "@/lib/theme";

// 画像が無い投稿でも「作品カード」に見せるためのデフォルトアート画像。
// (アイコンだけのカードにせず、必ず画像をメイン面に表示する)
const DEFAULT_TIMELINE_IMAGE =
  "https://picsum.photos/seed/senseed-timeline-default/1000/1400?grayscale";

// 「フォロー」表記は使わない方針のため「サポート中」を使用する。
const TABS = ["おすすめ", "サポート中"] as const;
type Tab = (typeof TABS)[number];

// mediaType ごとのジャンルアイコン(カテゴリバッジ・各種演出で使用)。
const GENRE_ICON: Record<TimelineMedia, React.ComponentType<{ size?: number; color?: string }>> = {
  image: Camera,
  architecture: Building2,
  painting: Palette,
  digital: Sparkles,
  "3d": Box,
  music: Music,
  video: Film,
  poem: Feather,
  fashion: Shirt,
  product: Package,
  installation: Frame,
  dance: PersonStanding,
};

// 投稿カードから作品詳細へ安全に遷移する。
//  1) 自分の投稿(me-*) or 実在作品ID → そのまま /artwork/[id]
//  2) ハンドルから実在作品を解決 → /artwork/[id]
//  3) 解決できなければ作者プロフィールへ(誤作品へ飛ばさない/無反応にしない)
function openArtwork(post: TimelinePost) {
  if (post.id.startsWith("me-") || getArtworkById(post.id)) {
    router.push(`/artwork/${post.id}`);
    return;
  }
  const art = getTodaysArtworks().find((a) => a.creatorHandle === post.username);
  if (art) {
    router.push(`/artwork/${art.id}`);
    return;
  }
  if (post.username) router.push(`/creator/${encodeURIComponent(post.username)}`);
}

// 投稿者(アイコン/名前)→ クリエイタープロフィールへ遷移。
function openCreator(post: TimelinePost) {
  if (!post.username) return;
  router.push(`/creator/${encodeURIComponent(post.username)}`);
}

// 3. タイムライン(TikTok風・1画面1作品の縦スワイプフィード)
// タブで「おすすめ(全ジャンル)」「サポート中(応援クリエイター)」を切り替える。
export default function TimelineScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("おすすめ");
  const { height } = useWindowDimensions();
  const listRef = useRef<FlatList<TimelinePost>>(null);
  const { posts: userPosts } = usePosts();
  const { profile } = useProfile();
  const { unreadCount, dmUnread } = useNotifications();
  const { isLiked, toggleLike } = useLikes();
  const { supports } = useSupport();

  // ユーザー自身の「タイムライン投稿」だけを先頭に表示(ビルボード/テーマ投稿は除外)。
  const userTimeline = useMemo<TimelinePost[]>(
    () =>
      userPosts
        .filter((p) => p.target === "timeline")
        .map((p) =>
          userPostToTimelinePost(p, {
            name: profile.name ?? "あなた",
            handle: FEATURED_CREATOR.handle,
            avatarUrl: profile.avatarUri ?? FEATURED_CREATOR.avatarUrl,
          }),
        ),
    [userPosts, profile],
  );

  // 「サポート中」タブ: 実際に自分がサポートした作品(SupportContext)をカード化する。
  const supportTimeline = useMemo<TimelinePost[]>(
    () =>
      supports.map((s) => ({
        id: s.id, // 実在作品ID(タップで作品詳細へ)
        category: "サポート中",
        title: s.artworkTitle ?? "作品",
        creatorName: s.artistName ?? "クリエイター",
        username: s.artistHandle ?? "",
        avatarUrl: getCreatorByHandle(s.artistHandle ?? "").avatarUrl,
        description: "",
        tags: [],
        likes: 0,
        comments: 0,
        soundLabel: "サポート中の作品",
        mediaType: "image",
        imageUrl: s.imageUrl ?? DEFAULT_TIMELINE_IMAGE,
        gradient: ["#0b0d10", "#1c2026", "#05070a"],
        accent: colors.cyan,
      })),
    [supports],
  );

  const posts = useMemo<TimelinePost[]>(
    () =>
      activeTab === "おすすめ"
        ? [...userTimeline, ...getTimelinePosts()]
        : supportTimeline,
    [activeTab, userTimeline, supportTimeline],
  );

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    // タブ切り替え時は先頭に戻す。
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const onToggleLike = useCallback(
    (id: string) => {
      const nowLiked = toggleLike(id); // AsyncStorage に永続化
      if (nowLiked) {
        hapticLight(); // いいね時の軽い振動
        // 自分のいいね操作では自分の通知一覧に通知を追加しない。
        // (ローカルMVPでは他端末へ通知できないため。投稿者宛の通知は将来 Supabase 側で実装)
      }
    },
    [toggleLike],
  );

  // 各アイテムは画面高さぴったり。これで1画面1投稿にスナップする。
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [height],
  );

  const renderItem = useCallback(
    ({ item }: { item: TimelinePost }) => (
      <PostCard
        post={item}
        height={height}
        liked={isLiked(item.id)}
        onLike={() => onToggleLike(item.id)}
      />
    ),
    [height, isLiked, onToggleLike],
  );

  return (
    <View style={styles.root}>
      <ScreenGlow />

      {/* 縦スワイプフィード(全画面スナップ) */}
      <FlatList
        ref={listRef}
        data={posts}
        extraData={isLiked}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        ListEmptyComponent={
          <View style={[styles.empty, { height }]}>
            <Text style={styles.emptyText}>
              まだサポートした作品はありません。{"\n"}
              作品詳細の「サポートする」から応援できます。
            </Text>
          </View>
        }
      />

      {/* 上部固定オーバーレイ: ロゴ + 検索/通知 + タブ + Today's 100 */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe} pointerEvents="box-none">
        <View style={styles.top} pointerEvents="box-none">
          <View style={styles.topRow}>
            <Pressable onPress={() => router.push("/")}>
              <Image
                source={require("../assets/logo-wide.png")}
                style={styles.logoImg}
                contentFit="contain"
                accessibilityLabel="senseed"
              />
            </Pressable>
            <View style={styles.topActions}>
              <View>
                <IconButton
                  accessibilityLabel="通知"
                  onPress={() => router.push("/notifications")}
                >
                  <Bell size={20} color={colors.text} />
                </IconButton>
                {unreadCount > 0 ? <View style={styles.unreadBadge} /> : null}
              </View>
              <View>
                <IconButton
                  accessibilityLabel="メッセージ"
                  onPress={() => router.push("/messages")}
                >
                  <MessageCircle size={20} color={colors.text} />
                </IconButton>
                {dmUnread > 0 ? <View style={styles.unreadBadge} /> : null}
              </View>
            </View>
          </View>

          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => switchTab(tab)}
                style={[
                  styles.tab,
                  activeTab === tab ? styles.tabActive : styles.tabInactive,
                ]}
              >
                <Text
                  style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.badgeWrap}>
            <LinearGradient
              colors={[colors.cyan, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>Today&apos;s 100</Text>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 1投稿(全画面)。メディア + 右アクション + 左下情報。
// ---------------------------------------------------------------------------
function PostCard({
  post,
  height,
  liked,
  onLike,
}: {
  post: TimelinePost;
  height: number;
  liked: boolean;
  onLike: () => void;
}) {
  const likeCount = post.likes + (liked ? 1 : 0);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.title} / ${post.creatorName} — senseed`,
      });
    } catch {
      Alert.alert("シェア", "共有しました");
    }
  };

  return (
    <View style={[styles.card, { height }]}>
      {/* 作品メディア(タップで作品詳細へ)。 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => openArtwork(post)}>
        <PostMedia post={post} />
      </Pressable>

      {/* 右側: 縦並びアクション(投稿ごとに表示) */}
      <View style={styles.actions}>
        {/* アイコン → クリエイタープロフィール */}
        <Pressable
          style={styles.avatarWrap}
          onPress={() => openCreator(post)}
          accessibilityLabel={`${post.creatorName} のプロフィール`}
        >
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} contentFit="cover" />
        </Pressable>
        <ActionButton
          icon={
            <Heart
              size={26}
              color={liked ? colors.pink : colors.text}
              fill={liked ? colors.pink : "transparent"}
            />
          }
          label={formatCount(likeCount)}
          onPress={onLike}
        />
        {/* コメント → 作品詳細(コメント欄) */}
        <ActionButton
          icon={<MessageCircle size={26} color={colors.text} />}
          label={formatCount(post.comments)}
          onPress={() => openArtwork(post)}
        />
        <ActionButton
          icon={<Share2 size={26} color={colors.text} />}
          label="シェア"
          onPress={onShare}
        />
      </View>

      {/* 左下: 作品情報 */}
      <View style={styles.info}>
        <Text style={styles.genre}>{post.category}</Text>
        {/* タイトル → 作品詳細 */}
        <Pressable onPress={() => openArtwork(post)}>
          <Text style={styles.title}>{post.title}</Text>
        </Pressable>
        {/* 投稿者名/@ → クリエイタープロフィール */}
        <Pressable onPress={() => openCreator(post)}>
          <Text style={styles.creatorLine}>
            {post.creatorName} <Text style={styles.handle}>{post.username}</Text>
          </Text>
        </Pressable>
        <Text style={styles.desc} numberOfLines={2}>
          {post.description}
        </Text>
        <View style={styles.tagRow}>
          {post.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
        <View style={styles.sound}>
          <Music size={14} color={colors.cyan} />
          <Text style={styles.soundText} numberOfLines={1}>
            {post.soundLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// メディア表示。category / mediaType に応じて見せ方を変える。
// 画像系は写真、それ以外はグラデーション + ジャンル別の演出で表現する。
// ---------------------------------------------------------------------------
function PostMedia({ post }: { post: TimelinePost }) {
  // 画像が無い投稿でもデフォルトのアート画像を使い、必ず画像をメイン面に出す。
  const uri = post.imageUrl ?? DEFAULT_TIMELINE_IMAGE;
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 背景: ぼかした同じ画像 + 黒で自然に埋め、作品は contain で切れず表示。 */}
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={30}
        transition={250}
      />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        transition={250}
      />

      {/* 可読性のための上下グラデーション */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ジャンル別の演出(中央) */}
      <Decoration post={post} />
    </View>
  );
}

function Decoration({ post }: { post: TimelinePost }) {
  const Icon = GENRE_ICON[post.mediaType];

  // 作品画像がある場合はメイン面を画像に任せ、装飾は最小限にする
  // (右上の小さなジャンルバッジ + 映像/ダンスの再生アイコン + 詩の本文のみ)。
  if (post.imageUrl) {
    if (post.mediaType === "video" || post.mediaType === "dance") {
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.center}>
            <View style={styles.playButton}>
              <Play size={34} color={colors.text} fill={colors.text} />
            </View>
          </View>
          <View style={styles.topRightBadge}>
            <CategoryBadge
              label={post.mediaType === "dance" ? "パフォーマンス" : "映像作品"}
              accent={post.accent}
              Icon={Icon}
            />
          </View>
        </View>
      );
    }
    if (post.mediaType === "poem") {
      return (
        <View style={styles.poemWrap} pointerEvents="none">
          <Feather size={22} color={post.accent} style={styles.poemMark} />
          <Text style={styles.poemBody}>{post.body ?? post.description}</Text>
        </View>
      );
    }
    return (
      <View style={styles.topRightBadge} pointerEvents="none">
        <CategoryBadge label={post.category} accent={post.accent} Icon={Icon} />
      </View>
    );
  }

  // 画像が無い場合のフォールバック演出(従来表現)。
  switch (post.mediaType) {
    case "music":
      return (
        <View style={styles.center} pointerEvents="none">
          <View style={[styles.iconRing, { borderColor: post.accent }]}>
            <Music size={40} color={post.accent} />
          </View>
          <Waveform accent={post.accent} />
          <View style={styles.nowPlaying}>
            <Text style={[styles.nowPlayingText, { color: post.accent }]}>
              ♪ 再生中 — {post.category}
            </Text>
          </View>
        </View>
      );

    case "poem":
      return (
        <View style={styles.poemWrap} pointerEvents="none">
          <Feather size={22} color={post.accent} style={styles.poemMark} />
          <Text style={styles.poemBody}>{post.body ?? post.description}</Text>
        </View>
      );

    case "digital":
    case "3d":
      return (
        <View style={styles.center} pointerEvents="none">
          <View style={[styles.blob, styles.blobA, { backgroundColor: post.accent }]} />
          <View style={[styles.blob, styles.blobB, { backgroundColor: colors.purple }]} />
          <View style={[styles.iconRing, { borderColor: post.accent }]}>
            <Icon size={40} color={post.accent} />
          </View>
          <CategoryBadge label={post.category} accent={post.accent} Icon={Icon} />
        </View>
      );

    case "painting":
      return (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.canvas}>
            <View style={[styles.brushStroke, { backgroundColor: post.accent }]} />
            <View style={[styles.brushStroke, styles.brushStroke2]} />
          </View>
          <CategoryBadge label="絵画 / 筆" accent={post.accent} Icon={Palette} />
        </View>
      );

    case "video":
    case "dance":
      return (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.playButton}>
            <Play size={34} color={colors.text} fill={colors.text} />
          </View>
          <CategoryBadge
            label={post.mediaType === "dance" ? "パフォーマンス" : "映像作品"}
            accent={post.accent}
            Icon={Icon}
          />
        </View>
      );

    case "installation":
    case "product":
      return (
        <View style={styles.center} pointerEvents="none">
          <View style={[styles.frame, { borderColor: post.accent }]}>
            <Icon size={36} color={post.accent} />
          </View>
          <CategoryBadge
            label={post.mediaType === "installation" ? "空間展示" : "プロダクト"}
            accent={post.accent}
            Icon={Icon}
          />
        </View>
      );

    case "architecture":
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Grid />
          <View style={styles.topRightBadge}>
            <CategoryBadge label="建築 / 図面" accent={post.accent} Icon={Building2} />
          </View>
        </View>
      );

    case "fashion":
      return (
        <View style={styles.topRightBadge} pointerEvents="none">
          <CategoryBadge label="LOOKBOOK" accent={post.accent} Icon={Shirt} />
        </View>
      );

    default: // image(写真)
      return (
        <View style={styles.topRightBadge} pointerEvents="none">
          <CategoryBadge label="写真" accent={post.accent} Icon={Camera} />
        </View>
      );
  }
}

// 音楽用の波形(決定論的な高さでバーを並べる)。
function Waveform({ accent }: { accent: string }) {
  const bars = Array.from({ length: 30 }, (_, i) => {
    const h = 8 + Math.round(Math.abs(Math.sin(i * 0.9) + Math.sin(i * 0.35)) * 26);
    return h;
  });
  return (
    <View style={styles.waveform}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            backgroundColor: accent,
            opacity: 0.85,
          }}
        />
      ))}
    </View>
  );
}

// 建築用のグリッド線(図面っぽさ)。
function Grid() {
  const cols = [15, 35, 55, 75];
  const rows = [25, 45, 65];
  return (
    <View style={StyleSheet.absoluteFill}>
      {cols.map((left) => (
        <View key={`c${left}`} style={[styles.gridLine, styles.gridV, { left: `${left}%` }]} />
      ))}
      {rows.map((top) => (
        <View key={`r${top}`} style={[styles.gridLine, styles.gridH, { top: `${top}%` }]} />
      ))}
    </View>
  );
}

function CategoryBadge({
  label,
  accent,
  Icon,
}: {
  label: string;
  accent: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <View style={styles.catBadge}>
      <Icon size={13} color={accent} />
      <Text style={[styles.catBadgeText, { color: accent }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <View style={styles.actionIcon}>{icon}</View>
      {label ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: { width: "100%", backgroundColor: colors.bg },
  dim: { backgroundColor: "rgba(0,0,0,0.5)" },

  // 「サポート中」が空のときの表示
  empty: { alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyText: { color: colors.textDim, fontSize: 14, textAlign: "center", lineHeight: 22 },

  // ヘッダー(固定オーバーレイ)
  headerSafe: { position: "absolute", top: 0, left: 0, right: 0 },
  top: { paddingHorizontal: 16, paddingTop: 6 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoImg: { width: 100, height: 36 },
  topActions: { flexDirection: "row", gap: 8 },
  unreadBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.pink,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  tabs: { flexDirection: "row", gap: 8, paddingVertical: 12 },
  tab: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 6 },
  tabActive: { backgroundColor: colors.text },
  tabInactive: { backgroundColor: "rgba(255,255,255,0.12)" },
  tabText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: colors.bg },
  badgeWrap: { flexDirection: "row" },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: "700" },

  // 右側アクション
  actions: { position: "absolute", right: 12, bottom: 190, alignItems: "center", gap: 18 },
  avatarWrap: { width: 48, height: 48, marginBottom: 4 },
  avatar: { width: 48, height: 48, borderRadius: 999, borderColor: colors.text, borderWidth: 2 },
  action: { alignItems: "center", gap: 4 },
  actionPressed: { opacity: 0.6, transform: [{ scale: 0.92 }] },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { color: colors.text, fontSize: 11 },

  // 左下情報
  info: { position: "absolute", left: 16, bottom: 120, maxWidth: "72%" },
  genre: { color: colors.cyan, fontSize: 12, fontWeight: "600" },
  title: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 4 },
  creatorLine: { color: colors.text, fontSize: 14, marginTop: 4 },
  handle: { color: colors.textDim },
  desc: { color: colors.textDim, fontSize: 13, marginTop: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  sound: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    alignSelf: "flex-start",
    maxWidth: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  soundText: { color: colors.text, fontSize: 12, flexShrink: 1 },

  // 演出共通
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  catBadgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  topRightBadge: { position: "absolute", top: 150, right: 16 },

  // 音楽
  waveform: { flexDirection: "row", alignItems: "center", gap: 3, height: 60 },
  nowPlaying: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  nowPlayingText: { fontSize: 12, fontWeight: "700" },

  // 詩 / 文章
  poemWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 18,
  },
  poemMark: { opacity: 0.8 },
  poemBody: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 38,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 1,
  },

  // デジタル / 3D
  blob: { position: "absolute", borderRadius: 999, opacity: 0.35 },
  blobA: { width: 220, height: 220, top: "22%", left: "8%" },
  blobB: { width: 180, height: 180, bottom: "26%", right: "6%" },

  // 絵画
  canvas: {
    width: 200,
    height: 240,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    justifyContent: "center",
  },
  brushStroke: {
    height: 22,
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 12,
    opacity: 0.8,
    transform: [{ rotate: "-4deg" }],
  },
  brushStroke2: {
    backgroundColor: "rgba(255,255,255,0.4)",
    height: 14,
    marginHorizontal: 36,
  },

  // 映像 / ダンス
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  // インスタレーション / プロダクト
  frame: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  // 建築グリッド
  gridLine: { position: "absolute", backgroundColor: "rgba(255,255,255,0.12)" },
  gridV: { top: 0, bottom: 0, width: 1 },
  gridH: { left: 0, right: 0, height: 1 },
});
