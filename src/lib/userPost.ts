// ユーザー投稿(UserPost)を、表示用のデータ型(Artwork / TimelinePost)に変換する。
// これにより、自分の投稿をビルボード/テーマ/タイムラインに「自分の作品」として反映できる。
import {
  CURRENT_THEME,
  DEFAULT_ARTWORK_IMAGE,
  type Artwork,
  type Genre,
  type TimelineMedia,
  type TimelinePost,
} from "./mockData";
import type { PostTarget, UserPost } from "../context/PostsContext";

export interface Author {
  name: string;
  handle: string;
  avatarUrl: string;
}

// 投稿先のラベル(プロフィールのカードに小さく表示する)。
export const TARGET_LABEL: Record<PostTarget, string> = {
  timeline: "タイムライン",
  today: "今日の100",
  theme: "テーマ",
};

// UserPost → Artwork(ビルボード/テーマ/作品詳細で使用)。
export function userPostToArtwork(p: UserPost, author: Author): Artwork {
  return {
    id: p.id,
    title: p.title,
    creatorName: author.name,
    creatorHandle: author.handle,
    imageUrl: p.imageUri ?? DEFAULT_ARTWORK_IMAGE,
    genre: (p.genre as Genre) ?? "その他",
    theme: p.theme ?? CURRENT_THEME,
    description: p.caption,
    likes: 0,
    comments: 0,
    isVideo: !!p.isVideoWork,
    isAudio: false,
    tags: [],
    size: "small",
    // 自分の投稿は未露出 → ビルボードで優先表示されるよう 0。
    shownCount: 0,
  };
}

// UserPost → TimelinePost(タイムラインで使用)。
export function userPostToTimelinePost(
  p: UserPost,
  author: Author,
): TimelinePost {
  const mediaType: TimelineMedia = p.isVideoWork
    ? "video"
    : p.imageUri
      ? "image"
      : "poem";
  return {
    id: p.id,
    category: p.genre,
    title: p.title,
    creatorName: author.name,
    username: author.handle,
    avatarUrl: author.avatarUrl,
    description: p.caption,
    body: p.imageUri ? undefined : p.caption,
    tags: [],
    likes: 0,
    comments: 0,
    soundLabel: "オリジナル投稿",
    mediaType,
    imageUrl: p.imageUri ?? DEFAULT_ARTWORK_IMAGE,
    gradient: ["#0b0d10", "#1c2026", "#05070a"],
    accent: "#22d3ee",
  };
}
