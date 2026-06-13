import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeartHandshake, X } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { useSupport } from "@/context/SupportContext";
import { DEFAULT_ARTWORK_IMAGE } from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 「サポート中」= 自分がサポート(応援)した作品の一覧。
// (「自分をサポートしてくれた人」とは別概念。ここは自分の支援対象を表示する)
export default function SupportingScreen() {
  const { supports, removeSupport } = useSupport();

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="サポート中" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.iconWrap}>
              <HeartHandshake size={32} color={colors.cyan} />
            </View>
            <Text style={styles.title}>サポート中の作品</Text>
            <Text style={styles.sub}>
              あなたがサポート（応援）した作品の一覧です。
            </Text>
          </View>

          {supports.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                まだサポートした作品はありません。{"\n"}
                作品詳細の「サポートする」から応援できます。
              </Text>
            </GlassCard>
          ) : (
            <View style={styles.list}>
              {supports.map((s) => (
                <GlassCard key={s.id} style={styles.row}>
                  <Pressable
                    style={styles.rowMain}
                    onPress={() => router.push(`/artwork/${s.id}`)}
                  >
                    <Image
                      source={{ uri: s.imageUrl ?? DEFAULT_ARTWORK_IMAGE }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                    <View style={styles.info}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {s.artworkTitle ?? "作品"}
                      </Text>
                      <Text style={styles.itemArtist} numberOfLines={1}>
                        {s.artistName ?? "クリエイター"}
                        {s.artistHandle ? `　${s.artistHandle}` : ""}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeSupport(s.id)}
                    accessibilityLabel="サポートを解除"
                    hitSlop={8}
                  >
                    <X size={18} color={colors.textDim} />
                  </Pressable>
                </GlassCard>
              ))}
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
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 20 },
  intro: { alignItems: "center", paddingTop: 16 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 8, textAlign: "center", maxWidth: 280 },
  emptyCard: { padding: 22, alignItems: "center" },
  emptyText: { color: colors.textDim, fontSize: 13, textAlign: "center", lineHeight: 20 },
  list: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", padding: 10, gap: 12 },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: radius.md },
  info: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  itemArtist: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
});
