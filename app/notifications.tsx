import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Plus, Sparkles, UserPlus } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  useNotifications,
  type NoticeType,
} from "@/context/NotificationContext";
import { colors } from "@/lib/theme";

// 通知種別 → アイコン。
function iconFor(type: NoticeType) {
  switch (type) {
    case "support":
      return <UserPlus size={18} color={colors.cyan} />;
    case "comment":
      return <MessageCircle size={18} color={colors.cyan} />;
    case "theme":
      return <Sparkles size={18} color={colors.cyan} />;
    default: // like / billboard / likeDynamic
      return <Heart size={18} color={colors.pink} />;
  }
}

// お知らせ。NotificationContext から表示し、入室時に全件既読化(バッジを消す)。
export default function NotificationsScreen() {
  const { t } = useLanguage();
  const { notifications, markAllRead, addLikeNotification } = useNotifications();

  // 画面に入ったら未読を既読にする(ヘッダーの赤丸が消える)。
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.notifications")} showBack showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((n) => (
            <GlassCard key={n.id} style={styles.row}>
              <View style={styles.icon}>{iconFor(n.type)}</View>
              <Text style={styles.text} numberOfLines={2}>
                {t(n.textKey)}
              </Text>
              <Text style={styles.time}>{t(n.timeKey)}</Text>
            </GlassCard>
          ))}

          {/* 開発用: いいね通知を受信する(本番UIでは非表示) */}
          {__DEV__ ? (
            <Pressable style={styles.devBtn} onPress={addLikeNotification}>
              <Plus size={14} color={colors.textDim} />
              <Text style={styles.devText}>{t("notifications.devAddLike")}</Text>
            </Pressable>
          ) : null}

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
  devBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  devText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  note: { color: colors.textFaint, fontSize: 11, marginTop: 8, marginLeft: 4 },
});
