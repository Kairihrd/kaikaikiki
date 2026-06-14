// Senseed Status 用の小さなオリジナル風アイコン(絵文字を使わない)。
// 表現者=芽(Sprout)、発掘者=観測(Telescope)を、淡い円形バッジで世界観に馴染ませる。
import { type ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import { Sprout, Telescope, type LucideProps } from "lucide-react-native";
import { type StatusKind } from "@/lib/status";
import { colors } from "@/lib/theme";

const META: Record<
  StatusKind,
  { Icon: ComponentType<LucideProps>; tint: string; bg: string; border: string }
> = {
  // 表現者: 種/芽/成長 → グリーン
  expression: {
    Icon: Sprout,
    tint: "#86efac",
    bg: "rgba(74,222,128,0.16)",
    border: "rgba(134,239,172,0.45)",
  },
  // 発掘者: 発見/観測/光を当てる → シアン
  discovery: {
    Icon: Telescope,
    tint: colors.cyan,
    bg: "rgba(34,211,238,0.16)",
    border: "rgba(34,211,238,0.45)",
  },
};

export default function StatusIcon({
  kind,
  size = 22,
}: {
  kind: StatusKind;
  size?: number;
}) {
  const m = META[kind];
  const Icon = m.Icon;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: m.bg,
          borderColor: m.border,
        },
      ]}
    >
      <Icon size={Math.round(size * 0.6)} color={m.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
