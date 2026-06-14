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
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { hapticSuccess } from "@/lib/haptics";
import { colors, radius } from "@/lib/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

// ログイン / 新規登録(Supabase Auth)。新規登録時に handle / display_name を登録する。
export default function LoginScreen() {
  const { t } = useLanguage();
  const { signIn, signUp, configured } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async () => {
    setError(null);
    if (!configured) {
      setError("Supabase設定が未完了です。.env を設定してください。");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t("auth.errEmail"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.errPassword"));
      return;
    }
    if (isRegister) {
      if (password !== confirm) {
        setError(t("auth.errMismatch"));
        return;
      }
      const h = handle.trim().toLowerCase();
      if (!HANDLE_RE.test(h)) {
        setError("ユーザー名は半角英数字・アンダースコアの3〜20文字で入力してください。");
        return;
      }
      const dn = displayName.trim();
      if (dn.length < 1 || dn.length > 30) {
        setError("表示名は1〜30文字で入力してください。");
        return;
      }
    }
    setBusy(true);
    const res = isRegister
      ? await signUp(email, password, handle, displayName)
      : await signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    hapticSuccess();
    // 成功すると _layout の認証ゲートが自動で / へ遷移する。
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

            {!configured ? (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  Supabase設定が未完了です。{"\n"}
                  EXPO_PUBLIC_SUPABASE_URL / ANON_KEY を .env に設定してください。
                </Text>
              </View>
            ) : null}

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

              {isRegister ? (
                <>
                  <Text style={styles.label}>表示名</Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="あなたの表示名"
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                    maxLength={30}
                  />

                  <Text style={styles.label}>ユーザー名（handle）</Text>
                  <TextInput
                    value={handle}
                    onChangeText={(v) => setHandle(v.toLowerCase())}
                    placeholder="handle"
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <Text style={styles.hint}>
                    @なし・半角英数字とアンダースコア・3〜20文字（小文字）
                  </Text>
                </>
              ) : null}

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
  notice: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.4)",
    backgroundColor: "rgba(236,72,153,0.08)",
    padding: 14,
  },
  noticeText: { color: colors.pink, fontSize: 13, lineHeight: 19, textAlign: "center" },
  form: { gap: 8 },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginTop: 8 },
  hint: { color: colors.textFaint, fontSize: 11, marginTop: 4 },
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
});
