// Supabase Auth による認証。セッションは supabase-js が AsyncStorage に永続化する。
// profiles 行はサインアップ時に DB トリガー(handle_new_user)が metadata から自動生成する。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string | null;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Supabase の URL / anon key が設定済みか。 */
  configured: boolean;
  signUp: (
    email: string,
    password: string,
    handle: string,
    displayName: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const NOT_CONFIGURED = "Supabase設定が未完了です。.env を設定してください。";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  configured: false,
  signUp: async () => ({ ok: false, error: NOT_CONFIGURED }),
  signIn: async () => ({ ok: false, error: NOT_CONFIGURED }),
  signOut: async () => {},
});

function toUser(u: { id: string; email?: string | null } | null): AuthUser | null {
  return u ? { id: u.id, email: u.email ?? null } : null;
}

// Supabase の英語エラーを日本語の分かりやすい文言へ。
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "メールアドレスまたはパスワードが違います。";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "このメールアドレスは既に登録されています。";
  if (m.includes("duplicate") || m.includes("unique") || m.includes("profiles_handle"))
    return "このユーザー名（handle）は既に使われています。";
  if (m.includes("password")) return "パスワードは6文字以上にしてください。";
  return message || "エラーが発生しました。";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // 未設定時は最初から loading=false(エフェクト内で同期 setState しない)。
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // 起動時に保存済みセッションを復元。
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user ?? null));
      setLoading(false);
    });
    // 以降のサインイン/アウト/トークン更新を監視。
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      signUp: async (email, password, handle, displayName) => {
        if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
        const h = handle.trim().toLowerCase();
        // 事前に handle 重複を確認(unique 制約が最終ガード)。
        try {
          const { data: existing } = await supabase
            .from("profiles")
            .select("handle")
            .eq("handle", h)
            .maybeSingle();
          if (existing) {
            return { ok: false, error: "このユーザー名（handle）は既に使われています。" };
          }
        } catch {
          // 事前チェックに失敗しても unique 制約で守られるため続行。
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { handle: h, display_name: displayName.trim() } },
        });
        if (error) return { ok: false, error: friendlyError(error.message) };
        return { ok: true };
      },
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) return { ok: false, error: friendlyError(error.message) };
        return { ok: true };
      },
      signOut: async () => {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
