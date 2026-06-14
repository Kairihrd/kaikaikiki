// Supabase クライアント基盤。
// 環境変数は EXPO_PUBLIC_ 接頭辞でクライアントに埋め込まれる(anon key は RLS 前提で公開可)。
// service_role key は絶対にここ/クライアントに置かないこと。
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "./database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// URL / anon key が両方そろっているか。Auth など接続機能の有効/無効に使う。
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // 未設定でも import 時にクラッシュさせない(createClient を絶対に呼ばない)。
  // 本番で Auth を使うには EXPO_PUBLIC_SUPABASE_URL / ANON_KEY が必須。
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY が未設定です。" +
      "Supabase 接続機能(Auth等)は無効になります。.env を設定して再起動してください。",
  );
}

// 未設定時は null。利用側は isSupabaseConfigured / null チェックで分岐すること。
// (createClient("") は "supabaseUrl is required" を投げるため、未設定では呼ばない)
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage, // セッションを端末に永続化(再起動後も維持)
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Expo(ネイティブ)では URL セッション検出は使わない
      },
    })
  : null;
