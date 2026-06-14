import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  LogOut,
  Play,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import StatusIcon from "@/components/StatusIcon";
import { DEFAULT_ARTWORK_IMAGE, FEATURED_CREATOR } from "@/lib/mockData";
import {
  getSenseedStatus,
  statusProgress,
  STATUS_TAGLINE,
  STATUS_UNIT,
  type StatusKind,
  type StatusLevel,
} from "@/lib/status";
import { useLanguage } from "@/context/LanguageContext";
import { usePosts, type UserPost } from "@/context/PostsContext";
import { useProfile } from "@/context/ProfileContext";
import { useSupport } from "@/context/SupportContext";
import { useLikes } from "@/context/LikesContext";
import { useAuth } from "@/context/AuthContext";
import { TARGET_LABEL } from "@/lib/userPost";
import { formatCount } from "@/lib/format";
import { colors, gradient, radius } from "@/lib/theme";

// 5. マイページ
export default function ProfileScreen() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const me = FEATURED_CREATOR;

  const confirmLogout = () =>
    Alert.alert(t("auth.logout"), t("auth.logoutConfirm"), [
      { text: "キャンセル", style: "cancel" },
      { text: t("auth.logout"), style: "destructive", onPress: () => signOut() },
    ]);
  // 保存済みプロフィールがあれば優先。無ければ i18n / mock の既定値。
  const displayName = profile.name ?? t("profile.name");
  const displayBio = profile.bio ?? t("profile.bio");
  const avatarSource = profile.avatarUri
    ? { uri: profile.avatarUri }
    : { uri: me.avatarUrl };
  // マイページには「自分が投稿した作品」だけを表示する。
  const { posts, featuredPost, setFeatured } = usePosts();
  const { supports } = useSupport();
  const { likeCount } = useLikes();
  const [pinPickerOpen, setPinPickerOpen] = useState(false);
  // Senseed Status。表現=投稿数(PostsContext)、発掘=サポート数(SupportContext)の実データ。
  const status = getSenseedStatus(posts.length, supports.length);
  const thumb = (p: UserPost) => ({ uri: p.imageUri ?? DEFAULT_ARTWORK_IMAGE });

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.profile")} showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* プロフィール */}
          <View style={styles.profile}>
            <LinearGradient colors={gradient.brand} style={styles.avatarRing}>
              <Image source={avatarSource} style={styles.avatar} contentFit="cover" />
            </LinearGradient>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{displayName}</Text>
            </View>
            <Text style={styles.handle}>{me.handle}</Text>
            <Text style={styles.bio}>{displayBio}</Text>
            <Text style={styles.meta}>
              {t("profile.age19")}・{t("profile.tokyo")}　{t("profile.photographer")} / {t("profile.student")}
            </Text>
            <Pressable
              style={styles.editButton}
              onPress={() => router.push("/profile/edit")}
            >
              <Text style={styles.editText}>{t("profile.editProfile")}</Text>
            </Pressable>
          </View>

          {/* ステータスカード(実値のみ表示。サポート中=自分の支援数 / いいね=自分のいいね数) */}
          <View style={styles.stats}>
            <Pressable style={styles.statItem} onPress={() => router.push("/supporting")}>
              <StatCard value={formatCount(supports.length)} label="サポート中" />
            </Pressable>
            <StatCard style={styles.statItem} value={formatCount(likeCount)} label="いいね" />
          </View>

          {/* Senseed Status(行動で伸びる2つのステータス) */}
          <View style={styles.statusSection}>
            <Text style={styles.statusHeading}>Senseed Status</Text>
            <StatusCard
              kind="expression"
              level={status.expressionLevel}
              count={status.expressionCount}
            />
            <StatusCard
              kind="discovery"
              level={status.discoveryLevel}
              count={status.discoveryCount}
            />
          </View>

          {/* 自信作(ビルボード掲載作品)。自分の投稿から1つ設定する。 */}
          <View>
            <Text style={styles.sectionTitle}>{t("profile.featuredTitle")}</Text>
            <Text style={styles.sectionDesc}>
              マイページのビルボードに表示する自信作です(1枚・差し替え)。
            </Text>
            {featuredPost ? (
              <GlassCard style={styles.pinned}>
                <Image source={thumb(featuredPost)} style={styles.pinnedImage} contentFit="cover" />
                {featuredPost.isVideoWork ? (
                  <View style={styles.pinnedPlay} pointerEvents="none">
                    <Play size={22} color={colors.text} fill={colors.text} />
                  </View>
                ) : null}
                <View style={styles.pinnedBody}>
                  <View style={styles.targetBadgeInline}>
                    <Text style={styles.targetBadgeText}>
                      {TARGET_LABEL[featuredPost.target]}
                    </Text>
                  </View>
                  <Text style={styles.pinnedTitle}>{featuredPost.title}</Text>
                  {featuredPost.caption ? (
                    <Text style={styles.pinnedDesc}>{featuredPost.caption}</Text>
                  ) : null}
                  <Pressable
                    style={styles.pinButton}
                    onPress={() => setPinPickerOpen(true)}
                  >
                    <Text style={styles.pinButtonText}>{t("profile.setFeatured")}</Text>
                  </Pressable>
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  まだ投稿がありません。作品を投稿すると、ここに自信作を設定できます。
                </Text>
              </GlassCard>
            )}
          </View>

          {/* 自分の投稿作品(投稿先ラベル付き) */}
          <View>
            <Text style={styles.sectionTitle}>投稿した作品</Text>
            {posts.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Plus size={24} color={colors.textDim} />
                <Text style={styles.emptyText}>
                  まだ投稿がありません。ビルボード・テーマ・タイムラインから投稿できます。
                </Text>
              </GlassCard>
            ) : (
              <View style={styles.grid}>
                {posts.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.gridItem}
                    onPress={() => router.push(`/artwork/${p.id}`)}
                  >
                    <Image source={thumb(p)} style={styles.gridImage} contentFit="cover" />
                    <View style={styles.targetBadge}>
                      <Text style={styles.targetBadgeText}>
                        {TARGET_LABEL[p.target]}
                      </Text>
                    </View>
                    {p.isVideoWork ? (
                      <View style={styles.gridPlay} pointerEvents="none">
                        <Play size={14} color={colors.text} fill={colors.text} />
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* 下部メニュー */}
          <View style={styles.menu}>
            <MenuRow icon={<Users size={20} color={colors.textDim} />} label="サポート中の作品" onPress={() => router.push("/supporting")} />
            <MenuRow icon={<Settings size={20} color={colors.textDim} />} label={t("profile.accountSettings")} onPress={() => router.push("/settings")} />
          </View>

          {/* ログアウト(一番下・危険操作っぽい赤系) */}
          <Pressable style={styles.logout} onPress={confirmLogout}>
            <LogOut size={18} color={colors.pink} />
            <Text style={styles.logoutText}>{t("auth.logout")}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />

      {/* 自信作ピッカー(自分の作品から1つ選ぶ簡易モーダル) */}
      <Modal
        visible={pinPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPinPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPinPickerOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("profile.setFeatured")}</Text>
              <Pressable onPress={() => setPinPickerOpen(false)} accessibilityLabel="閉じる">
                <X size={22} color={colors.textDim} />
              </Pressable>
            </View>
            <Text style={styles.sheetSub}>
              自分が投稿した作品から、ビルボードに出す自信作を選びます。
            </Text>

            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {posts.length === 0 ? (
                <Text style={styles.emptyText}>
                  まだ投稿がありません。
                </Text>
              ) : (
                posts.map((p) => {
                  const active = p.id === featuredPost?.id;
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.pickRow, active && styles.pickRowActive]}
                      onPress={() => {
                        setFeatured(p.id);
                        setPinPickerOpen(false);
                      }}
                    >
                      <Image source={thumb(p)} style={styles.pickThumb} contentFit="cover" />
                      <View style={styles.pickInfo}>
                        <Text style={styles.pickTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={styles.pickMeta} numberOfLines={1}>
                          {p.genre}・{TARGET_LABEL[p.target]}
                          {p.isVideoWork ? "・動画" : ""}
                        </Text>
                      </View>
                      {active ? <Check size={18} color={colors.cyan} /> : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

const STATUS_META: Record<StatusKind, { label: string }> = {
  expression: { label: "表現者ステータス" },
  discovery: { label: "発掘者ステータス" },
};

// Senseed Status の1カード(画像 + レベル + 進捗バー + 現在値/次の目標 + 一言)。
function StatusCard({
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
      <Image source={level.image} style={styles.statusImage} contentFit="cover" />
      <View style={styles.statusBody}>
        <View style={styles.statusKindRow}>
          <StatusIcon kind={kind} size={20} />
          <Text style={styles.statusKind}>{meta.label}</Text>
        </View>
        <Text style={styles.statusLevel}>
          Lv.{level.level} {level.name}
        </Text>
        <View style={styles.statusBarTrack}>
          <View
            style={[styles.statusBarFill, { width: `${Math.round(prog.ratio * 100)}%` }]}
          />
        </View>
        <Text style={styles.statusProgressText}>
          {prog.isMax
            ? "最大レベル"
            : `${STATUS_UNIT[kind]} ${prog.current} / 次のレベルまで ${prog.remaining}`}
        </Text>
        <Text style={styles.statusDesc} numberOfLines={2}>
          「{STATUS_TAGLINE[kind]}」
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },

  // Senseed Status
  statusSection: { gap: 10 },
  statusHeading: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 2 },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  statusImage: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#0a0a0a",
    borderColor: "rgba(101,212,110,0.4)",
    borderWidth: 1,
  },
  statusBody: { flex: 1, gap: 5 },
  statusKindRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusKind: { color: colors.text, fontSize: 13, fontWeight: "700" },
  statusLevel: { color: "#86efac", fontSize: 15, fontWeight: "800" },
  statusBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    marginTop: 2,
  },
  statusBarFill: { height: "100%", borderRadius: 999, backgroundColor: "#4ade80" },
  statusProgressText: { color: colors.textDim, fontSize: 12 },
  statusDesc: { color: colors.textFaint, fontSize: 11, lineHeight: 16 },
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
  sectionTitle: { color: colors.textDim, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  sectionDesc: { color: colors.textFaint, fontSize: 12, marginBottom: 12 },
  pinned: { overflow: "hidden" },
  pinnedImage: { width: "100%", height: 200 },
  pinnedBody: { padding: 18 },
  pinnedTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  pinnedDesc: { color: colors.textDim, fontSize: 13, marginTop: 8 },
  pinnedPlay: {
    position: "absolute",
    top: 78,
    alignSelf: "center",
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
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
  emptyCard: { padding: 22, alignItems: "center", gap: 10 },
  emptyText: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  gridImage: { width: "100%", height: "100%" },
  // 投稿先ラベル(タイムライン / 今日の100 / テーマ)
  targetBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  targetBadgeInline: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,211,238,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  targetBadgeText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  gridPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 30,
    height: 30,
    marginTop: -15,
    marginLeft: -15,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: { gap: 10 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.4)",
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  logoutText: { color: colors.pink, fontSize: 14, fontWeight: "700" },

  // 自信作ピッカー(モーダル)
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
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  sheetSub: { color: colors.textDim, fontSize: 12, marginTop: 6, marginBottom: 8 },
  sheetList: { marginTop: 4 },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.md,
  },
  pickRowActive: { backgroundColor: colors.glassStrong },
  pickThumb: { width: 52, height: 52, borderRadius: radius.md },
  pickInfo: { flex: 1 },
  pickTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  pickMeta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
