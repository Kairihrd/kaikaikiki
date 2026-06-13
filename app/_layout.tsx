import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { PostsProvider } from "@/context/PostsContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

// 認証ゲート: 未ログインなら /login へ、ログイン済みで /login にいるなら / へ。
function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "login";
    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && inAuth) {
      router.replace("/");
    }
  }, [user, loading, segments, router]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "fade",
        }}
      />
    </>
  );
}

// アプリのルートレイアウト。
// 下部タブバーは各画面が <BottomNav /> を描画する方式(フローティングバーのため)。
// 言語/プロフィール/投稿/通知/認証の状態はアプリ全体で共有するため Provider で包む。
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AuthProvider>
          <LanguageProvider>
            <ProfileProvider>
              <PostsProvider>
                <NotificationProvider>
                  <RootNavigation />
                </NotificationProvider>
              </PostsProvider>
            </ProfileProvider>
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
