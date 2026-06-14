// Supabase クライアント基盤(Phase 0)。
// この段階ではどの Context にも接続せず、クライアントの定義だけを用意する。
// 環境変数は EXPO_PUBLIC_ 接頭辞でクライアントに埋め込まれる(anon key は RLS 前提で公開可)。
// service_role key は絶対にここ/クライアントに置かないこと。
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "./database.types";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// URL / anon key が設定されているか。接続が必要な画面で個別に参照して分岐する。
export const isSupabaseConfigured = !!url && !!anonKey;

if (!isSupabaseConfigured) {
  // 未設定でもアプリはクラッシュさせない(接続機能は無効のまま既存のローカル動作を維持)。
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY が未設定です。Supabase 接続機能は無効です。",
  );
}

export const supabase = createClient<Database>(url ?? "", anonKey ?? "", {
  auth: {
    storage: AsyncStorage, // セッションを端末に永続化(再起動後も維持)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Expo(ネイティブ)では URL セッション検出は使わない
  },
});
