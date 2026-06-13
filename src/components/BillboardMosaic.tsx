import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Play } from "lucide-react-native";
import { type Artwork } from "@/lib/mockData";
import { genreMeta } from "@/lib/genre";
import { hapticBillboardTick } from "@/lib/haptics";
import { colors } from "@/lib/theme";

interface BillboardMosaicProps {
  artworks: Artwork[];
  /** 中央(キャンバス原点)に置く注目作品ID。既定は先頭。 */
  highlightId?: string;
}

// カードの基本サイズ。元(84)の約1.2倍で、少し大きめだが圧迫しない密度に。
const CELL = 96;
const GAP = 9; // カード間の隙間(詰まりすぎない程度)
const STEP = CELL + GAP; // 横方向のセル間隔
const ROW_H = STEP * 0.84; // 縦方向は六角詰めで少し詰める

// 魚眼(中央拡大)のスケール。中央=最大、外側=最小。
// 中央を主役にするため周辺はしっかり小さく(SCALE_MIN を下げる)。
const SCALE_MAX = 1.85;
const SCALE_MIN = 0.7;
// 1軸あたりの係数(scale = fx * fy なので各軸は平方根を使う)。
const MAX_1D = Math.sqrt(SCALE_MAX);
const MIN_1D = Math.sqrt(SCALE_MIN);
// 拡大範囲を狭めて、中央から離れると速やかに小さくする。
const FALLOFF = STEP * 1.3;

type Slot = {
  art: Artwork;
  baseX: number; // キャンバス中心からの相対座標
  baseY: number;
  center: boolean;
};

// ハニカム配置を計算する。作品数 N に合わせて六角グリッドのセルを生成し、
// 中心に近い順に N 個だけ採用する(=中央に密集した六角形ブロック)。
// 件数制限はしない。100件渡されれば100枚すべて配置する。
function buildHoneycomb(artworks: Artwork[], highlightId?: string): Slot[] {
  const n = artworks.length;
  if (n === 0) return [];

  const radius = Math.ceil(Math.sqrt(n)) + 4;
  const cands: { bx: number; by: number; d: number }[] = [];
  for (let row = -radius; row <= radius; row++) {
    const by = row * ROW_H;
    const offset = (row & 1) === 0 ? 0 : STEP / 2; // 奇数行を半セルずらす=ハニカム
    for (let col = -radius; col <= radius; col++) {
      const bx = col * STEP + offset;
      cands.push({ bx, by, d: Math.sqrt(bx * bx + by * by) });
    }
  }
  cands.sort((a, b) => a.d - b.d);
  const chosen = cands.slice(0, n);

  const hero = artworks.find((a) => a.id === highlightId) ?? artworks[0];
  const rest = artworks.filter((a) => a.id !== hero.id);

  const slots: Slot[] = [];
  chosen.forEach((c, idx) => {
    const art = idx === 0 ? hero : rest[idx - 1];
    if (!art) return;
    slots.push({ art, baseX: c.bx, baseY: c.by, center: idx === 0 });
  });
  return slots;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// Apple Watch のホーム画面風: 2Dパン可能なキャンバス上にハニカム配置し、
// 画面中央に近いカードほど拡大する(魚眼)。100枚対応。
// 滑らかさのため:
//  - スケールは Animated.interpolate(fx*fy)で表現し、毎フレームの手動ループを廃止。
//  - 表示範囲付近のカードだけ描画(カリング)。判定は throttle した pan 位置で行う。
export default function BillboardMosaic({
  artworks,
  highlightId,
}: BillboardMosaicProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  // カリング/zIndex 判定用の pan 位置(throttle 更新。毎フレームは更新しない)。
  const [panCenter, setPanCenter] = useState({ x: 0, y: 0 });

  const slots = useMemo(
    () => buildHoneycomb(artworks, highlightId),
    [artworks, highlightId],
  );

  const pan = useMemo(() => new Animated.ValueXY({ x: 0, y: 0 }), []);
  const panValRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const lastTickRef = useRef(0);

  // パン可能範囲(端のカードを中央付近まで持ってこられる程度)。
  const limit = useMemo(() => {
    let mx = 0;
    let my = 0;
    for (const s of slots) {
      mx = Math.max(mx, Math.abs(s.baseX));
      my = Math.max(my, Math.abs(s.baseY));
    }
    return { x: mx + STEP, y: my + STEP };
  }, [slots]);

  // 表示中(近傍)のカードと、中央に最も近いカード(最前面)を計算する。
  const { visible, topId } = useMemo(() => {
    if (size.w === 0) return { visible: [] as Slot[], topId: null as string | null };
    const mx = size.w / 2 + CELL * 1.4; // 画面外側にも少し余分に描画
    const my = size.h / 2 + CELL * 1.4;
    const vis: Slot[] = [];
    let best: Slot | null = null;
    let bestD = Infinity;
    for (const s of slots) {
      const dx = s.baseX + panCenter.x;
      const dy = s.baseY + panCenter.y;
      if (Math.abs(dx) < mx && Math.abs(dy) < my) vis.push(s);
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return { visible: vis, topId: best ? best.art.id : null };
  }, [slots, panCenter, size]);

  // pan の変化を監視: 範囲クランプ + throttle でカリング用 state を更新。
  useEffect(() => {
    const id = pan.addListener(({ x, y }) => {
      panValRef.current = { x, y };
      const cx = clamp(x, -limit.x, limit.x);
      const cy = clamp(y, -limit.y, limit.y);
      if (cx !== x || cy !== y) {
        pan.stopAnimation();
        pan.setValue({ x: cx, y: cy });
        return;
      }
      const now = Date.now();
      if (now - lastTickRef.current > 80) {
        lastTickRef.current = now;
        setPanCenter({ x, y });
      }
    });
    return () => pan.removeListener(id);
  }, [pan, limit]);

  const responder = useMemo(
    () =>
      // panValRef/startRef はハンドラ内でのみ読む(render 中には参照しない)ため安全。
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          pan.stopAnimation();
          startRef.current = { ...panValRef.current };
        },
        onPanResponderMove: (_e, g) => {
          // 指に1:1で追従(クランプのみ)。
          pan.setValue({
            x: clamp(startRef.current.x + g.dx, -limit.x, limit.x),
            y: clamp(startRef.current.y + g.dy, -limit.y, limit.y),
          });
          hapticBillboardTick(); // 「チリチリ」。内部で120msに1回へthrottle。
        },
        onPanResponderRelease: (_e, g) => {
          // 慣性。端ではリスナーがクランプして跳ねない。
          Animated.decay(pan, {
            velocity: { x: g.vx, y: g.vy },
            deceleration: 0.985,
            useNativeDriver: false,
          }).start(() => setPanCenter({ ...panValRef.current }));
        },
      }),
    [limit, pan],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  return (
    <View style={styles.root} onLayout={onLayout} {...responder.panHandlers}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: pan.getTranslateTransform() },
        ]}
      >
        {size.w > 0
          ? visible.map((s) => (
              <CardNode
                key={s.art.id}
                slot={s}
                pan={pan}
                centerX={size.w / 2}
                centerY={size.h / 2}
                top={s.art.id === topId}
              />
            ))
          : null}
      </Animated.View>
    </View>
  );
}

// ハニカムの1カード(角丸スクエア)。スケールは pan からの interpolate(fx*fy)で
// 中央ほど大きく(=Animated 任せで滑らか)。最前面カードは zIndex を上げ作品名を出す。
function CardNode({
  slot,
  pan,
  centerX,
  centerY,
  top,
}: {
  slot: Slot;
  pan: Animated.ValueXY;
  centerX: number;
  centerY: number;
  top: boolean;
}) {
  const art = slot.art;
  const meta = genreMeta(art.genre);
  // ジャンルに関わらず、作品画像があれば必ず画像をメイン面に出す。
  // (アイコンだけのグラデーションカードを作らない。画像欠落時のみ保険でグラデ表示)
  const photo = !!art.imageUrl;
  const Icon = meta.Icon;
  const left = centerX + slot.baseX - CELL / 2;
  const top_ = centerY + slot.baseY - CELL / 2;

  // 各軸の拡大係数。-baseX で「その軸が画面中央」= 最大。
  const fx = pan.x.interpolate({
    inputRange: [-slot.baseX - FALLOFF, -slot.baseX, -slot.baseX + FALLOFF],
    outputRange: [MIN_1D, MAX_1D, MIN_1D],
    extrapolate: "clamp",
  });
  const fy = pan.y.interpolate({
    inputRange: [-slot.baseY - FALLOFF, -slot.baseY, -slot.baseY + FALLOFF],
    outputRange: [MIN_1D, MAX_1D, MIN_1D],
    extrapolate: "clamp",
  });
  const scale = Animated.multiply(fx, fy);

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        {
          left,
          top: top_,
          width: CELL,
          height: CELL,
          transform: [{ scale }],
          zIndex: top ? 999 : 1,
          elevation: top ? 20 : 2,
        },
      ]}
    >
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/artwork/${art.id}`)}
      >
        {photo ? (
          <Image
            source={{ uri: art.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={120}
            cachePolicy="memory-disk"
          />
        ) : (
          <LinearGradient
            colors={meta.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.gradientCard]}
          >
            <Icon size={CELL * 0.3} color={meta.accent} />
          </LinearGradient>
        )}

        {photo && (art.isVideo || meta.visual === "video") ? (
          <View style={styles.playWrap} pointerEvents="none">
            <View style={styles.playCircle}>
              <Play size={13} color={colors.text} fill={colors.text} />
            </View>
          </View>
        ) : null}

        {top ? (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.caption}
          >
            <Text style={styles.capTitle} numberOfLines={1}>
              {art.title}
            </Text>
            <Text style={styles.capGenre} numberOfLines={1}>
              {art.genre}
            </Text>
          </LinearGradient>
        ) : null}

        {/* ジャンルバッジ(右上・全カード共通) */}
        <View style={styles.genreBadge}>
          <Icon size={9} color={meta.accent} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  cardWrap: {
    position: "absolute",
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
  gradientCard: { alignItems: "center", justifyContent: "center" },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 5,
  },
  capTitle: { color: colors.text, fontSize: 11, fontWeight: "800" },
  capGenre: { color: colors.textDim, fontSize: 8.5 },
  playWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  genreBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
