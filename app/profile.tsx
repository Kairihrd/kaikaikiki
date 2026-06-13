import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  Heart,
  MessageCircle,
  Settings,
  Users,
  X,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import {
  FEATURED_ARTWORK,
  FEATURED_CREATOR,
  getTodaysArtworks,
  type Artwork,
} from "@/lib/mockData";
import { genreMeta } from "@/lib/genre";
import { useLanguage } from "@/context/LanguageContext";
import { useProfile } from "@/context/ProfileContext";
import { formatCount } from "@/lib/format";
import { colors, gradient, radius } from "@/lib/theme";

const PROFILE_TAB_KEYS = [
  "profile.tabWorks",
  "profile.tabLikes",
  "profile.tabComments",
  "profile.tabDrafts",
];

// 5. マイページ
export default function ProfileScreen() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const me = FEATURED_CREATOR;
  // 保存済みプロフィールがあれば優先。無ければ i18n / mock の既定値。
  const displayName = profile.name ?? t("profile.name");
  const displayBio = profile.bio ?? t("profile.bio");
  const avatarSource = profile.avatarUri
    ? { uri: profile.avatarUri }
    : { uri: me.avatarUrl };
  const myWorks = getTodaysArtworks().slice(1, 13);
  // 「ビルボードに表示される自信作」は自分で設定する(ローカルstateで差し替え)。
  // 候補は featured + 自分の作品。DB保存はしない。
  const pinCandidates: Artwork[] = [FEATURED_ARTWORK, ...myWorks];
  const [pinned, setPinned] = useState<Artwork>(FEATURED_ARTWORK);
  const [pinPickerOpen, setPinPickerOpen] = useState(false);

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

          {/* ステータスカード(サポーターカードはタップで /supporting へ) */}
          <View style={styles.stats}>
            <Pressable style={styles.statItem} onPress={() => router.push("/supporting")}>
              <StatCard value={formatCount(me.supporterCount)} label={t("profile.supportersStat")} />
            </Pressable>
            <StatCard style={styles.statItem} value="328" label={t("profile.likedWorks")} />
          </View>
          <View style={styles.stats}>
            <StatCard style={styles.statItem} value="56" label={t("profile.commentsStat")} />
            <StatCard style={styles.statItem} value="12" label={t("profile.collections")} />
          </View>

          {/* 固定作品(自分で設定する自信作) */}
          <View>
            <Text style={styles.sectionTitle}>{t("profile.featuredTitle")}</Text>
            <Text style={styles.sectionDesc}>
              {t("profile.featuredDesc")}
            </Text>
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
                <Pressable
                  style={styles.pinButton}
                  onPress={() => setPinPickerOpen(true)}
                >
                  <Text style={styles.pinButtonText}>{t("profile.setFeatured")}</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>

          {/* タブ */}
          <View style={styles.tabs}>
            {PROFILE_TAB_KEYS.map((tabKey, i) => (
              <Pressable
                key={tabKey}
                style={[styles.tab, i === 0 ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>
                  {t(tabKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 自分の作品グリッド(ジャンルバッジ付き) */}
          <View style={styles.grid}>
            {myWorks.map((art) => {
              const meta = genreMeta(art.genre);
              const GenreIcon = meta.Icon;
              return (
                <Pressable
                  key={art.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/artwork/${art.id}`)}
                >
                  <Image source={{ uri: art.imageUrl }} style={styles.gridImage} contentFit="cover" />
                  <View style={styles.gridBadge}>
                    <GenreIcon size={11} color={meta.accent} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* 下部メニュー */}
          <View style={styles.menu}>
            <MenuRow icon={<Users size={20} color={colors.textDim} />} label={t("profile.supporters")} onPress={() => router.push("/supporting")} />
            <MenuRow icon={<Settings size={20} color={colors.textDim} />} label={t("profile.accountSettings")} onPress={() => router.push("/settings")} />
          </View>
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
              {t("profile.featuredDesc")}
            </Text>

            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {pinCandidates.map((art) => {
                const active = art.id === pinned.id;
                return (
                  <Pressable
                    key={art.id}
                    style={[styles.pickRow, active && styles.pickRowActive]}
                    onPress={() => {
                      setPinned(art);
                      setPinPickerOpen(false);
                    }}
                  >
                    <Image source={{ uri: art.imageUrl }} style={styles.pickThumb} contentFit="cover" />
                    <View style={styles.pickInfo}>
                      <Text style={styles.pickTitle} numberOfLines={1}>
                        {art.title}
                      </Text>
                      <Text style={styles.pickMeta} numberOfLines={1}>
                        {art.genre}・♥ {formatCount(art.likes)}
                      </Text>
                    </View>
                    {active ? <Check size={18} color={colors.cyan} /> : null}
                  </Pressable>
                );
              })}
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
  sectionTitle: { color: colors.textDim, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  sectionDesc: { color: colors.textFaint, fontSize: 12, marginBottom: 12 },
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
  menu: { gap: 10 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },

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
