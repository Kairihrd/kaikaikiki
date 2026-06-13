import { useState } from "react";
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Heart,
  MessageCircle,
  MoreVertical,
  Music,
  Search,
  Share2,
  UserPlus,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import BottomNav from "@/components/BottomNav";
import IconButton from "@/components/IconButton";
import Tag from "@/components/Tag";
import {
  FEATURED_ARTWORK,
  getCreatorByHandle,
  getFollowingArtworks,
  getRecommendedArtworks,
} from "@/lib/mockData";
import { formatCount } from "@/lib/format";
import { colors, gradient } from "@/lib/theme";

const TABS = ["おすすめ", "フォロー"] as const;
type Tab = (typeof TABS)[number];

// 3. タイムライン(1作品を大きく見せる縦型ビュー)
// タブで「おすすめ」「フォロー(サポート中クリエイター)」の作品を切り替える。
export default function TimelineScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("おすすめ");
  const [liked, setLiked] = useState(false);

  const list =
    activeTab === "おすすめ" ? getRecommendedArtworks() : getFollowingArtworks();
  const artwork = list[0] ?? FEATURED_ARTWORK;
  const creator = getCreatorByHandle(artwork.creatorHandle);
  const likeCount = artwork.likes + (liked ? 1 : 0);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setLiked(false);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${artwork.title} / ${creator.name} — Billdist`,
      });
    } catch {
      Alert.alert("シェア", "共有しました");
    }
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />

      {/* フルスクリーン作品画像 */}
      <Image
        source={{ uri: artwork.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={["top"]} style={styles.safe}>
        {/* 上部: ロゴ + アクション + タブ */}
        <View style={styles.top}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.push("/")}>
              <Text style={styles.logo}>Billdist</Text>
            </Pressable>
            <View style={styles.topActions}>
              <IconButton accessibilityLabel="検索">
                <Search size={20} color={colors.text} />
              </IconButton>
              <IconButton accessibilityLabel="通知">
                <Bell size={20} color={colors.text} />
              </IconButton>
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

      {/* 右側: 縦並びアクション */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/artwork/${artwork.id}`)}
          style={styles.avatarWrap}
        >
          <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} contentFit="cover" />
          <LinearGradient colors={gradient.brand} style={styles.followBadge}>
            <UserPlus size={12} color={colors.text} />
          </LinearGradient>
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
          onPress={() => setLiked((v) => !v)}
        />
        <ActionButton
          icon={<MessageCircle size={26} color={colors.text} />}
          label={formatCount(artwork.comments)}
          onPress={() => router.push(`/artwork/${artwork.id}`)}
        />
        <ActionButton
          icon={<Share2 size={26} color={colors.text} />}
          label="シェア"
          onPress={onShare}
        />
        <ActionButton
          icon={<MoreVertical size={26} color={colors.text} />}
          onPress={() => router.push(`/artwork/${artwork.id}`)}
        />
      </View>

      {/* 左下: 作品情報 */}
      <View style={styles.info}>
        <Text style={styles.genre}>{artwork.genre}</Text>
        <Text style={styles.title}>{artwork.title}</Text>
        <Text style={styles.creatorLine}>
          {creator.name} <Text style={styles.handle}>{creator.handle}</Text>
        </Text>
        <Text style={styles.desc}>{artwork.description}</Text>
        <View style={styles.tagRow}>
          {artwork.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
        <View style={styles.sound}>
          <Music size={14} color={colors.cyan} />
          <Text style={styles.soundText}>オリジナルサウンド - {creator.name}</Text>
        </View>
      </View>

      <BottomNav />
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
  safe: { flex: 0 },
  top: { paddingHorizontal: 16, paddingTop: 6 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  topActions: { flexDirection: "row", gap: 8 },
  tabs: { flexDirection: "row", gap: 8, paddingVertical: 12 },
  tab: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  tabActive: { backgroundColor: colors.text },
  tabInactive: { backgroundColor: "rgba(255,255,255,0.12)" },
  tabText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: colors.bg },
  badgeWrap: { flexDirection: "row" },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  actions: {
    position: "absolute",
    right: 12,
    bottom: 170,
    alignItems: "center",
    gap: 18,
  },
  avatarWrap: { width: 48, height: 48, marginBottom: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderColor: colors.text,
    borderWidth: 2,
  },
  followBadge: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
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
  info: {
    position: "absolute",
    left: 16,
    bottom: 110,
    maxWidth: "75%",
  },
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
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  soundText: { color: colors.text, fontSize: 12 },
});
