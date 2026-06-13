// いいね状態をアプリ全体で共有し、AsyncStorage に作品IDごとに保存する。
// タイムラインと作品詳細でいいねが一致し、再起動後も維持される。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LIKES_KEY = "senseed:likes";

interface LikesContextValue {
  loaded: boolean;
  isLiked: (id: string) => boolean;
  /** いいねをトグルし、トグル後にいいね済みなら true を返す。 */
  toggleLike: (id: string) => boolean;
}

const LikesContext = createContext<LikesContextValue>({
  loaded: false,
  isLiked: () => false,
  toggleLike: () => false,
});

export function LikesProvider({ children }: { children: ReactNode }) {
  // 作品ID → いいね済みフラグ。Set ではなく配列で永続化する。
  const [liked, setLiked] = useState<Record<string, true>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LIKES_KEY);
        if (raw) {
          const ids: string[] = JSON.parse(raw);
          const map: Record<string, true> = {};
          ids.forEach((id) => (map[id] = true));
          setLiked(map);
        }
      } catch {
        // 破損時は空のまま
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const value = useMemo<LikesContextValue>(
    () => ({
      loaded,
      isLiked: (id) => !!liked[id],
      toggleLike: (id) => {
        const willLike = !liked[id];
        setLiked((prev) => {
          const next = { ...prev };
          if (next[id]) delete next[id];
          else next[id] = true;
          AsyncStorage.setItem(
            LIKES_KEY,
            JSON.stringify(Object.keys(next)),
          ).catch(() => {});
          return next;
        });
        return willLike;
      },
    }),
    [liked, loaded],
  );

  return (
    <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
  );
}

export function useLikes() {
  return useContext(LikesContext);
}
