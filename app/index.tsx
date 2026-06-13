import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  MessageCircle,
  SlidersHorizontal,
  Shuffle,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Music,
  Camera,
  Home,
  Layers,
  Cpu,
  Anchor,
  Film,
  Mic,
  Shirt,
  Star,
  X,
  Heart,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Building2,
  Activity,
  Box,
} from "lucide-react-native";
import { colors } from "@/lib/theme";
import BottomNav from "@/components/BottomNav";

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────
type IconComp = React.ComponentType<{ size: number; color: string }>;

interface CardData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bg: string;
  accent: string;
  Icon: IconComp;
  title: string;
  creator: string;
  genre: string;
  tags: string[];
  badge?: string;
  likes: number;
  zIndex: number;
}

// ─── Fisheye math ─────────────────────────────────────────────────────────────
// Cards closer to the screen centre appear larger; those farther away shrink.
// Distance is measured in screen-space so panning a card to centre zooms it up.
const FISH_MAX = 1.45;   // scale at screen centre
const FISH_MIN = 0.65;   // scale at/beyond falloff radius
const FISH_FALL = 360;   // screen-px at which scale reaches ~FISH_MIN
const FISH_CURVE = 2.0;  // steepness of the exponential falloff

function fisheyeScale(card: CardData, px: number, py: number, gs: number): number {
  // Screen-space offset of this card from the viewport centre
  const dx = px + card.x * gs;
  const dy = py + card.y * gs;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const t = Math.min(dist / FISH_FALL, 1);
  return FISH_MIN + (FISH_MAX - FISH_MIN) * Math.exp(-t * FISH_CURVE);
}

// ─── Card definitions ─────────────────────────────────────────────────────────
const CARDS: CardData[] = [
  {
    id: "featured", x: 0, y: 0, w: 158, h: 196,
    bg: "#070712", accent: "#22d3ee", Icon: Star,
    title: "静寂の入口", creator: "カナタ", genre: "写真",
    tags: ["#写真", "#境界", "#光と影"], badge: "おすすめ", likes: 1834, zIndex: 10,
  },
  {
    id: "2", x: -190, y: -142, w: 128, h: 155,
    bg: "#130820", accent: "#a855f7", Icon: Film,
    title: "夜明けの残響", creator: "ユウキ", genre: "映像",
    tags: ["#映像", "#夜明け"], badge: "NEW", likes: 542, zIndex: 7,
  },
  {
    id: "3", x: -18, y: -188, w: 140, h: 112,
    bg: "#071a0f", accent: "#4ade80", Icon: Building2,
    title: "都市の輪郭", creator: "レン", genre: "建築",
    tags: ["#建築", "#都市"], likes: 891, zIndex: 6,
  },
  {
    id: "4", x: 168, y: -150, w: 122, h: 148,
    bg: "#1a0c00", accent: "#fb923c", Icon: Music,
    title: "重力の手紙", creator: "ソウ", genre: "音楽",
    tags: ["#音楽", "#アンビエント"], badge: "HOT", likes: 723, zIndex: 8,
  },
  {
    id: "5", x: -215, y: 26, w: 118, h: 132,
    bg: "#001515", accent: "#2dd4bf", Icon: Camera,
    title: "群青の窓", creator: "ハル", genre: "写真",
    tags: ["#写真", "#青"], likes: 456, zIndex: 5,
  },
  {
    id: "6", x: 200, y: 16, w: 132, h: 150,
    bg: "#18001a", accent: "#e879f9", Icon: Shirt,
    title: "皮膚と空", creator: "アヤ", genre: "ファッション",
    tags: ["#ファッション", "#空"], badge: "Collab", likes: 1102, zIndex: 7,
  },
  {
    id: "7", x: -178, y: 162, w: 128, h: 138,
    bg: "#08081a", accent: "#818cf8", Icon: Cpu,
    title: "電子の海", creator: "カイ", genre: "デジタルアート",
    tags: ["#デジタル", "#海"], likes: 634, zIndex: 6,
  },
  {
    id: "8", x: 10, y: 186, w: 148, h: 118,
    bg: "#1a0500", accent: "#f87171", Icon: Mic,
    title: "無音のコーラス", creator: "リン", genre: "音楽",
    tags: ["#音楽", "#声"], likes: 287, zIndex: 5,
  },
  {
    id: "9", x: 182, y: 158, w: 122, h: 146,
    bg: "#001a08", accent: "#86efac", Icon: Home,
    title: "折りたたまれた光", creator: "ジン", genre: "建築",
    tags: ["#建築", "#光"], badge: "Rising", likes: 398, zIndex: 6,
  },
  {
    id: "10", x: -346, y: -200, w: 118, h: 128,
    bg: "#10011a", accent: "#c084fc", Icon: Activity,
    title: "境界線上のダンス", creator: "ノア", genre: "パフォーマンス",
    tags: ["#パフォーマンス", "#身体"], likes: 512, zIndex: 4,
  },
  {
    id: "11", x: -82, y: -314, w: 132, h: 115,
    bg: "#001215", accent: "#67e8f9", Icon: Camera,
    title: "朝の温度", creator: "ヒナ", genre: "写真",
    tags: ["#写真", "#朝"], badge: "Trend", likes: 748, zIndex: 4,
  },
  {
    id: "12", x: 122, y: -294, w: 122, h: 138,
    bg: "#150a00", accent: "#fdba74", Icon: Music,
    title: "風の譜面", creator: "コト", genre: "音楽",
    tags: ["#音楽", "#風"], likes: 321, zIndex: 4,
  },
  {
    id: "13", x: 334, y: -134, w: 112, h: 124,
    bg: "#001a10", accent: "#6ee7b7", Icon: Film,
    title: "重なる時間", creator: "イオ", genre: "映像",
    tags: ["#映像", "#時間"], likes: 613, zIndex: 4,
  },
  {
    id: "14", x: 344, y: 92, w: 118, h: 130,
    bg: "#1a0f00", accent: "#fcd34d", Icon: Anchor,
    title: "金属の祈り", creator: "ガク", genre: "彫刻",
    tags: ["#彫刻", "#金属"], badge: "Expert", likes: 445, zIndex: 4,
  },
  {
    id: "15", x: 130, y: 304, w: 132, h: 122,
    bg: "#0f0014", accent: "#d946ef", Icon: Sparkles,
    title: "夢の解像度", creator: "ソラ", genre: "デジタルアート",
    tags: ["#デジタル", "#夢"], likes: 897, zIndex: 4,
  },
  {
    id: "16", x: -78, y: 320, w: 122, h: 118,
    bg: "#001008", accent: "#4ade80", Icon: Building2,
    title: "踊る建築", creator: "ダン", genre: "建築",
    tags: ["#建築", "#曲線"], badge: "Award", likes: 1238, zIndex: 4,
  },
  {
    id: "17", x: -334, y: 78, w: 112, h: 132,
    bg: "#1a0022", accent: "#f0abfc", Icon: Shirt,
    title: "沈黙のドレス", creator: "ルナ", genre: "ファッション",
    tags: ["#ファッション", "#黒"], likes: 567, zIndex: 4,
  },
  {
    id: "18", x: -324, y: 214, w: 128, h: 118,
    bg: "#150a00", accent: "#fb923c", Icon: Box,
    title: "石膏の呼吸", creator: "クウ", genre: "彫刻",
    tags: ["#彫刻", "#石膏"], badge: "Unique", likes: 334, zIndex: 3,
  },
  {
    id: "19", x: 52, y: -444, w: 115, h: 110,
    bg: "#0a001a", accent: "#818cf8", Icon: Layers,
    title: "粒子の庭園", creator: "タイガ", genre: "デジタルアート",
    tags: ["#デジタル", "#粒子"], likes: 289, zIndex: 3,
  },
  {
    id: "20", x: -252, y: 324, w: 112, h: 116,
    bg: "#001a1a", accent: "#22d3ee", Icon: Activity,
    title: "立ち止まる影", creator: "アオイ", genre: "パフォーマンス",
    tags: ["#パフォーマンス", "#影"], likes: 178, zIndex: 3,
  },
];

const BADGE_STYLE: Record<string, { bg: string; fg: string }> = {
  "おすすめ": { bg: "#22d3ee", fg: "#000" },
  "NEW":      { bg: "#4ade80", fg: "#000" },
  "HOT":      { bg: "#f87171", fg: "#000" },
  "Collab":   { bg: "#e879f9", fg: "#000" },
  "Rising":   { bg: "#fb923c", fg: "#000" },
  "Trend":    { bg: "#facc15", fg: "#000" },
  "Expert":   { bg: "#818cf8", fg: "#fff" },
  "Award":    { bg: "#ffd700", fg: "#000" },
  "Unique":   { bg: "#2dd4bf", fg: "#000" },
};

// ─── CardNode ─────────────────────────────────────────────────────────────────
// fisheyeAnim  — updated each pan frame via setValue (JS-driven, no animation)
// pressAnim    — spring-animated on press in/out (native driver, inner view)
function CardNode({
  card,
  fisheyeAnim,
  pressAnim,
  onPress,
}: {
  card: CardData;
  fisheyeAnim: Animated.Value;
  pressAnim: Animated.Value;
  onPress: () => void;
}) {
  const onPressIn = () =>
    Animated.spring(pressAnim, {
      toValue: 0.93, useNativeDriver: true, tension: 120, friction: 8,
    }).start();

  const onPressOut = () =>
    Animated.spring(pressAnim, {
      toValue: 1, useNativeDriver: true, tension: 120, friction: 8,
    }).start();

  const bs = card.badge ? BADGE_STYLE[card.badge] : null;
  const featured = card.id === "featured";

  return (
    // Outer: fisheye scale (JS-driven via setValue — no driver flag needed)
    <Animated.View
      style={[
        s.cardOuter,
        {
          left: card.x - card.w / 2,
          top: card.y - card.h / 2,
          width: card.w,
          height: card.h,
          zIndex: card.zIndex,
          transform: [{ scale: fisheyeAnim }],
          shadowColor: featured ? card.accent : "#000",
          shadowOpacity: featured ? 0.5 : 0.2,
          shadowRadius: featured ? 22 : 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: featured ? 14 : 3,
        },
      ]}
    >
      {/* Inner: press scale (useNativeDriver:true, separate view) */}
      <Animated.View
        style={[
          s.cardInner,
          {
            backgroundColor: card.bg,
            borderColor: card.accent + "44",
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <Pressable
          style={s.cardPressable}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {/* Accent top strip */}
          <View style={[s.accentStrip, { backgroundColor: card.accent }]} />

          {/* Badge */}
          {bs && card.badge ? (
            <View style={[s.badgePill, { backgroundColor: bs.bg }]}>
              <Text style={[s.badgeTxt, { color: bs.fg }]}>{card.badge}</Text>
            </View>
          ) : null}

          {/* Icon */}
          <card.Icon size={featured ? 34 : 24} color={card.accent} />

          <View style={{ flex: 1 }} />

          <Text style={s.cardTitle} numberOfLines={2}>{card.title}</Text>
          <Text style={s.cardCreator}>{card.creator}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [selected, setSelected] = useState<CardData | null>(null);
  const [mode, setMode] = useState<"limited" | "unlimited">("limited");

  // ── Pan state ──────────────────────────────────────────────────────────────
  // We avoid extractOffset so listeners always receive the true total pan value,
  // which is required for the per-frame fisheye distance calculation.
  const panAnim  = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panRef   = useRef({ x: 0, y: 0 }); // ground-truth total pan
  const startRef = useRef({ x: 0, y: 0 }); // pan at the start of each drag

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleRef  = useRef(1);
  const currentScale = useRef(1); // kept in sync for zoom buttons

  // ── Per-card animated values ───────────────────────────────────────────────
  const fisheyeAnims = useRef(
    Object.fromEntries(
      CARDS.map(card => [
        card.id,
        new Animated.Value(fisheyeScale(card, 0, 0, 1)),
      ])
    )
  ).current;

  const pressAnims = useRef(
    Object.fromEntries(CARDS.map(card => [card.id, new Animated.Value(1)]))
  ).current;

  // ── Fisheye listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const px = panRef.current.x;
      const py = panRef.current.y;
      const gs = scaleRef.current;
      for (const card of CARDS) {
        fisheyeAnims[card.id].setValue(fisheyeScale(card, px, py, gs));
      }
    };

    const subX = panAnim.x.addListener(({ value }) => {
      panRef.current.x = value;
      update();
    });
    const subY = panAnim.y.addListener(({ value }) => {
      panRef.current.y = value;
      update();
    });
    const subS = scaleAnim.addListener(({ value }) => {
      scaleRef.current = value;
      update();
    });

    return () => {
      panAnim.x.removeListener(subX);
      panAnim.y.removeListener(subY);
      scaleAnim.removeListener(subS);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── PanResponder ───────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
      onPanResponderGrant: () => {
        // Stop any in-flight decay so setValue starts fresh
        panAnim.x.stopAnimation();
        panAnim.y.stopAnimation();
        startRef.current = { ...panRef.current };
      },
      onPanResponderMove: (_, gs) => {
        // setValue fires the listeners above → panRef updated → fisheye updated
        panAnim.x.setValue(startRef.current.x + gs.dx);
        panAnim.y.setValue(startRef.current.y + gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        Animated.decay(panAnim, {
          velocity: { x: gs.vx, y: gs.vy },
          deceleration: 0.991,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // ── Camera controls ────────────────────────────────────────────────────────
  const centerView = useCallback(() => {
    Animated.parallel([
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false, tension: 55, friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false, tension: 55, friction: 10,
      }),
    ]).start(() => { currentScale.current = 1; });
  }, [panAnim, scaleAnim]);

  const zoomIn = useCallback(() => {
    const next = Math.min(currentScale.current * 1.35, 2.2);
    Animated.spring(scaleAnim, {
      toValue: next, useNativeDriver: false, tension: 60, friction: 10,
    }).start();
    currentScale.current = next;
  }, [scaleAnim]);

  const zoomOut = useCallback(() => {
    const next = Math.max(currentScale.current * 0.74, 0.28);
    Animated.spring(scaleAnim, {
      toValue: next, useNativeDriver: false, tension: 60, friction: 10,
    }).start();
    currentScale.current = next;
  }, [scaleAnim]);

  const shuffle = useCallback(() => {
    const s = currentScale.current;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: s * 0.88, duration: 110, useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: s, tension: 80, friction: 7, useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim]);

  // ── Detail panel ───────────────────────────────────────────────────────────
  const detailY       = useRef(new Animated.Value(SH)).current;
  const detailOpacity = useRef(new Animated.Value(0)).current;

  const openCard = useCallback((card: CardData) => {
    setSelected(card);
    Animated.parallel([
      Animated.spring(detailY, {
        toValue: 0, tension: 62, friction: 12, useNativeDriver: true,
      }),
      Animated.timing(detailOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }),
    ]).start();
  }, [detailY, detailOpacity]);

  const closeCard = useCallback(() => {
    Animated.parallel([
      Animated.spring(detailY, {
        toValue: SH, tension: 62, friction: 12, useNativeDriver: true,
      }),
      Animated.timing(detailOpacity, {
        toValue: 0, duration: 180, useNativeDriver: true,
      }),
    ]).start(() => setSelected(null));
  }, [detailY, detailOpacity]);

  return (
    <View style={s.root}>

      {/* ── Spatial Canvas ──────────────────────────────────────── */}
      <View style={s.canvas} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            s.canvasOrigin,
            {
              transform: [
                { translateX: panAnim.x },
                { translateY: panAnim.y },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {CARDS.map((card) => (
            <CardNode
              key={card.id}
              card={card}
              fisheyeAnim={fisheyeAnims[card.id]}
              pressAnim={pressAnims[card.id]}
              onPress={() => openCard(card)}
            />
          ))}
        </Animated.View>
      </View>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={s.topSafe} pointerEvents="box-none">
        <View style={s.topBar}>
          <View style={s.titleRow}>
            <Text style={s.angleChar}>&lt;</Text>
            <Text style={s.titleText}>ビルボード</Text>
            <Text style={s.angleChar}>&gt;</Text>
          </View>

          <View style={s.modeRow}>
            <TouchableOpacity
              style={[s.modeBtn, mode === "limited" && s.modeBtnOn]}
              onPress={() => setMode("limited")}
            >
              <Text style={[s.modeTxt, mode === "limited" && s.modeTxtOn]}>
                limited
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeBtn, mode === "unlimited" && s.modeBtnOn]}
              onPress={() => setMode("unlimited")}
            >
              <Text style={[s.modeTxt, mode === "unlimited" && s.modeTxtOn]}>
                Unlimited
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.rightRow}>
            <TouchableOpacity style={s.filterPill}>
              <SlidersHorizontal size={11} color="rgba(255,255,255,0.45)" />
              <Text style={s.filterTxt}>なし</Text>
              <ChevronDown size={10} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            <View style={s.iconWrap}>
              <Bell size={18} color="rgba(255,255,255,0.75)" />
              <View style={s.notifBadge}>
                <Text style={s.notifTxt}>3</Text>
              </View>
            </View>
            <MessageCircle size={18} color="rgba(255,255,255,0.75)" />
          </View>
        </View>
      </SafeAreaView>

      {/* ── Canvas hint ─────────────────────────────────────────── */}
      <View style={s.hintRow} pointerEvents="none">
        <Text style={s.hintTxt}>ドラッグで探索</Text>
      </View>

      {/* ── Controls ────────────────────────────────────────────── */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={zoomIn}>
          <ZoomIn size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={zoomOut}>
          <ZoomOut size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={centerView}>
          <Crosshair size={17} color={colors.cyan} />
        </TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={shuffle}>
          <Shuffle size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* ── Detail Panel ────────────────────────────────────────── */}
      {selected && (
        <Animated.View style={[s.overlay, { opacity: detailOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closeCard}
            activeOpacity={1}
          />
          <Animated.View
            style={[s.sheet, { transform: [{ translateY: detailY }] }]}
          >
            <View style={s.handle} />

            <TouchableOpacity style={s.closeBtn} onPress={closeCard}>
              <X size={15} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>

            <View
              style={[
                s.sheetHeader,
                {
                  backgroundColor: selected.bg,
                  borderColor: selected.accent + "30",
                },
              ]}
            >
              <View
                style={[
                  s.sheetIconBox,
                  { backgroundColor: selected.accent + "18" },
                ]}
              >
                <selected.Icon size={32} color={selected.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>{selected.title}</Text>
                <Text style={s.sheetCreator}>{selected.creator}</Text>
                <Text style={[s.sheetGenre, { color: selected.accent }]}>
                  {selected.genre}
                </Text>
              </View>
            </View>

            <View style={s.tagRow}>
              {selected.tags.map((tag) => (
                <View
                  key={tag}
                  style={[s.tagPill, { borderColor: selected.accent + "40" }]}
                >
                  <Text style={[s.tagTxt, { color: selected.accent }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Heart size={13} color={colors.pink} />
                <Text style={s.statTxt}>{selected.likes.toLocaleString()}</Text>
              </View>
              <View style={s.statItem}>
                <MessageSquare size={13} color="rgba(255,255,255,0.4)" />
                <Text style={s.statTxt}>32</Text>
              </View>
            </View>

            <View style={s.actionsRow}>
              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  {
                    backgroundColor: selected.accent + "1a",
                    borderColor: selected.accent + "55",
                  },
                ]}
              >
                <Text style={[s.primaryBtnTxt, { color: selected.accent }]}>
                  作品を見る
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.secondaryBtn}>
                <Text style={s.secondaryBtnTxt}>サポートする</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      <BottomNav />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // Canvas
  canvas: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  canvasOrigin: {
    position: "absolute",
    left: SW / 2,
    top: SH / 2,
    width: 0,
    height: 0,
  },

  // Cards — outer holds position + fisheye scale; inner holds border + press scale
  cardOuter: { position: "absolute" },
  cardInner: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardPressable: { flex: 1, padding: 13 },
  accentStrip: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 2,
    opacity: 0.9,
  },
  badgePill: {
    position: "absolute",
    top: 9, right: 9,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeTxt: { fontSize: 8, fontWeight: "800", letterSpacing: 0.2 },
  cardTitle: { color: "#fff", fontSize: 11, fontWeight: "700", lineHeight: 15 },
  cardCreator: { color: "rgba(255,255,255,0.38)", fontSize: 9, marginTop: 2 },

  // Top bar
  topSafe: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "rgba(0,0,0,0.80)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  angleChar: { color: colors.cyan, fontSize: 15, fontWeight: "700" },
  titleText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: -0.4 },
  modeRow: { flexDirection: "row", gap: 4 },
  modeBtn: {
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 7, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modeBtnOn: { borderColor: colors.cyan, backgroundColor: colors.cyan + "18" },
  modeTxt: { color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: "600" },
  modeTxtOn: { color: colors.cyan },
  rightRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  filterPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 7, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  filterTxt: { color: "rgba(255,255,255,0.45)", fontSize: 11 },
  iconWrap: { position: "relative" },
  notifBadge: {
    position: "absolute", top: -5, right: -6,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#ef4444",
    alignItems: "center", justifyContent: "center",
  },
  notifTxt: { color: "#fff", fontSize: 8, fontWeight: "800" },

  // Hint
  hintRow: {
    position: "absolute", bottom: 108, left: 0, right: 0,
    alignItems: "center", zIndex: 10,
  },
  hintTxt: { color: "rgba(255,255,255,0.16)", fontSize: 11, letterSpacing: 0.3 },

  // Controls
  controls: {
    position: "absolute", right: 16, bottom: 120,
    gap: 10, zIndex: 50,
  },
  ctrlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.11)",
    alignItems: "center", justifyContent: "center",
  },

  // Detail overlay
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 200,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#0c0c0e",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingBottom: 44,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "center", marginTop: 12, marginBottom: 18,
  },
  closeBtn: {
    position: "absolute", top: 14, right: 16,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center", justifyContent: "center",
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", gap: 16,
    marginHorizontal: 20, padding: 16,
    borderRadius: 16, borderWidth: 1,
  },
  sheetIconBox: {
    width: 60, height: 60, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  sheetTitle: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  sheetCreator: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  sheetGenre: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  tagRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    paddingHorizontal: 20, marginTop: 14,
  },
  tagPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  tagTxt: { fontSize: 11, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 20, paddingHorizontal: 20, marginTop: 14 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statTxt: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 18 },
  primaryBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1, alignItems: "center",
  },
  primaryBtnTxt: { fontSize: 14, fontWeight: "700" },
  secondaryBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center",
  },
  secondaryBtnTxt: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "700" },
});
