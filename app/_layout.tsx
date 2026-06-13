import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "@/context/LanguageContext";
import { colors } from "@/lib/theme";

// アプリのルートレイアウト。
// 下部タブバーは各画面が <BottomNav /> を描画する方式(フローティングバーのため)。
// 言語状態はアプリ全体で共有するため LanguageProvider で包む。
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: "fade",
            }}
          />
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
