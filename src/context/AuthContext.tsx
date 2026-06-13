// MVP用の簡易ローカル認証。実バックエンドは使わず、AsyncStorage に
// 登録ユーザー(email→password)とログインセッションを保存する。再起動後も維持。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "senseed:auth:session";
const USERS_KEY = "senseed:auth:users";

// デモ用アカウント(MVPデモ)。新規登録なしでログインできる。
export const DEMO_EMAIL = "demo@senseed.app";
export const DEMO_PASSWORD = "senseed123";

export interface AuthUser {
  email: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({ ok: false, error: "auth.errNoUser" }),
  signUp: async () => ({ ok: false, error: "auth.errNoUser" }),
  signOut: async () => {},
});

async function loadUsers(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // セッション無し
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signUp: async (email, password) => {
        const key = email.trim().toLowerCase();
        const users = await loadUsers();
        if (users[key]) return { ok: false, error: "auth.errExists" };
        users[key] = password;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users)).catch(() => {});
        const u = { email: key };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u)).catch(() => {});
        setUser(u);
        return { ok: true };
      },
      signIn: async (email, password) => {
        const key = email.trim().toLowerCase();
        // デモアカウントは登録なしで常にログイン可能。
        const isDemo = key === DEMO_EMAIL && password === DEMO_PASSWORD;
        if (!isDemo) {
          const users = await loadUsers();
          if (users[key] !== password) {
            return { ok: false, error: "auth.errNoUser" };
          }
        }
        const u = { email: key };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u)).catch(() => {});
        setUser(u);
        return { ok: true };
      },
      signOut: async () => {
        await AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
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
