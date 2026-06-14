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
import { ArrowLeft, ImagePlus, Play } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import IconButton from "@/components/IconButton";
import { CURRENT_THEME, GENRES } from "@/lib/mockData";
import { usePosts, type PostTarget } from "@/context/PostsContext";
import { useAuth } from "@/context/AuthContext";
import { insertPost } from "@/lib/posts";
import { hapticSuccess } from "@/lib/haptics";
import { colors, radius } from "@/lib/theme";

// 投稿先(mode)ごとの設定。投稿先を明確に分ける。
//  - timeline : 通常のタイムライン投稿(何枚でも)
//  - billboard: 今日の100 / ビルボード掲載用(1人1枚・差し替え)
//  - theme    : テーマ投稿(1人1投稿・差し替え)
const MODE_CONFIG: Record<
  "timeline" | "billboard" | "theme",
  { target: PostTarget; title: string; note: string; dest: "/" | "/timeline" | "/theme"; cta: string }
> = {
  timeline: {
    target: "timeline",
    title: "タイムラインに投稿",
    note: "タイムラインに公開されます。",
    dest: "/timeline",
    cta: "投稿する",
  },
  billboard: {
    target: "today",
    title: "今日の100に投稿",
    note: `ビルボード掲載用の自信作です（1アカウント1枚・差し替え）。`,
    dest: "/",
    cta: "ビルボードに投稿",
  },
  theme: {
    target: "theme",
    title: "テーマに投稿",
    note: `テーマ『${CURRENT_THEME}』に参加します（1人1投稿・差し替え）。`,
    dest: "/theme",
    cta: "テーマに投稿",
  },
};

// 6. 投稿。写真選択 + 入力 → 投稿先(mode)に応じて反映(PostsContext / AsyncStorage)。
export default function PostScreen() {
  // 各画面の投稿ボタンから ?mode= で投稿先が渡ってくる(既定はタイムライン)。
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const cfg =
    mode === "billboard" || mode === "theme"
      ? MODE_CONFIG[mode]
      : MODE_CONFIG.timeline;
  const { addPost, hasPostedTo } = usePosts();
  const { user } = useAuth();
  const themeName = cfg.target === "theme" ? CURRENT_THEME : undefined;
  const alreadyPosted = hasPostedTo(cfg.target, themeName);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isVideoWork, setIsVideoWork] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

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

  const doSubmit = async () => {
    const finalTitle = title.trim() || "無題";
    const finalCaption = description.trim();
    const finalVideoUrl = isVideoWork ? videoUrl.trim() : undefined;
    // ローカル(マイページ/ビルボード/テーマ反映用)に保存。
    await addPost({
      imageUri: imageUri ?? undefined,
      title: finalTitle,
      caption: finalCaption,
      genre,
      target: cfg.target,
      theme: themeName,
      isVideoWork,
      // 動画作品のときだけ動画URLを保存(説明文とは別フィールド)。
      videoUrl: finalVideoUrl,
    });
    // Supabase posts にも保存(全ユーザーのタイムラインに出る・投稿者=現在のユーザー)。
    let dbError: string | undefined;
    if (user) {
      const res = await insertPost(
        {
          title: finalTitle,
          description: finalCaption,
          category: genre,
          imageUrl: imageUri ?? undefined,
          videoUrl: finalVideoUrl,
        },
        user.id,
      );
      if (!res.ok) dbError = res.error;
    } else {
      dbError = "ログインしていないため、他のユーザーには表示されません。";
      if (__DEV__) console.warn("[post] no auth user → DB insert skipped");
    }
    hapticSuccess();
    if (dbError) {
      // サーバー保存に失敗 → 端末内には保存済みだが、友達のタイムラインには出ない旨を明示。
      Alert.alert(
        "投稿の保存に失敗しました",
        `端末内には保存しましたが、サーバーへの保存に失敗したため他のユーザーには表示されません。\n\n原因: ${dbError}`,
        [{ text: "OK", onPress: () => router.replace(cfg.dest) }],
      );
      return;
    }
    Alert.alert("投稿しました", `${cfg.note}\nマイページにも反映されます。`, [
      { text: "OK", onPress: () => router.replace(cfg.dest) },
    ]);
  };

  const handleSubmit = () => {
    // 動画作品は動画URLが必須(http/https のみ許可)。
    if (isVideoWork) {
      const u = videoUrl.trim();
      if (!u) {
        Alert.alert("動画URLが必要です", "動画作品には動画URLを入力してください。");
        return;
      }
      if (!/^https?:\/\//i.test(u)) {
        Alert.alert(
          "URLが正しくありません",
          "http:// または https:// で始まるURLを入力してください。",
        );
        return;
      }
    }
    // today / theme は1枚のみ。投稿済みなら差し替え確認を出す。
    if (cfg.target !== "timeline" && alreadyPosted) {
      Alert.alert(
        "差し替えますか？",
        cfg.target === "today"
          ? "今日の100に投稿済みの作品を、この作品に差し替えます。"
          : `テーマ『${CURRENT_THEME}』に投稿済みの作品を、この作品に差し替えます。`,
        [
          { text: "キャンセル", style: "cancel" },
          { text: "差し替える", style: "destructive", onPress: doSubmit },
        ],
      );
      return;
    }
    doSubmit();
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="戻る" onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.text} />
          </IconButton>
          <Text style={styles.headerTitle}>{cfg.title}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 投稿先の説明 */}
          <View style={styles.destNote}>
            <Text style={styles.destNoteText}>{cfg.note}</Text>
            {cfg.target !== "timeline" && alreadyPosted ? (
              <Text style={styles.destWarn}>
                すでに投稿済みです。投稿すると差し替えになります。
              </Text>
            ) : null}
          </View>

          {/* アップロード枠(写真/サムネイル選択。選択後はプレビュー表示) */}
          <Pressable style={styles.upload} onPress={pickImage}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.uploadPreview} contentFit="cover" />
                {isVideoWork ? (
                  <View style={styles.playBadge} pointerEvents="none">
                    <Play size={20} color={colors.text} fill={colors.text} />
                  </View>
                ) : null}
                <View style={styles.uploadChange}>
                  <Text style={styles.uploadChangeText}>タップで写真を変更</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <ImagePlus size={32} color={colors.cyan} />
                </View>
                <Text style={styles.uploadTitle}>
                  {isVideoWork ? "サムネイル画像を追加" : "作品画像を追加"}
                </Text>
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
          </GlassCard>

          {/* 動画作品トグル(サムネ + 再生ボタン表示) */}
          <GlassCard style={styles.toggles}>
            <Toggle
              label="動画作品（サムネイル画像 + 再生ボタンで表示）"
              value={isVideoWork}
              onToggle={() => setIsVideoWork((v) => !v)}
            />
          </GlassCard>

          {/* 動画URL(動画作品ONのときだけ表示・必須) */}
          {isVideoWork ? (
            <GlassCard style={styles.form}>
              <Field label="動画URL">
                <TextInput
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="YouTube / Vimeo / SoundCloud などのURL"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Text style={styles.fieldHint}>
                  作品詳細の「動画を見る」ボタンから開きます（http:// または https://）。
                </Text>
              </Field>
            </GlassCard>
          ) : null}

          {/* ボタン */}
          <GradientButton label={cfg.cta} onPress={handleSubmit} />
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
  destNote: {
    borderRadius: radius.lg,
    borderColor: "rgba(34,211,238,0.4)",
    borderWidth: 1,
    backgroundColor: "rgba(34,211,238,0.08)",
    padding: 14,
    gap: 6,
  },
  destNoteText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  destWarn: { color: colors.cyan, fontSize: 12 },
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
  playBadge: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
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
  fieldHint: { color: colors.textFaint, fontSize: 11, marginTop: 6 },
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
  toggles: { padding: 4 },
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
});
