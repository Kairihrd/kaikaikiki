// ============================================================================
// Senseed Status(MVP)
// ----------------------------------------------------------------------------
// ユーザーを「クリエイター/サポーター」に固定で分けず、行動で2種類のステータスが伸びる。
//  - 表現ステータス: 投稿するほど伸びる(種→芽→葉→花→森)
//  - 発掘ステータス: 見る/いいね/コメント/サポートで伸びる(観測者→…→キュレーター)
// 画像は assets/status/ の10枚を require で参照する(新規生成なし)。
// ============================================================================
import { type ImageSourcePropType } from "react-native";

export type StatusKind = "expression" | "discovery";

export interface StatusLevel {
  level: number;
  name: string;
  threshold: number; // この段階に到達する最小値
  nextThreshold?: number; // 次段階の閾値(最大段階は undefined)
  image: ImageSourcePropType;
  description: string;
}

export interface SenseedStatus {
  expressionCount: number; // 投稿数
  discoveryCount: number; // 発掘ポイント(閲覧/いいね/コメント/保存/サポートの合算)
  expressionLevel: StatusLevel;
  discoveryLevel: StatusLevel;
}

// カード下部に出す、ステータス種別ごとの一言。
export const STATUS_TAGLINE: Record<StatusKind, string> = {
  expression: "作品を投稿するほど、あなたの表現は育っていきます",
  discovery: "作品を見つけ、支えるほど、発掘の力が育っていきます",
};

// 進捗の単位ラベル(例: 「投稿 3」「サポート 20」)。
export const STATUS_UNIT: Record<StatusKind, string> = {
  expression: "投稿",
  discovery: "サポート",
};

// 表現ステータス(投稿数で段階が上がる)。
export const EXPRESSION_LEVELS: StatusLevel[] = [
  {
    level: 1,
    name: "種",
    threshold: 0,
    nextThreshold: 1,
    image: require("../../assets/status/expression-1-seed.png"),
    description: "小さな種。表現のはじまり。",
  },
  {
    level: 2,
    name: "芽",
    threshold: 1,
    nextThreshold: 5,
    image: require("../../assets/status/expression-2-sprout.png"),
    description: "種から芽が出た。最初の一歩。",
  },
  {
    level: 3,
    name: "葉",
    threshold: 5,
    nextThreshold: 15,
    image: require("../../assets/status/expression-3-leaf.png"),
    description: "茎と葉が育ってきた。",
  },
  {
    level: 4,
    name: "花",
    threshold: 15,
    nextThreshold: 50,
    image: require("../../assets/status/expression-4-flower.png"),
    description: "花が咲いた。表現がひらく。",
  },
  {
    level: 5,
    name: "森",
    threshold: 50,
    image: require("../../assets/status/expression-5-forest.png"),
    description: "森のように広がる表現。",
  },
];

// 発掘ステータス(発掘ポイントで段階が上がる)。
export const DISCOVERY_LEVELS: StatusLevel[] = [
  {
    level: 1,
    name: "観測者",
    threshold: 0,
    nextThreshold: 5,
    image: require("../../assets/status/discovery-1-observer.png"),
    description: "土の中の小さな光に気づいた。",
  },
  {
    level: 2,
    name: "発見者",
    threshold: 5,
    nextThreshold: 25,
    image: require("../../assets/status/discovery-2-discoverer.png"),
    description: "光の粒を虫眼鏡でのぞく。",
  },
  {
    level: 3,
    name: "発掘者",
    threshold: 25,
    nextThreshold: 100,
    image: require("../../assets/status/discovery-3-cultivator.png"),
    description: "見つけた光を育てている。",
  },
  {
    level: 4,
    name: "共鳴者",
    threshold: 100,
    nextThreshold: 300,
    image: require("../../assets/status/discovery-4-resonator.png"),
    description: "一本の木に育ち、共鳴する。",
  },
  {
    level: 5,
    name: "キュレーター",
    threshold: 300,
    image: require("../../assets/status/discovery-5-curator.png"),
    description: "実りを見出し、分かち合う。",
  },
];

// 値から現在の段階を求める(閾値以上で最も高い段階)。
export function levelFor(count: number, levels: StatusLevel[]): StatusLevel {
  let current = levels[0];
  for (const lv of levels) {
    if (count >= lv.threshold) current = lv;
  }
  return current;
}

export interface StatusProgress {
  current: number; // 現在値
  remaining: number; // 次の段階までの残り(最大段階は0)
  ratio: number; // 進捗バー用 0..1
  isMax: boolean;
}

// 現在段階内の進捗を計算する。
export function statusProgress(count: number, level: StatusLevel): StatusProgress {
  if (level.nextThreshold === undefined) {
    return { current: count, remaining: 0, ratio: 1, isMax: true };
  }
  const span = level.nextThreshold - level.threshold;
  const done = Math.max(0, count - level.threshold);
  const ratio = span > 0 ? Math.min(1, done / span) : 1;
  return {
    current: count,
    remaining: Math.max(0, level.nextThreshold - count),
    ratio,
    isMax: false,
  };
}

// MVP: 実データが無いためモック値を返す(後で実カウントに差し替える窓口)。
export function getSenseedStatus(
  expressionCount = 6,
  discoveryCount = 120,
): SenseedStatus {
  return {
    expressionCount,
    discoveryCount,
    expressionLevel: levelFor(expressionCount, EXPRESSION_LEVELS),
    discoveryLevel: levelFor(discoveryCount, DISCOVERY_LEVELS),
  };
}
