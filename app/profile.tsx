import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BadgeCheck,
  Bell,
  Heart,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import Tag from "@/components/Tag";
import {
  FEATURED_ARTWORK,
  FEATURED_CREATOR,
  getTodaysArtworks,
} from "@/lib/mockData";
import { formatCount } from "@/lib/format";
import { colors, gradient, radius } from "@/lib/theme";

const PROFILE_TABS = ["作品", "いいね", "コメント", "下書き"];

// 5. マイページ
export default function ProfileScreen() {
  const me = FEATURED_CREATOR;
  const pinned = FEATURED_ARTWORK;
  const myWorks = getTodaysArtworks().slice(1, 13);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="マイページ" showProfile={false} showMenu />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* プロフィール */}
          <View style={styles.profile}>
            <LinearGradient colors={gradient.brand} style={styles.avatarRing}>
              <Image source={{ uri: me.avatarUrl }} style={styles.avatar} contentFit="cover" />
            </LinearGradient>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{me.name}</Text>
              <BadgeCheck size={20} color={colors.cyan} />
            </View>
            <Text style={styles.handle}>{me.handle}</Text>
            <Text style={styles.bio}>光の先にあるものを、想像してみる。</Text>
            <Text style={styles.meta}>19歳・東京　写真家 / 大学生</Text>
            <View style={styles.tagRow}>
              {["#写真", "#建築", "#モノクロ", "#光と影"].map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
            <Pressable style={styles.editButton}>
              <Text style={styles.editText}>プロフィールを編集</Text>
            </Pressable>
          </View>

          {/* ステータスカード */}
          <View style={styles.stats}>
            <StatCard style={styles.statItem} value={formatCount(me.supporterCount)} label="サポーター" />
            <StatCard style={styles.statItem} value="328" label="いいねした作品" />
          </View>
          <View style={styles.stats}>
            <StatCard style={styles.statItem} value="56" label="コメントした数" />
            <StatCard style={styles.statItem} value="12" label="コレクション" />
          </View>

          {/* 固定作品 */}
          <View>
            <Text style={styles.sectionTitle}>ビルボードに表示される自信作</Text>
            <GlassCard style={styles.pinned}>
              <Image source={{ uri: pinned.imageUrl }} style={styles.pinnedImage} contentFit="cover" />
              <View style={styles.pinnedBody}>
                <Text style={styles.pinnedTitle}>{pinned.title}</Text>
                <Text style={styles.pinnedDesc}>{pinned.description}</Text>
                <View style={styles.pinnedStats}>
                  <View style={styles.pinnedStat}>
                    <Heart size={16} color={colors.textDim} />
                    <Text style={styles.pinnedStatText}>{formatCount(pinned.likes)}</Text>
                  </View>
                  <View style={styles.pinnedStat}>
                    <MessageCircle size={16} color={colors.textDim} />
                    <Text style={styles.pinnedStatText}>{pinned.comments}</Text>
                  </View>
                </View>
                <Pressable style={styles.pinButton}>
                  <Text style={styles.pinButtonText}>ピンを変更する</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>

          {/* タブ */}
          <View style={styles.tabs}>
            {PROFILE_TABS.map((tab, i) => (
              <Pressable
                key={tab}
                style={[styles.tab, i === 0 ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 自分の作品グリッド */}
          <View style={styles.grid}>
            {myWorks.map((art) => (
              <Pressable
                key={art.id}
                style={styles.gridItem}
                onPress={() => router.push(`/artwork/${art.id}`)}
              >
                <Image source={{ uri: art.imageUrl }} style={styles.gridImage} contentFit="cover" />
              </Pressable>
            ))}
          </View>

          {/* 下部メニュー */}
          <View style={styles.menu}>
            <MenuRow icon={<Users size={20} color={colors.textDim} />} label="サポーターになってくれた人" onPress={() => router.push("/supporting")} />
            <MenuRow icon={<MessageCircle size={20} color={colors.textDim} />} label="メッセージ" />
            <MenuRow icon={<Settings size={20} color={colors.textDim} />} label="アカウント設定" />
            <MenuRow icon={<Bell size={20} color={colors.textDim} />} label="お知らせ" />
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.menuRow}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 18 },
  profile: { alignItems: "center", paddingTop: 6 },
  avatarRing: { borderRadius: 999, padding: 3 },
  avatar: { width: 92, height: 92, borderRadius: 999 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  name: { color: colors.text, fontSize: 24, fontWeight: "800" },
  handle: { color: colors.textDim, fontSize: 14 },
  bio: { color: colors.text, fontSize: 14, marginTop: 8, textAlign: "center" },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12, justifyContent: "center" },
  editButton: {
    marginTop: 16,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.glassStrong,
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  editText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 12 },
  statItem: { flex: 1 },
  sectionTitle: { color: colors.textDim, fontSize: 14, fontWeight: "700", marginBottom: 12 },
  pinned: { overflow: "hidden" },
  pinnedImage: { width: "100%", height: 200 },
  pinnedBody: { padding: 18 },
  pinnedTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  pinnedDesc: { color: colors.textDim, fontSize: 13, marginTop: 8 },
  pinnedStats: { flexDirection: "row", gap: 16, marginTop: 14 },
  pinnedStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  pinnedStatText: { color: colors.textDim, fontSize: 14 },
  pinButton: {
    marginTop: 14,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingVertical: 10,
    alignItems: "center",
  },
  pinButtonText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7 },
  tabActive: { backgroundColor: colors.text },
  tabInactive: { backgroundColor: colors.glass },
  tabText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: colors.bg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  gridImage: { width: "100%", height: "100%" },
  menu: { gap: 10 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
