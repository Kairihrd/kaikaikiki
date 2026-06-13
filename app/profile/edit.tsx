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
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera } from "lucide-react-native";
import ScreenGlow from "@/components/ScreenGlow";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import IconButton from "@/components/IconButton";
import { FEATURED_CREATOR } from "@/lib/mockData";
import { useProfile } from "@/context/ProfileContext";
import { useLanguage } from "@/context/LanguageContext";
import { hapticSuccess } from "@/lib/haptics";
import { colors, radius } from "@/lib/theme";

// プロフィール編集。アイコン画像(正方クロップ)・名前・自己紹介を編集して保存する。
// 保存は ProfileContext 経由で AsyncStorage に永続化される。
export default function ProfileEditScreen() {
  const { t } = useLanguage();
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name ?? t("profile.name"));
  const [bio, setBio] = useState(profile.bio ?? t("profile.bio"));
  // 新たに選んだ画像。null の間は既存(保存済み or mock)を表示する。
  const [pickedUri, setPickedUri] = useState<string | null>(null);

  const avatarSource = pickedUri
    ? { uri: pickedUri }
    : profile.avatarUri
      ? { uri: profile.avatarUri }
      : { uri: FEATURED_CREATOR.avatarUrl };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("写真へのアクセス", "設定から写真へのアクセスを許可してください。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true, // 正方形クロップUI
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    await updateProfile({
      name: name.trim() ? name.trim() : null,
      bio: bio.trim() ? bio.trim() : null,
      avatarUri: pickedUri ?? profile.avatarUri,
    });
    hapticSuccess();
    router.back();
  };

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="戻る" onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.text} />
          </IconButton>
          <Text style={styles.headerTitle}>{t("profile.editProfile")}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* アイコン */}
          <View style={styles.avatarSection}>
            <Pressable onPress={pickImage} style={styles.avatarWrap}>
              <Image source={avatarSource} style={styles.avatar} contentFit="cover" />
              <View style={styles.avatarBadge}>
                <Camera size={16} color={colors.text} />
              </View>
            </Pressable>
            <Pressable onPress={pickImage}>
              <Text style={styles.changePhoto}>写真を変更</Text>
            </Pressable>
          </View>

          {/* 入力 */}
          <GlassCard style={styles.form}>
            <View>
              <Text style={styles.label}>名前</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="名前"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                maxLength={30}
              />
            </View>
            <View>
              <Text style={styles.label}>自己紹介</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="自己紹介"
                placeholderTextColor={colors.textFaint}
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={3}
                maxLength={140}
              />
            </View>
          </GlassCard>

          <GradientButton label="保存する" onPress={onSave} style={styles.save} />
          <Text style={styles.note}>
            ※ MVP: 端末内に保存されます（再起動後も保持）。
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 16, paddingBottom: 60, gap: 20 },
  avatarSection: { alignItems: "center", gap: 10, paddingTop: 8 },
  avatarWrap: { width: 110, height: 110 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 999,
    borderColor: colors.borderStrong,
    borderWidth: 2,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.purple,
    borderColor: colors.bg,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhoto: { color: colors.cyan, fontSize: 14, fontWeight: "700" },
  form: { padding: 18, gap: 16 },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginBottom: 6 },
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
  save: { marginTop: 4 },
  note: { color: colors.textFaint, fontSize: 11, textAlign: "center" },
});
