import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Plus } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { colors, radius } from "@/lib/theme";

// DM(メッセージ)画面。ヘッダーの DM アイコンからの遷移先。
// 入室時に DM 未読を既読化(DMバッジを消す)。MVP プレースホルダー。
export default function MessagesScreen() {
  const { t } = useLanguage();
  const { markDmRead, receiveDm } = useNotifications();

  useEffect(() => {
    markDmRead();
  }, [markDmRead]);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.messages")} showBack />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.iconWrap}>
              <MessageCircle size={34} color={colors.cyan} />
            </View>
            <Text style={styles.title}>{t("header.messages")}</Text>
            <Text style={styles.sub}>{t("messages.subtitle")}</Text>

            {/* 開発用: DMを受信(本番UIでは非表示) */}
            {__DEV__ ? (
              <Pressable style={styles.devBtn} onPress={receiveDm}>
                <Plus size={14} color={colors.textDim} />
                <Text style={styles.devText}>{t("messages.devReceive")}</Text>
              </Pressable>
            ) : null}
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
  content: { paddingHorizontal: 16, paddingBottom: 130 },
  intro: { alignItems: "center", paddingTop: 48 },
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
  sub: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 280,
  },
  devBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  devText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
});
