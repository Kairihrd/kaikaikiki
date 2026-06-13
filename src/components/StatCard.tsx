import { type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import GlassCard from "./GlassCard";
import { colors, radius } from "@/lib/theme";

interface StatCardProps {
  value: string;
  label: string;
  sub?: string;
  icon?: ReactNode;
  /** 右端に置く要素(chevron など) */
  right?: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

// 小さな情報カード(100 Creators / テーマ など)。
export default function StatCard({
  value,
  label,
  sub,
  icon,
  right,
  style,
}: StatCardProps) {
  return (
    <GlassCard style={[styles.card, ...(Array.isArray(style) ? style : style ? [style] : [])]}>
      <View style={styles.row}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <View style={styles.textWrap}>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {sub ? (
            <Text style={styles.sub} numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.rightWrap}>{right}</View> : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 11,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.glassStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  value: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  sub: {
    color: colors.cyan,
    fontSize: 10,
    marginTop: 2,
  },
  rightWrap: {
    alignSelf: "center",
  },
});
