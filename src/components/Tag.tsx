import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/lib/theme";

interface TagProps {
  label: string;
  active?: boolean;
}

// ハッシュタグ / ジャンルチップ。
export default function Tag({ label, active = false }: TagProps) {
  return (
    <View style={[styles.tag, active ? styles.active : styles.inactive]}>
      <Text style={[styles.text, active ? styles.textActive : undefined]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  active: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: colors.borderStrong,
  },
  inactive: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textDim,
  },
  textActive: {
    color: colors.text,
  },
});
