// ユーザーが作成した投稿をアプリ全体で共有し、AsyncStorage に保存する(再起動後も維持)。
// senseed の投稿先は3種類: タイムライン / 今日の100(ビルボード) / テーマ。
//  - timeline: 何枚でも投稿できる(通常のタイムライン投稿)
//  - today   : 1アカウント1枚(自信作/ビルボード掲載用)。再投稿は差し替え。
//  - theme   : テーマごとに1人1投稿。再投稿は差し替え。
// また、マイページのビルボードに出す「自信作」(featuredId)も保持する。
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
const FEATURED_KEY = "senseed:featuredId";

// 投稿先の種別。
export type PostTarget = "timeline" | "today" | "theme";

export interface UserPost {
  id: string;
  imageUri?: string; // 写真/サムネイル。無ければ表示側でデフォルト作品画像を使う
  title: string;
  caption: string;
  genre: string;
  target: PostTarget; // 投稿先
  theme?: string; // テーマ投稿の場合のテーマ名
  isVideoWork?: boolean; // 動画作品(サムネ + 再生ボタン表示)
  createdAt: number;
}

interface PostsContextValue {
  posts: UserPost[];
  loaded: boolean;
  featuredId: string | null;
  /** マイページのビルボードに出す自信作(featuredId 優先、無ければ最新投稿)。 */
  featuredPost: UserPost | null;
  /** 指定の投稿先に既に投稿済みか(today は1枚、theme はテーマ単位)。 */
  hasPostedTo: (target: PostTarget, theme?: string) => boolean;
  /** 後方互換: テーマに投稿済みか。 */
  hasPostedToTheme: (theme: string) => boolean;
  /** 投稿を追加(today/theme は差し替え)。作成した投稿を返す。 */
  addPost: (input: Omit<UserPost, "id" | "createdAt">) => Promise<UserPost>;
  /** 自信作(マイページのビルボード掲載作品)を設定。 */
  setFeatured: (id: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextValue>({
  posts: [],
  loaded: false,
  featuredId: null,
  featuredPost: null,
  hasPostedTo: () => false,
  hasPostedToTheme: () => false,
  addPost: async () => ({
    id: "",
    title: "",
    caption: "",
    genre: "",
    target: "timeline",
    createdAt: 0,
  }),
  setFeatured: async () => {},
});

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, f] = await Promise.all([
          AsyncStorage.getItem(POSTS_KEY),
          AsyncStorage.getItem(FEATURED_KEY),
        ]);
        if (p) setPosts(JSON.parse(p));
        if (f) setFeaturedId(f);
      } catch {
        // 破損時は空のまま
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const value = useMemo<PostsContextValue>(() => {
    const featuredPost =
      posts.find((p) => p.id === featuredId) ?? posts[0] ?? null;

    return {
      posts,
      loaded,
      featuredId,
      featuredPost,
      hasPostedTo: (target, theme) =>
        posts.some(
          (p) =>
            p.target === target &&
            (target !== "theme" || p.theme === theme),
        ),
      hasPostedToTheme: (theme) =>
        posts.some((p) => p.target === "theme" && p.theme === theme),
      addPost: async (input) => {
        const post: UserPost = {
          ...input,
          id: `me-${Date.now()}`,
          createdAt: Date.now(),
        };
        let nextPosts: UserPost[] = [];
        setPosts((prev) => {
          // today は1アカウント1枚、theme はテーマ単位で1枚 → 既存を差し替える。
          const filtered = prev.filter((p) => {
            if (input.target === "today") return p.target !== "today";
            if (input.target === "theme")
              return !(p.target === "theme" && p.theme === input.theme);
            return true; // timeline は差し替えない
          });
          nextPosts = [post, ...filtered];
          AsyncStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts)).catch(
            () => {},
          );
          return nextPosts;
        });
        return post;
      },
      setFeatured: async (id) => {
        setFeaturedId(id);
        await AsyncStorage.setItem(FEATURED_KEY, id).catch(() => {});
      },
    };
  }, [posts, featuredId, loaded]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  return useContext(PostsContext);
}
