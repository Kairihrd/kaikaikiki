import { type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import GlassCard from "./GlassCard";
import { colors, radius } from "@/lib/theme";

interface StatCardProps {
  value: string;
  label: string;
  sub?: string;
  icon?: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

// 小さな情報カード(100 Creators / テーマ など)。
export default function StatCard({
  value,
  label,
  sub,
  icon,
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
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
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
    fontSize: 15,
    fontWeight: "700",
  },
  label: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  sub: {
    color: colors.cyan,
    fontSize: 11,
    marginTop: 3,
  },
});
