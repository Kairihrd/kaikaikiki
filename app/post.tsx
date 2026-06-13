import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ImagePlus } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import IconButton from "@/components/IconButton";
import { CURRENT_THEME, GENRES } from "@/lib/mockData";
import { colors, radius } from "@/lib/theme";

// 6. 投稿(MVPでは実アップロードなし。フォーム + プレビューのみ)
export default function PostScreen() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [joinBillboard, setJoinBillboard] = useState(true);
  const [allowAi, setAllowAi] = useState(true);

  // MVP: 実際の保存はせず、投稿後はマイページへ遷移する
  const handleSubmit = () => router.push("/profile");

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="戻る" onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.text} />
          </IconButton>
          <Text style={styles.headerTitle}>作品を投稿</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* アップロード枠 */}
          <Pressable style={styles.upload}>
            <View style={styles.uploadIcon}>
              <ImagePlus size={32} color={colors.cyan} />
            </View>
            <Text style={styles.uploadTitle}>作品画像・動画・音楽を追加</Text>
            <Text style={styles.uploadSub}>写真、イラスト、建築、音楽、映像など</Text>
          </Pressable>

          {/* 入力項目 */}
          <GlassCard style={styles.form}>
            <Field label="タイトル">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="作品のタイトル"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
            </Field>

            <Field label="説明文">
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="作品にこめた想いや背景を書いてみましょう"
                placeholderTextColor={colors.textFaint}
                style={[styles.input, styles.textarea]}
              />
            </Field>

            <Field label="ジャンル">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {GENRES.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGenre(g)}
                    style={[styles.chip, genre === g ? styles.chipActive : styles.chipInactive]}
                  >
                    <Text style={[styles.chipText, genre === g && styles.chipTextActive]}>
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Field>

            <Field label="テーマ参加">
              <View style={styles.themeBox}>
                <Text style={styles.themeBoxLabel}>今月のテーマ：</Text>
                <Text style={styles.themeBoxValue}>{CURRENT_THEME}</Text>
              </View>
            </Field>

            <Field label="タグ">
              <TextInput
                placeholder="#写真 #光と影 (スペース区切り)"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
            </Field>
          </GlassCard>

          {/* トグル */}
          <GlassCard style={styles.toggles}>
            <Toggle
              label="今日のビルボード候補に応募する"
              value={joinBillboard}
              onToggle={() => setJoinBillboard((v) => !v)}
            />
            <View style={styles.divider} />
            <Toggle
              label="AIによる作品解析を許可する"
              value={allowAi}
              onToggle={() => setAllowAi((v) => !v)}
            />
          </GlassCard>

          {/* ボタン */}
          <View style={styles.buttons}>
            <Pressable style={styles.previewButton}>
              <Text style={styles.previewText}>プレビュー</Text>
            </Pressable>
            <GradientButton label="投稿する" onPress={handleSubmit} style={styles.flex1} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Toggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={onToggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 18 },
  upload: {
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    borderColor: colors.borderStrong,
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.glassStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  uploadSub: { color: colors.textDim, fontSize: 12 },
  form: { padding: 18, gap: 16 },
  fieldLabel: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  textarea: { height: 90, textAlignVertical: "top" },
  chips: { gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7 },
  chipActive: { backgroundColor: colors.text },
  chipInactive: { backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1 },
  chipText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: colors.bg },
  themeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeBoxLabel: { color: colors.textDim, fontSize: 14 },
  themeBoxValue: { color: colors.cyan, fontSize: 14, fontWeight: "700" },
  toggles: { padding: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  toggleLabel: { color: colors.text, fontSize: 14, flex: 1 },
  track: { width: 44, height: 26, borderRadius: 999, justifyContent: "center", padding: 2 },
  trackOn: { backgroundColor: colors.purple },
  trackOff: { backgroundColor: "rgba(255,255,255,0.15)" },
  knob: { width: 22, height: 22, borderRadius: 999, backgroundColor: colors.text },
  knobOn: { alignSelf: "flex-end" },
  knobOff: { alignSelf: "flex-start" },
  buttons: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  previewButton: {
    flex: 1,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.glass,
    paddingVertical: 13,
    alignItems: "center",
  },
  previewText: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
