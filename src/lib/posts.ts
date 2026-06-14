// Supabase posts の最小データ層(投稿作成 / タイムライン取得)。
// Storage は未実装のため image_url は URL もしくはローカルURIをそのまま保存する。
// 未設定/失敗時は null を返し、呼び出し側はモックにフォールバックする(アプリを壊さない)。
import { supabase } from "./supabase";
import {
  DEFAULT_ARTWORK_IMAGE,
  type TimelineMedia,
  type TimelinePost,
} from "./mockData";

export interface NewPostInput {
  title: string;
  description: string;
  category: string;
  imageUrl?: string; // ローカルURI/URL(Storage未実装)
  videoUrl?: string;
}

interface DbPostRow {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
}

// 投稿を posts テーブルに作成。author_id は現在のログインユーザー。
export async function insertPost(
  input: NewPostInput,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase未設定" };
  const { error } = await supabase.from("posts").insert({
    author_id: userId,
    title: input.title,
    description: input.description,
    category: input.category,
    image_url: input.imageUrl ?? null,
    video_url: input.videoUrl ?? null,
  } as never);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 全ユーザーのタイムライン投稿を新着順で取得し、投稿者プロフィールを別取得で結合する。
// 未設定/失敗時は null(呼び出し側はモックへフォールバック)。
export async function fetchTimelinePosts(): Promise<TimelinePost[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id,author_id,title,description,category,image_url,video_url,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return null;
    const rows = data as unknown as DbPostRow[];

    // 投稿者プロフィールをまとめて取得(FK埋め込みに依存しない別取得)。
    const ids = [...new Set(rows.map((r) => r.author_id))];
    const profileMap = new Map<string, ProfileRow>();
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,handle,avatar_url")
        .in("id", ids);
      ((profs ?? []) as unknown as ProfileRow[]).forEach((p) =>
        profileMap.set(p.id, p),
      );
    }
    return rows.map((r) => toTimelinePost(r, profileMap.get(r.author_id)));
  } catch {
    return null;
  }
}

// 自分の投稿を新着順で取得(マイページ用・任意)。
export async function fetchUserPosts(
  userId: string,
): Promise<DbPostRow[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id,author_id,title,description,category,image_url,video_url,created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return null;
    return data as unknown as DbPostRow[];
  } catch {
    return null;
  }
}

function toTimelinePost(p: DbPostRow, prof?: ProfileRow): TimelinePost {
  const name = prof?.display_name || prof?.handle || "ユーザー";
  const username = prof?.handle ? `@${prof.handle}` : "";
  const mediaType: TimelineMedia = p.video_url ? "video" : "image";
  return {
    id: p.id,
    category: p.category ?? "作品",
    title: p.title,
    creatorName: name,
    username,
    avatarUrl:
      prof?.avatar_url ||
      `https://picsum.photos/seed/senseed-avatar-${prof?.handle ?? p.author_id}/200/200`,
    description: p.description ?? "",
    tags: [],
    likes: 0,
    comments: 0,
    soundLabel: "オリジナル投稿",
    mediaType,
    imageUrl: p.image_url ?? DEFAULT_ARTWORK_IMAGE,
    gradient: ["#0b0d10", "#1c2026", "#05070a"],
    accent: "#22d3ee",
  };
}
