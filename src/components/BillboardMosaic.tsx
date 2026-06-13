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
import { colors, gradient, radius } from "@/lib/theme";

interface BillboardMosaicProps {
  artworks: Artwork[];
  /** 中央に大きく置く注目作品ID(既定は先頭) */
  highlightId?: string;
}

type Slot = { art: Artwork; x: number; y: number; size: number; main: boolean };

// 画面に並べる最大カード数(毎日100人のうち中央に集まる枚数)
const MAX_CARDS = 42;
// index / theme 画面の左右パディング(ここに合わせて中央寄せを計算する)
const H_PADDING = 16;

// ----------------------------------------------------------------------------
// 中央集合型(square honeycomb / clustered)レイアウトを計算する。
// React Native には CSS grid が無いため、四角ハニカム状の格子セルを生成し、
// 画面中央に近いセルから順に作品を割り当てて absolute 配置する。
// 中央ほどカードが大きく、外側ほど小さくなり、ビルボードに作品が密集して
// 浮かんでいるように見せる。390〜430px幅でも中央寄せになるよう幅から計算する。
// ----------------------------------------------------------------------------
function buildLayout(width: number, artworks: Artwork[], mainId: string) {
  if (width <= 0 || artworks.length === 0) {
    return { slots: [] as Slot[], height: 0 };
  }

  const cell = width / 4.4; // 1セルの基準サイズ(およそ4〜5列)
  const canvasH = width * 1.04; // ビルボードはほぼ正方形(縦画面内に収める)
  const cols = Math.round(width / cell) + 2;
  const rows = Math.round(canvasH / cell) + 2;

  const cx = width / 2;
  const cy = canvasH / 2;

  // 格子セルを生成。奇数行は半セルずらして「四角ハニカム」にする。
  const offsetX = (width - cols * cell) / 2;
  const cells: { x: number; y: number; d: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cell + (r % 2 ? cell / 2 : 0);
      const y = r * cell;
      const dx = x + cell / 2 - cx;
      const dy = y + cell / 2 - cy;
      cells.push({ x, y, d: Math.hypot(dx, dy) });
    }
  }
  cells.sort((a, b) => a.d - b.d); // 中央に近い順

  // 中央(rank 0)に注目作品を置くため、main を先頭へ並べ替える。
  const ordered = [...artworks];
  const mi = ordered.findIndex((a) => a.id === mainId);
  if (mi > 0) ordered.unshift(ordered.splice(mi, 1)[0]);

  const count = Math.min(MAX_CARDS, ordered.length, cells.length);
  const slots: Slot[] = [];
  for (let i = 0; i < count; i++) {
    const main = i === 0;
    // small / medium / large を混ぜる。中央=large、近傍の一部=medium。
    let factor = 0.92; // small
    if (main) factor = 1.62; // large(中央の注目作品)
    else if (i <= 6 || i % 7 === 3) factor = 1.2; // medium
    else if (i % 11 === 5) factor = 1.42; // たまに大きめ
    const size = Math.round(cell * factor);
    const x = Math.round(cells[i].x + cell / 2 - size / 2);
    const y = Math.round(cells[i].y + cell / 2 - size / 2);
    slots.push({ art: ordered[i], x, y, size, main });
  }

  // 上下の余白を詰めて、クラスタを 0 起点に寄せる。
  const minTop = Math.min(...slots.map((s) => s.y));
  const maxBottom = Math.max(...slots.map((s) => s.y + s.size));
  for (const s of slots) {
    s.y -= minTop;
  }

  // 中央(large)が最前面に来るよう、小さい順に描画する(大きいカードが後 = 上)。
  slots.sort((a, b) => a.size - b.size);

  return { slots, height: maxBottom - minTop };
}

export default function BillboardMosaic({
  artworks,
  highlightId,
}: BillboardMosaicProps) {
  const { width } = useWindowDimensions();
  const innerWidth = width - H_PADDING * 2;
  const mainId = highlightId ?? artworks[0]?.id ?? "";

  const { slots, height } = useMemo(
    () => buildLayout(innerWidth, artworks, mainId),
    [innerWidth, artworks, mainId],
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
  // 安定した Animated.Value を保持する(refのrender中アクセスを避けるため useState で遅延初期化)
  const [scale] = useState(() => new Animated.Value(1));

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.92,
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

  const inner = (
    <Animated.View
      style={[
        styles.card,
        { width: slot.size, height: slot.size, transform: [{ scale }] },
      ]}
    >
      <Image
        source={{ uri: slot.art.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      {slot.main ? (
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.82)"]}
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
          <Play size={11} color={colors.text} fill={colors.text} />
        </View>
      ) : slot.art.isAudio ? (
        <View style={styles.badge}>
          <Music size={11} color={colors.cyan} />
        </View>
      ) : null}
    </Animated.View>
  );

  const card = (
    <Pressable
      onPress={() => router.push(`/artwork/${slot.art.id}`)}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      {inner}
    </Pressable>
  );

  // 中央の注目作品はグラデーション枠で強調する。
  if (slot.main) {
    return (
      <View style={[styles.slot, { left: slot.x - 2, top: slot.y - 2 }]}>
        <LinearGradient
          colors={gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        >
          {card}
        </LinearGradient>
      </View>
    );
  }

  return <View style={[styles.slot, { left: slot.x, top: slot.y }]}>{card}</View>;
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
  ring: {
    borderRadius: radius.md + 3,
    padding: 2,
  },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 7,
  },
  capTitle: { color: colors.text, fontSize: 11, fontWeight: "700" },
  capName: { color: colors.textDim, fontSize: 9 },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
