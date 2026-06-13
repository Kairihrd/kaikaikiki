import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import Tag from "@/components/Tag";
import {
  getArtworkById,
  getCommentsForArtwork,
  getCreatorByHandle,
} from "@/lib/mockData";
import { formatCount } from "@/lib/format";
import { colors, radius } from "@/lib/theme";

// 4. 作品詳細
export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const artwork = getArtworkById(id ?? "1") ?? getArtworkById("1")!;
  const creator = getCreatorByHandle(artwork.creatorHandle);
  const comments = getCommentsForArtwork(artwork.id);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="Today's 100" showBack showProfile={false} showMenu centerTitle />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 作品画像 */}
          <Image source={{ uri: artwork.imageUrl }} style={styles.hero} contentFit="cover" transition={300} />

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
              <GradientButton label="サポーターになる" style={styles.flex1} />
              <Text style={styles.supportCount}>
                {formatCount(creator.supporterCount)}
              </Text>
            </View>

            <View style={styles.msgButton}>
              <Text style={styles.msgText}>メッセージを送る</Text>
            </View>

            <View style={styles.statsRow}>
              <Stat icon={<Heart size={20} color={colors.textDim} />} label={formatCount(artwork.likes)} />
              <Stat icon={<MessageCircle size={20} color={colors.textDim} />} label={formatCount(artwork.comments)} />
              <Stat icon={<Share2 size={20} color={colors.textDim} />} label="シェア" />
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

          {/* 情報カード */}
          <GlassCard style={styles.infoCard}>
            <Row label="ジャンル" value="写真・デジタルアート" />
            <Row label="テーマ" value={artwork.theme} />
            <Text style={styles.infoLabel}>AIが見出したキーワード</Text>
            <View style={styles.tagRow}>
              {["静けさ", "未来", "孤独", "光", "空間"].map((k) => (
                <Tag key={k} label={k} />
              ))}
            </View>
          </GlassCard>

          {/* AI質問ボタン */}
          <View style={styles.aiButton}>
            <Sparkles size={16} color={colors.cyan} />
            <Text style={styles.aiText}>AIに作品について質問する</Text>
          </View>

          {/* コメント欄 */}
          <View>
            <Text style={styles.commentHeading}>コメント {artwork.comments}</Text>
            <View style={styles.commentList}>
              {comments.map((c) => (
                <GlassCard key={c.id} style={styles.commentCard}>
                  <Text style={styles.commentHandle}>{c.handle}</Text>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </GlassCard>
              ))}
            </View>

            {/* コメント入力(見た目のみ) */}
            <View style={styles.commentInput}>
              <TextInput
                placeholder="コメントを追加…"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
              <Send size={20} color={colors.cyan} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  stat: { alignItems: "center", gap: 4 },
  statLabel: { color: colors.textDim, fontSize: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  postedAt: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  desc: { color: colors.textDim, fontSize: 14, lineHeight: 22, marginTop: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  infoCard: { padding: 18, gap: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoRowLabel: { color: colors.textFaint, fontSize: 14 },
  infoRowValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  infoLabel: { color: colors.textFaint, fontSize: 14, marginTop: 2 },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingVertical: 14,
  },
  aiText: { color: colors.text, fontSize: 14, fontWeight: "700" },
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
