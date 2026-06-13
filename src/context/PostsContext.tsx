// ユーザーが作成した投稿(タイムライン反映)と、テーマへの投稿済み状態を
// アプリ全体で共有し、AsyncStorage に保存する(再起動後も維持)。
// テーマは「1人1投稿」制限のため、投稿済みテーマ名を保持する。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POSTS_KEY = "senseed:posts";
const THEME_POSTS_KEY = "senseed:themePosts";

export interface UserPost {
  id: string;
  imageUri?: string; // 写真。無ければグラデーション表示
  title: string;
  caption: string;
  genre: string;
  toTheme?: string; // テーマに応募した場合のテーマ名
  createdAt: number;
}

interface PostsContextValue {
  posts: UserPost[];
  themePosts: string[];
  loaded: boolean;
  hasPostedToTheme: (theme: string) => boolean;
  addPost: (post: Omit<UserPost, "id" | "createdAt">) => Promise<void>;
}

const PostsContext = createContext<PostsContextValue>({
  posts: [],
  themePosts: [],
  loaded: false,
  hasPostedToTheme: () => false,
  addPost: async () => {},
});

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [themePosts, setThemePosts] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, tp] = await Promise.all([
          AsyncStorage.getItem(POSTS_KEY),
          AsyncStorage.getItem(THEME_POSTS_KEY),
        ]);
        if (p) setPosts(JSON.parse(p));
        if (tp) setThemePosts(JSON.parse(tp));
      } catch {
        // 破損時は空のまま
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const value = useMemo<PostsContextValue>(
    () => ({
      posts,
      themePosts,
      loaded,
      hasPostedToTheme: (theme: string) => themePosts.includes(theme),
      addPost: async (input) => {
        // テーマ投稿は1人1投稿。既に投稿済みなら追加しない(二重ガード)。
        if (input.toTheme && themePosts.includes(input.toTheme)) return;
        const post: UserPost = {
          ...input,
          id: `me-${Date.now()}`,
          createdAt: Date.now(),
        };
        setPosts((prev) => {
          const next = [post, ...prev];
          AsyncStorage.setItem(POSTS_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
        if (input.toTheme) {
          setThemePosts((prev) => {
            if (prev.includes(input.toTheme!)) return prev;
            const next = [...prev, input.toTheme!];
            AsyncStorage.setItem(THEME_POSTS_KEY, JSON.stringify(next)).catch(
              () => {},
            );
            return next;
          });
        }
      },
    }),
    [posts, themePosts, loaded],
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  return useContext(PostsContext);
}
