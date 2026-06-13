import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Music, Play } from "lucide-react-native";
import { type Artwork } from "@/lib/mockData";
import { colors, gradient, radius } from "@/lib/theme";

interface ArtworkCardProps {
  artwork: Artwork;
  height: number;
  /** グラデーション枠で強調表示する */
  selected?: boolean;
}

// ビルボード上の1作品カード。タップで作品詳細へ遷移する。
export default function ArtworkCard({
  artwork,
  height,
  selected = false,
}: ArtworkCardProps) {
  const inner = (
    <Pressable
      onPress={() => router.push(`/artwork/${artwork.id}`)}
      style={({ pressed }) => [
        styles.card,
        { height },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: artwork.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* 下部グラデーション + タイトル */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.caption}
      >
        <Text style={styles.title} numberOfLines={1}>
          {artwork.title}
        </Text>
        <Text style={styles.creator} numberOfLines={1}>
          {artwork.creatorName}
        </Text>
      </LinearGradient>

      {/* 動画アイコン(右上) */}
      {artwork.isVideo ? (
        <View style={[styles.badge, styles.badgeRight]}>
          <Play size={14} color={colors.text} fill={colors.text} />
        </View>
      ) : null}

      {/* 音楽アイコン(左上) */}
      {artwork.isAudio ? (
        <View style={[styles.badge, styles.badgeLeft]}>
          <Music size={14} color={colors.cyan} />
        </View>
      ) : null}
    </Pressable>
  );

  if (selected) {
    return (
      <LinearGradient
        colors={gradient.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ring}
      >
        {inner}
      </LinearGradient>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: radius.lg + 2,
    padding: 2,
  },
  card: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.glass,
  },
  pressed: {
    opacity: 0.85,
  },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  creator: {
    color: colors.textDim,
    fontSize: 10,
  },
  badge: {
    position: "absolute",
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRight: {
    right: 8,
  },
  badgeLeft: {
    left: 8,
  },
});
