import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  LayoutGrid,
  Sparkles,
} from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import IconButton from "@/components/IconButton";
import { CURRENT_THEME, GENRES } from "@/lib/mockData";
import { usePosts } from "@/context/PostsContext";
import { hapticSuccess } from "@/lib/haptics";
import { colors, radius } from "@/lib/theme";

// 6. 投稿。写真選択 + 入力 → タイムラインに反映(PostsContext / AsyncStorage)。
export default function PostScreen() {
  // ビルボード/テーマ画面の投稿ボタンから ?mode= で初期の投稿先が渡ってくる。
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { addPost, hasPostedToTheme } = usePosts();
  // テーマは1人1投稿。既に投稿済みかどうか。
  const themeTaken = hasPostedToTheme(CURRENT_THEME);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  // 投稿先(複数選択可)。mode=theme で来たらテーマを初期ON(未投稿時のみ)。
  const [applyToday, setApplyToday] = useState(mode !== "theme");
  const [applyTheme, setApplyTheme] = useState(mode === "theme" && !themeTaken);
  const [allowAi, setAllowAi] = useState(true);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("写真へのアクセス", "設定から写真へのアクセスを許可してください。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    // テーマは1人1投稿。投稿済みなら絶対にテーマには登録しない(二重ガード)。
    const toTheme = applyTheme && !themeTaken ? CURRENT_THEME : undefined;
    await addPost({
      imageUri: imageUri ?? undefined,
      title: title.trim() || "無題",
      caption: description.trim(),
      genre,
      toTheme,
    });
    hapticSuccess();
    const where = [
      applyToday ? "今日のビルボード候補" : null,
      toTheme ? `テーマ『${CURRENT_THEME}』` : null,
    ]
      .filter(Boolean)
      .join(" と ");
    Alert.alert(
      "投稿しました",
      `${where ? where + "に応募し、" : ""}タイムラインに公開しました。`,
      [{ text: "タイムラインを見る", onPress: () => router.replace("/timeline") }],
    );
  };

  const handlePreview = () =>
    Alert.alert(
      "プレビュー",
      `タイトル: ${title || "（未入力）"}\nジャンル: ${genre}\n説明: ${description || "（未入力）"}`,
    );

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
          {/* アップロード枠(写真選択。選択後はプレビュー表示) */}
          <Pressable style={styles.upload} onPress={pickImage}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.uploadPreview} contentFit="cover" />
                <View style={styles.uploadChange}>
                  <Text style={styles.uploadChangeText}>タップで写真を変更</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <ImagePlus size={32} color={colors.cyan} />
                </View>
                <Text style={styles.uploadTitle}>作品画像を追加</Text>
                <Text style={styles.uploadSub}>タップして写真を選択</Text>
              </>
            )}
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
                value={description}
                onChangeText={setDescription}
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
                value={tags}
                onChangeText={setTags}
                placeholder="#写真 #光と影 (スペース区切り)"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
            </Field>
          </GlassCard>

          {/* 投稿先の選択(複数選択可) */}
          <View>
            <Text style={styles.sectionLabel}>投稿先を選ぶ</Text>
            <View style={styles.targets}>
              <TargetCard
                icon={<LayoutGrid size={20} color={colors.cyan} />}
                title="今日のビルボードに応募する"
                sub="Today's 100 の候補に追加"
                selected={applyToday}
                onPress={() => setApplyToday((v) => !v)}
              />
              <TargetCard
                icon={<Sparkles size={20} color={colors.cyan} />}
                title={`テーマ『${CURRENT_THEME}』に応募する`}
                sub={themeTaken ? "このテーマには投稿済みです(1人1投稿)" : "今月のテーマビルボードに参加"}
                selected={applyTheme}
                disabled={themeTaken}
                onPress={() => setApplyTheme((v) => !v)}
              />
            </View>
          </View>

          {/* トグル */}
          <GlassCard style={styles.toggles}>
            <Toggle
              label="AIによる作品解析を許可する"
              value={allowAi}
              onToggle={() => setAllowAi((v) => !v)}
            />
          </GlassCard>

          {/* ボタン */}
          <View style={styles.buttons}>
            <Pressable style={styles.previewButton} onPress={handlePreview}>
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

function TargetCard({
  icon,
  title,
  sub,
  selected,
  onPress,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.target,
        selected ? styles.targetOn : styles.targetOff,
        disabled && styles.targetDisabled,
      ]}
    >
      <View style={styles.targetIcon}>{icon}</View>
      <View style={styles.targetText}>
        <Text style={styles.targetTitle}>{title}</Text>
        <Text style={styles.targetSub}>{sub}</Text>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxOn]}>
        {selected ? <Check size={14} color={colors.bg} /> : null}
      </View>
    </Pressable>
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
    overflow: "hidden",
  },
  uploadPreview: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  uploadChange: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  uploadChangeText: { color: colors.text, fontSize: 12, fontWeight: "600" },
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
  sectionLabel: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginBottom: 10 },
  targets: { gap: 10 },
  target: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  targetOn: {
    borderColor: "rgba(34,211,238,0.5)",
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  targetOff: {
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  targetDisabled: { opacity: 0.5 },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.glassStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  targetText: { flex: 1 },
  targetTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  targetSub: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
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
