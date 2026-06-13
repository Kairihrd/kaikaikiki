// 「サポート(応援)した作品/アーティスト」をアプリ全体で共有し、AsyncStorage に保存する。
// 「自分がサポートしたもの」を一元管理する(=「自分をサポートしてくれた人」とは別概念)。
// MVP では作品ID単位で保存し、表示用に作者名/作品名/画像も一緒に持つ。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPPORTS_KEY = "senseed:supports";

export interface SupportItem {
  id: string; // 作品ID(MVP)
  artistName?: string;
  artistHandle?: string;
  artworkTitle?: string;
  imageUrl?: string;
  createdAt: number;
}

interface SupportContextValue {
  supports: SupportItem[];
  supportCount: number;
  loaded: boolean;
  isSupported: (id: string) => boolean;
  /** サポートのトグル。トグル後にサポート中なら true を返す。 */
  toggleSupport: (item: Omit<SupportItem, "createdAt">) => boolean;
  addSupport: (item: Omit<SupportItem, "createdAt">) => void;
  removeSupport: (id: string) => void;
}

const SupportContext = createContext<SupportContextValue>({
  supports: [],
  supportCount: 0,
  loaded: false,
  isSupported: () => false,
  toggleSupport: () => false,
  addSupport: () => {},
  removeSupport: () => {},
});

export function SupportProvider({ children }: { children: ReactNode }) {
  const [supports, setSupports] = useState<SupportItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SUPPORTS_KEY);
        if (raw) setSupports(JSON.parse(raw));
      } catch {
        // 破損時は空のまま
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const value = useMemo<SupportContextValue>(() => {
    const persist = (next: SupportItem[]) =>
      AsyncStorage.setItem(SUPPORTS_KEY, JSON.stringify(next)).catch(() => {});

    return {
      supports,
      supportCount: supports.length,
      loaded,
      isSupported: (id) => supports.some((s) => s.id === id),
      addSupport: (item) => {
        setSupports((prev) => {
          if (prev.some((s) => s.id === item.id)) return prev; // 二重加算しない
          const next = [{ ...item, createdAt: Date.now() }, ...prev];
          persist(next);
          return next;
        });
      },
      removeSupport: (id) => {
        setSupports((prev) => {
          const next = prev.filter((s) => s.id !== id);
          persist(next);
          return next;
        });
      },
      toggleSupport: (item) => {
        const already = supports.some((s) => s.id === item.id);
        setSupports((prev) => {
          let next: SupportItem[];
          if (prev.some((s) => s.id === item.id)) {
            next = prev.filter((s) => s.id !== item.id);
          } else {
            next = [{ ...item, createdAt: Date.now() }, ...prev];
          }
          persist(next);
          return next;
        });
        return !already; // トグル後にサポート中か
      },
    };
  }, [supports, loaded]);

  return (
    <SupportContext.Provider value={value}>{children}</SupportContext.Provider>
  );
}

export function useSupport() {
  return useContext(SupportContext);
}
