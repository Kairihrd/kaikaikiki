// ログイン中ユーザーのプロフィールをアプリ全体で共有する。
// Supabase の profiles テーブル(id = auth.user.id)を正とする。
// 未ログイン/未設定なら空プロフィール(固定の「カナタ」等は出さない)。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface ProfileData {
  name: string | null; // display_name
  handle: string | null; // handle(@なし)
  bio: string | null;
  avatarUri: string | null; // avatar_url
}

const EMPTY: ProfileData = { name: null, handle: null, bio: null, avatarUri: null };

// profiles テーブル行(プレースホルダ型のため最低限の形でキャスト)。
interface ProfileRow {
  display_name?: string | null;
  handle?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface ProfileContextValue {
  profile: ProfileData;
  loaded: boolean;
  updateProfile: (patch: Partial<ProfileData>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: EMPTY,
  loaded: false,
  updateProfile: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  // ログインユーザーが変わるたびに、その人の profiles を読み込む(混ざらないように)。
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user || !supabase) {
        if (alive) {
          setProfile(EMPTY);
          setLoaded(true);
        }
        return;
      }
      setLoaded(false);
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, handle, bio, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (!alive) return;
        const row = (data ?? null) as ProfileRow | null;
        setProfile(
          row
            ? {
                name: row.display_name ?? null,
                handle: row.handle ?? null,
                bio: row.bio ?? null,
                avatarUri: row.avatar_url ?? null,
              }
            : EMPTY,
        );
      } catch {
        if (alive) setProfile(EMPTY);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loaded,
      updateProfile: async (patch) => {
        // まず即時反映。
        setProfile((prev) => ({ ...prev, ...patch }));
        // Supabase 接続済みなら profiles を更新(avatar は Storage 未実装のため Phase 2)。
        if (user && supabase) {
          const db: ProfileRow = {};
          if ("name" in patch) db.display_name = patch.name ?? null;
          if ("bio" in patch) db.bio = patch.bio ?? null;
          if ("handle" in patch) db.handle = patch.handle ?? null;
          if (Object.keys(db).length > 0) {
            await supabase
              .from("profiles")
              .update(db as never)
              .eq("id", user.id);
          }
        }
      },
    }),
    [profile, loaded, user],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}
