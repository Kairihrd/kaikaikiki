import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { getCreatorByHandle, getTodaysArtworks } from "@/lib/mockData";
import { genreMeta } from "@/lib/genre";
import { colors, gradient, radius } from "@/lib/theme";

// 簡易クリエイタープロフィール。タイムライン等の投稿者タップから開く。
// 表示: アイコン / 名前 / @handle / bio / 作品一覧(タップで作品詳細)。
// ※ クリエイター単位のサポートはストアが作品ID単位のため、ここでは出さない
//    (サポートは作品詳細の「サポートする」に集約)。
export default function CreatorScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const decoded = decodeURIComponent(handle ?? "");
  const creator = getCreatorByHandle(decoded);
  // このクリエイターの作品(モックの作品プールからハンドル一致で抽出)。
  const works = getTodaysArtworks().filter(
    (a) => a.creatorHandle === decoded,
  );

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="クリエイター" showBack showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* プロフィール */}
          <View style={styles.header}>
            <LinearGradient colors={gradient.brand} style={styles.avatarRing}>
              <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} contentFit="cover" />
            </LinearGradient>
            <Text style={styles.name}>{creator.name}</Text>
            <Text style={styles.handle}>{creator.handle}</Text>
            {creator.location || creator.role ? (
              <Text style={styles.meta}>
                {[creator.location, creator.role].filter(Boolean).join("・")}
              </Text>
            ) : null}
            {creator.bio ? <Text style={styles.bio}>{creator.bio}</Text> : null}
          </View>

          {/* 作品一覧 */}
          <Text style={styles.sectionTitle}>作品</Text>
          {works.length === 0 ? (
            <Text style={styles.empty}>表示できる作品がありません。</Text>
          ) : (
            <View style={styles.grid}>
              {works.map((a) => {
                const meta = genreMeta(a.genre);
                const GenreIcon = meta.Icon;
                return (
                  <Pressable
                    key={a.id}
                    style={styles.gridItem}
                    onPress={() => router.push(`/artwork/${a.id}`)}
                  >
                    <Image source={{ uri: a.imageUrl }} style={styles.gridImage} contentFit="cover" />
                    <View style={styles.gridBadge}>
                      <GenreIcon size={11} color={meta.accent} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
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
  sectionTitle: { color: colors.textDim, fontSize: 14, fontWeight: "700" },
  empty: { color: colors.textDim, fontSize: 13 },
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
});
