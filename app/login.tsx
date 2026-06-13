import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import GradientButton from "@/components/GradientButton";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { hapticSuccess } from "@/lib/haptics";
import { colors, radius } from "@/lib/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// MVP 簡易ログイン / 新規登録。ローカル仮認証(AuthContext / AsyncStorage)。
export default function LoginScreen() {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async () => {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError(t("auth.errEmail"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.errPassword"));
      return;
    }
    if (isRegister && password !== confirm) {
      setError(t("auth.errMismatch"));
      return;
    }
    setBusy(true);
    const res = isRegister
      ? await signUp(email, password)
      : await signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(t(res.error));
      return;
    }
    hapticSuccess();
    // 成功すると _layout の認証ゲートが自動で / へ遷移する。
  };

  // デモアカウントで即ログイン(入力欄も埋めてから実行)。
  const loginDemo = async () => {
    setMode("login");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
    setBusy(true);
    const res = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    setBusy(false);
    if (res.ok) hapticSuccess();
    else setError(t(res.error));
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <Image
                source={require("../assets/logo-wide.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="senseed"
              />
              <Text style={styles.tagline}>{t("auth.tagline")}</Text>
            </View>

            <Text style={styles.title}>
              {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t("auth.email")}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>{t("auth.password")}</Text>
              <View style={styles.pwRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••"
                  placeholderTextColor={colors.textFaint}
                  style={styles.pwInput}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPw((v) => !v)}
                  style={styles.eye}
                  accessibilityLabel="パスワード表示切替"
                >
                  {showPw ? (
                    <EyeOff size={20} color={colors.textDim} />
                  ) : (
                    <Eye size={20} color={colors.textDim} />
                  )}
                </Pressable>
              </View>

              {isRegister ? (
                <>
                  <Text style={styles.label}>{t("auth.confirmPassword")}</Text>
                  <View style={styles.pwRow}>
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="••••••"
                      placeholderTextColor={colors.textFaint}
                      style={styles.pwInput}
                      secureTextEntry={!showPw}
                      autoCapitalize="none"
                    />
                  </View>
                </>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <GradientButton
                label={busy ? "…" : isRegister ? t("auth.registerCta") : t("auth.loginCta")}
                onPress={submit}
                style={styles.submit}
              />

              <Pressable
                onPress={() => {
                  setMode(isRegister ? "login" : "register");
                  setError(null);
                }}
                style={styles.switch}
              >
                <Text style={styles.switchText}>
                  {isRegister ? t("auth.toLogin") : t("auth.toRegister")}
                </Text>
              </Pressable>

              {/* デモ用アカウント(MVPデモ) */}
              <View style={styles.demoBox}>
                <Text style={styles.demoLabel}>{t("auth.demoAccount")}</Text>
                <Text style={styles.demoCred}>{DEMO_EMAIL}</Text>
                <Text style={styles.demoCred}>{DEMO_PASSWORD}</Text>
                <Pressable
                  style={styles.demoBtn}
                  onPress={loginDemo}
                  disabled={busy}
                >
                  <Text style={styles.demoBtnText}>{t("auth.demoButton")}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, gap: 24 },
  brand: { alignItems: "center", gap: 10 },
  logo: { width: 180, height: 48 },
  tagline: { color: colors.textDim, fontSize: 13 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  form: { gap: 8 },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginTop: 8 },
  input: {
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  pwRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingRight: 12,
  },
  pwInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  eye: { padding: 6 },
  error: { color: colors.pink, fontSize: 13, marginTop: 8 },
  submit: { marginTop: 16 },
  switch: {
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.5)",
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  switchText: { color: colors.cyan, fontSize: 14, fontWeight: "700" },
  demoBox: {
    marginTop: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.glass,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  demoLabel: { color: colors.textDim, fontSize: 12, fontWeight: "700" },
  demoCred: { color: colors.text, fontSize: 14, fontWeight: "600" },
  demoBtn: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.5)",
    backgroundColor: "rgba(34,211,238,0.1)",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  demoBtnText: { color: colors.cyan, fontSize: 14, fontWeight: "700" },
});
