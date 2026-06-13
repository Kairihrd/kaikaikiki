import { useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Music, Play } from "lucide-react-native";
import { type Artwork } from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

interface BillboardMosaicProps {
  artworks: Artwork[];
  /** 互換用(現在のレイアウトでは特別な強調はしない) */
  highlightId?: string;
}

type Slot = { art: Artwork; x: number; y: number; w: number; h: number };

// index / theme 画面の左右パディング
const H_PADDING = 16;
// 内部グリッドの列数(card unit = containerWidth / 6)
const COLS = 6;
const GAP = 7;
// 表示枚数(30〜45枚)
const MAX_CARDS = 42;

// カード幅(列数)のパターン。小カード中心に中・大を少し混ぜる。
// (3列 = 大カード。全体で数枚だけになるよう散らす)
const WIDTH_PATTERN = [
  2, 1, 3, 1, 2, 2, 1, 2, 1, 2, 3, 1, 2, 1, 1, 2, 2, 1, 2, 1,
  3, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 3, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2,
];
// 縦横比(高さ = 幅 * aspect)。縦長・正方・横長を混ぜる。
const ASPECT_PATTERN = [
  1.25, 1.0, 1.15, 1.1, 0.9, 1.2, 1.0, 1.3, 1.1, 0.95,
  1.2, 1.0, 1.15, 1.25, 1.0, 0.9, 1.2, 1.1, 1.0, 1.3,
];

// ----------------------------------------------------------------------------
// 縦長モザイクビルボードのレイアウトを計算する。
// CSS grid が無いため、6列のユニットグリッド上で skyline(スカイライン)詰めを行い、
// 大小の角丸カードを横幅いっぱいに隙間なく縦へ積む。横にはみ出さず、重なりも出ない。
// ----------------------------------------------------------------------------
function buildLayout(containerWidth: number, artworks: Artwork[]) {
  if (containerWidth <= 0 || artworks.length === 0) {
    return { slots: [] as Slot[], height: 0 };
  }

  const unit = containerWidth / COLS;
  const colY = new Array<number>(COLS).fill(0); // 各列の現在の高さ(px)
  const count = Math.min(MAX_CARDS, artworks.length);
  const slots: Slot[] = [];

  for (let i = 0; i < count; i++) {
    const wCols = Math.min(WIDTH_PATTERN[i % WIDTH_PATTERN.length], COLS);
    const aspect = ASPECT_PATTERN[i % ASPECT_PATTERN.length];

    // wCols 列ぶんが入る開始列のうち、最も低い(y が小さい)位置を選ぶ。
    let bestC = 0;
    let bestY = Infinity;
    for (let c = 0; c <= COLS - wCols; c++) {
      let maxY = 0;
      for (let k = 0; k < wCols; k++) maxY = Math.max(maxY, colY[c + k]);
      if (maxY < bestY) {
        bestY = maxY;
        bestC = c;
      }
    }

    const w = Math.round(wCols * unit - GAP);
    const h = Math.round(wCols * unit * aspect - GAP);
    const x = Math.round(bestC * unit);
    const y = Math.round(bestY);
    slots.push({ art: artworks[i], x, y, w, h });

    const nextY = y + h + GAP;
    for (let k = 0; k < wCols; k++) colY[bestC + k] = nextY;
  }

  return { slots, height: Math.max(...colY) - GAP };
}

export default function BillboardMosaic({ artworks }: BillboardMosaicProps) {
  const { width } = useWindowDimensions();
  const innerWidth = width - H_PADDING * 2;

  const { slots, height } = useMemo(
    () => buildLayout(innerWidth, artworks),
    [innerWidth, artworks],
  );

  return (
    <View style={[styles.canvas, { height }]}>
      {slots.map((s) => (
        <BillboardCard key={s.art.id} slot={s} />
      ))}
    </View>
  );
}

// 1枚のビルボードカード(角丸四角)。タップで作品詳細へ遷移し、押すと軽くスケールする。
function BillboardCard({ slot }: { slot: Slot }) {
  // 安定した Animated.Value(refのrender中アクセスを避けるため useState で遅延初期化)
  const [scale] = useState(() => new Animated.Value(1));
  const large = slot.w >= 110; // タイトルを出すのは中〜大カードのみ

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

  return (
    <Pressable
      onPress={() => router.push(`/artwork/${slot.art.id}`)}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.slot, { left: slot.x, top: slot.y }]}
    >
      <Animated.View
        style={[
          styles.card,
          { width: slot.w, height: slot.h, transform: [{ scale }] },
        ]}
      >
        <Image
          source={{ uri: slot.art.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        {large ? (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.78)"]}
            style={styles.caption}
          >
            <Text style={styles.capTitle} numberOfLines={1}>
              {slot.art.title}
            </Text>
            <Text style={styles.capName} numberOfLines={1}>
              {slot.art.creatorName}
            </Text>
          </LinearGradient>
        ) : null}
        {slot.art.isVideo ? (
          <View style={styles.badge}>
            <Play size={10} color={colors.text} fill={colors.text} />
          </View>
        ) : slot.art.isAudio ? (
          <View style={styles.badge}>
            <Music size={10} color={colors.cyan} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    position: "relative",
  },
  slot: {
    position: "absolute",
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  capTitle: { color: colors.text, fontSize: 11, fontWeight: "700" },
  capName: { color: colors.textDim, fontSize: 9 },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
