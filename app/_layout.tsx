import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { PostsProvider } from "@/context/PostsContext";
import { LikesProvider } from "@/context/LikesContext";
import { SupportProvider } from "@/context/SupportContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

// 認証ゲート: 未ログインなら /login へ、ログイン済みで /login にいるなら / へ。
// また、起動時(ログイン済み)は必ずビルボード(/)から始める。
function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // 起動後に一度だけビルボードへ寄せるためのフラグ。
  const didLandOnBillboard = useRef(false);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "login";
    if (!user) {
      if (!inAuth) router.replace("/login");
      return;
    }
    // ログイン済み。
    if (inAuth) {
      router.replace("/"); // ログイン/新規登録成功後はビルボードへ。
      return;
    }
    // 起動直後は、前回どこにいてもビルボードから始める(初回のみ)。
    if (!didLandOnBillboard.current) {
      didLandOnBillboard.current = true;
      if (segments[0] !== undefined && segments[0] !== "index") {
        router.replace("/");
      }
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
                <LikesProvider>
                  <SupportProvider>
                    <NotificationProvider>
                      <RootNavigation />
                    </NotificationProvider>
                  </SupportProvider>
                </LikesProvider>
              </PostsProvider>
            </ProfileProvider>
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
