import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Check,
  ChevronRight,
  Globe,
  Lock,
  LogOut,
  UserCog,
  X,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { LANGS, labelForLang } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";

// アカウント設定(MVPプレースホルダー)。各項目はタップで反応する。
// 言語選択はアプリ全体の言語状態(LanguageContext)を更新する。
export default function SettingsScreen() {
  const { lang, setLang, t } = useLanguage();
  const { signOut } = useAuth();
  const [push, setPush] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <AppHeader subtitle={t("header.settings")} showBack showProfile={false} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.section}>{t("settings.account")}</Text>
          <GlassCard style={styles.card}>
            <Row
              icon={<UserCog size={18} color={colors.cyan} />}
              label={t("settings.editProfileTitle")}
              chevron
              onPress={() => router.push("/profile/edit")}
            />
            <Divider />
            <Row
              icon={<Lock size={18} color={colors.cyan} />}
              label={t("settings.privacyTitle")}
              chevron
              onPress={() =>
                Alert.alert(t("settings.privacyTitle"), t("settings.privacyMsg"))
              }
            />
            <Divider />
            <Row
              icon={<Globe size={18} color={colors.cyan} />}
              label={t("settings.language")}
              value={labelForLang(lang)}
              chevron
              onPress={() => setLangOpen(true)}
            />
          </GlassCard>

          <Text style={styles.section}>{t("settings.notifyDisplay")}</Text>
          <GlassCard style={styles.card}>
            <Row
              icon={<Bell size={18} color={colors.cyan} />}
              label={t("settings.push")}
              right={<Switch value={push} onValueChange={setPush} />}
            />
          </GlassCard>

          {/* ログアウト */}
          <GlassCard style={styles.card}>
            <Row
              icon={<LogOut size={18} color={colors.pink} />}
              label={t("auth.logout")}
              onPress={() =>
                Alert.alert(t("auth.logout"), t("auth.logoutConfirm"), [
                  { text: "キャンセル", style: "cancel" },
                  {
                    text: t("auth.logout"),
                    style: "destructive",
                    onPress: () => signOut(),
                  },
                ])
              }
            />
          </GlassCard>

          <Text style={styles.note}>{t("settings.note")}</Text>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />

      {/* 言語選択(下部シート) */}
      <Modal
        visible={langOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setLangOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("settings.langSheetTitle")}</Text>
              <Pressable onPress={() => setLangOpen(false)} accessibilityLabel="閉じる">
                <X size={22} color={colors.textDim} />
              </Pressable>
            </View>
            {LANGS.map((item) => {
              const active = item.code === lang;
              return (
                <Pressable
                  key={item.code}
                  style={[styles.langRow, active && styles.langRowActive]}
                  onPress={() => {
                    setLang(item.code);
                    setLangOpen(false);
                  }}
                >
                  <Text
                    style={[styles.langText, active && styles.langTextActive]}
                  >
                    {item.label}
                  </Text>
                  {active ? <Check size={18} color={colors.cyan} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  chevron,
  right,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  chevron?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right ?? (chevron ? <ChevronRight size={18} color={colors.textFaint} /> : null)}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 10 },
  section: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    marginLeft: 4,
  },
  card: { paddingHorizontal: 14, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowPressed: { opacity: 0.6 },
  rowIcon: { width: 22, alignItems: "center" },
  rowLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
  rowValue: { color: colors.textDim, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border },
  note: { color: colors.textFaint, fontSize: 11, marginTop: 10, marginLeft: 4 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0c0c0f",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  langRowActive: { backgroundColor: colors.glassStrong },
  langText: { color: colors.textDim, fontSize: 15 },
  langTextActive: { color: colors.text, fontWeight: "700" },
});
