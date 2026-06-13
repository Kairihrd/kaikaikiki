import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import { type Creator } from "@/lib/mockData";
import { formatCount } from "@/lib/format";
import { colors } from "@/lib/theme";

interface CreatorMiniCardProps {
  creator: Creator;
}

// 作者の小さなプロフィール表示(サポーター中ページ等で使用)。
export default function CreatorMiniCard({ creator }: CreatorMiniCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} contentFit="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {creator.name}
        </Text>
        <Text style={styles.handle} numberOfLines={1}>
          {creator.handle}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatCount(creator.supporterCount)} サポーター・{creator.role}
        </Text>
      </View>
      <GradientButton label="応援中" variant="ring" />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  handle: {
    color: colors.textDim,
    fontSize: 12,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
});
