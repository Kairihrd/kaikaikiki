import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Sparkles, UserPlus } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/theme";

type Notice = {
  id: string;
  icon: React.ReactNode;
  textKey: string;
  timeKey: string;
};

// お知らせ(MVPプレースホルダー)。テキストは翻訳キーで持つ。
const NOTICES: Notice[] = [
  { id: "n1", icon: <UserPlus size={18} color={colors.cyan} />, textKey: "notif.support", timeKey: "time.5min" },
  { id: "n2", icon: <Heart size={18} color={colors.pink} />, textKey: "notif.like", timeKey: "time.1hour" },
  { id: "n3", icon: <MessageCircle size={18} color={colors.cyan} />, textKey: "notif.comment", timeKey: "time.3hours" },
  { id: "n4", icon: <Sparkles size={18} color={colors.cyan} />, textKey: "notif.theme", timeKey: "time.yesterday" },
  { id: "n5", icon: <Heart size={18} color={colors.pink} />, textKey: "notif.billboard", timeKey: "time.2days" },
];

export default function NotificationsScreen() {
  const { t } = useLanguage();
  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.notifications")} showBack showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {NOTICES.map((n) => (
            <GlassCard key={n.id} style={styles.row}>
              <View style={styles.icon}>{n.icon}</View>
              <Text style={styles.text} numberOfLines={2}>
                {t(n.textKey)}
              </Text>
              <Text style={styles.time}>{t(n.timeKey)}</Text>
            </GlassCard>
          ))}
          <Text style={styles.note}>{t("notifications.note")}</Text>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.glassStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  time: { color: colors.textFaint, fontSize: 11 },
  note: { color: colors.textFaint, fontSize: 11, marginTop: 8, marginLeft: 4 },
});
