// ユーザープロフィール(名前 / 自己紹介 / アイコン画像)の状態をアプリ全体で共有し、
// AsyncStorage に保存する(再起動後も維持)。未設定の項目は null = 既定値(i18n / mock)を使う。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "senseed:profile";

export interface ProfileData {
  name: string | null; // null のときは i18n の既定名を使う
  bio: string | null; // null のときは i18n の既定自己紹介を使う
  avatarUri: string | null; // null のときは mock アバターを使う
}

const EMPTY: ProfileData = { name: null, bio: null, avatarUri: null };

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
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) });
      } catch {
        // 破損時は既定値のまま
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loaded,
      updateProfile: async (patch) => {
        setProfile((prev) => {
          const next = { ...prev, ...patch };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      },
    }),
    [profile, loaded],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}
