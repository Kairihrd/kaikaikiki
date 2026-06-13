import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  MessageCircle,
  Play,
  Send,
  Share2,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import Tag from "@/components/Tag";
import {
  FEATURED_CREATOR,
  getArtworkById,
  getCommentsForArtwork,
  getCreatorByHandle,
  type Comment,
} from "@/lib/mockData";
import { usePosts } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { useLikes } from "@/context/LikesContext";
import { useSupport } from "@/context/SupportContext";
import { userPostToArtwork } from "@/lib/userPost";
import { hapticLight } from "@/lib/haptics";
import { formatCount } from "@/lib/format";
import { colors, radius } from "@/lib/theme";

// 4. 作品詳細
export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts } = usePosts();
  const { profile } = useProfile();
  // モック作品が無ければ、自分の投稿(UserPost)を作品として表示する。
  const userPost = posts.find((p) => p.id === id);
  const artwork =
    getArtworkById(id ?? "1") ??
    (userPost
      ? userPostToArtwork(userPost, {
          name: profile.name ?? "あなた",
          handle: FEATURED_CREATOR.handle,
          avatarUrl: profile.avatarUri ?? FEATURED_CREATOR.avatarUrl,
        })
      : getArtworkById("1")!);
  const creator = getCreatorByHandle(artwork.creatorHandle);

  const scrollRef = useRef<ScrollView>(null);
  const { isLiked, toggleLike } = useLikes();
  const { isSupported, toggleSupport } = useSupport();
  const liked = isLiked(artwork.id);
  const supporting = isSupported(artwork.id);
  const onToggleSupport = () => {
    const now = toggleSupport({
      id: artwork.id,
      artistName: creator.name,
      artistHandle: creator.handle,
      artworkTitle: artwork.title,
      imageUrl: artwork.imageUrl,
    });
    if (now) hapticLight(); // サポート時の軽い振動
  };
  // 既定(モック)コメント + ユーザー追加コメント(作品IDごとに AsyncStorage 保存)。
  const seedComments = useMemo(
    () => getCommentsForArtwork(artwork.id),
    [artwork.id],
  );
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const comments = [...seedComments, ...userComments];
  const [draft, setDraft] = useState("");
  const commentsKey = `senseed:comments:${artwork.id}`;

  // 保存済みのユーザーコメントを復元(離脱して戻っても残る)。
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(commentsKey);
        if (raw) setUserComments(JSON.parse(raw));
        else setUserComments([]);
      } catch {
        setUserComments([]);
      }
    })();
  }, [commentsKey]);

  const likeCount = artwork.likes + (liked ? 1 : 0);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${artwork.title} / ${creator.name} — senseed`,
      });
    } catch {
      Alert.alert("シェア", "共有しました");
    }
  };

  const onSendComment = () => {
    const body = draft.trim();
    if (!body) return;
    const next = [...userComments, { id: `me-${Date.now()}`, handle: "you", body }];
    setUserComments(next);
    AsyncStorage.setItem(commentsKey, JSON.stringify(next)).catch(() => {});
    setDraft("");
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="Today's 100" showBack showProfile={false} showMenu centerTitle />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 作品画像(動画作品はサムネ + 再生ボタン) */}
          <View>
            <Image source={{ uri: artwork.imageUrl }} style={styles.hero} contentFit="cover" transition={300} />
            {artwork.isVideo ? (
              <View style={styles.heroPlay} pointerEvents="none">
                <Play size={28} color={colors.text} fill={colors.text} />
              </View>
            ) : null}
          </View>

          {/* 作者プロフィールカード */}
          <GlassCard style={styles.creatorCard}>
            <View style={styles.creatorRow}>
              <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} contentFit="cover" />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorHandle}>{creator.handle}</Text>
                <Text style={styles.creatorMeta}>
                  {creator.location}・{creator.role}
                </Text>
              </View>
            </View>

            <View style={styles.supportRow}>
              <GradientButton
                label={supporting ? "サポート中" : "サポートする"}
                variant={supporting ? "ring" : "solid"}
                onPress={onToggleSupport}
                style={styles.flex1}
              />
              <Text style={styles.supportCount}>
                {formatCount(creator.supporterCount + (supporting ? 1 : 0))}
              </Text>
            </View>

            <Pressable
              style={styles.msgButton}
              onPress={() => router.push("/messages")}
            >
              <Text style={styles.msgText}>メッセージを送る</Text>
            </Pressable>

            <View style={styles.statsRow}>
              <Stat
                icon={
                  <Heart
                    size={20}
                    color={liked ? colors.pink : colors.textDim}
                    fill={liked ? colors.pink : "transparent"}
                  />
                }
                label={formatCount(likeCount)}
                onPress={() => toggleLike(artwork.id)}
              />
              <Stat
                icon={<MessageCircle size={20} color={colors.textDim} />}
                label={formatCount(comments.length)}
                onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
              />
              <Stat
                icon={<Share2 size={20} color={colors.textDim} />}
                label="シェア"
                onPress={onShare}
              />
            </View>
          </GlassCard>

          {/* 作品情報 */}
          <View>
            <Text style={styles.title}>{artwork.title}</Text>
            <Text style={styles.postedAt}>2025.05.23 18:42 投稿</Text>
            <Text style={styles.desc}>{artwork.description}</Text>
            <View style={styles.tagRow}>
              {artwork.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
          </View>

          {/* 動画を見る(動画作品で videoUrl がある時だけ表示・外部URLを開く) */}
          {userPost?.videoUrl ? (
            <Pressable
              style={styles.videoButton}
              onPress={() =>
                Linking.openURL(userPost.videoUrl!).catch(() =>
                  Alert.alert("エラー", "動画を開けませんでした。"),
                )
              }
            >
              <Play size={18} color={colors.bg} fill={colors.bg} />
              <Text style={styles.videoButtonText}>動画を見る</Text>
            </Pressable>
          ) : null}

          {/* 情報カード */}
          <GlassCard style={styles.infoCard}>
            <Row label="ジャンル" value={artwork.genre} />
            <Row label="テーマ" value={artwork.theme} />
          </GlassCard>

          {/* コメント欄 */}
          <View>
            <Text style={styles.commentHeading}>コメント {comments.length}</Text>
            <View style={styles.commentList}>
              {comments.map((c) => (
                <GlassCard key={c.id} style={styles.commentCard}>
                  <Text style={styles.commentHandle}>{c.handle}</Text>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </GlassCard>
              ))}
            </View>

            {/* コメント入力 */}
            <View style={styles.commentInput}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={onSendComment}
                placeholder="コメントを追加…"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                returnKeyType="send"
              />
              <Pressable onPress={onSendComment} accessibilityLabel="コメントを送信">
                <Send size={20} color={colors.cyan} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

function Stat({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.stat, pressed && styles.statPressed]}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 18 },
  hero: {
    width: "100%",
    height: 360,
    borderRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
  },
  heroPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 64,
    height: 64,
    marginTop: -32,
    marginLeft: -32,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorCard: { padding: 18, gap: 14 },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 2,
  },
  creatorInfo: { flex: 1 },
  creatorName: { color: colors.text, fontSize: 18, fontWeight: "800" },
  creatorHandle: { color: colors.textDim, fontSize: 13 },
  creatorMeta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  supportRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex1: { flex: 1 },
  supportCount: { color: colors.textDim, fontSize: 14 },
  msgButton: {
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingVertical: 11,
    alignItems: "center",
  },
  msgText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  stat: { alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 4 },
  statPressed: { opacity: 0.6 },
  statLabel: { color: colors.textDim, fontSize: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  postedAt: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  desc: { color: colors.textDim, fontSize: 14, lineHeight: 22, marginTop: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    paddingVertical: 14,
  },
  videoButtonText: { color: colors.bg, fontSize: 15, fontWeight: "800" },
  infoCard: { padding: 18, gap: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoRowLabel: { color: colors.textFaint, fontSize: 14 },
  infoRowValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  commentHeading: { color: colors.textDim, fontSize: 14, fontWeight: "700", marginBottom: 12 },
  commentList: { gap: 10 },
  commentCard: { padding: 14 },
  commentHandle: { color: colors.cyan, fontSize: 13, fontWeight: "700" },
  commentBody: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 6 },
});
