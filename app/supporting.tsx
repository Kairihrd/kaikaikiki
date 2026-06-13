import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CreatorMiniCard from "@/components/CreatorMiniCard";
import { getSupportingCreators } from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 7. サポーター中
export default function SupportingScreen() {
  const creators = getSupportingCreators();

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle="サポーター中" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.iconWrap}>
              <Users size={34} color={colors.cyan} />
            </View>
            <Text style={styles.title}>サポーター中</Text>
            <Text style={styles.sub}>
              あなたが応援しているクリエイターがここに表示されます。
            </Text>
          </View>

          <View style={styles.list}>
            {creators.map((c) => (
              <CreatorMiniCard key={c.id} creator={c} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 20 },
  intro: { alignItems: "center", paddingTop: 16 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 8, textAlign: "center", maxWidth: 280 },
  list: { gap: 12 },
});
