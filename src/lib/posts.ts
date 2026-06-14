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
  if (!supabase) return { ok: false, error: "Supabase未設定（.env / EXPO_PUBLIC_*）" };
  const { error } = await supabase.from("posts").insert({
    author_id: userId,
    title: input.title,
    description: input.description,
    category: input.category,
    image_url: input.imageUrl ?? null,
    video_url: input.videoUrl ?? null,
  } as never);
  if (__DEV__) {
    console.warn(
      `[posts] insert ${error ? "ERROR: " + error.message : "OK"} (author_id=${userId})`,
    );
  }
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 全ユーザーのタイムライン投稿を新着順で取得し、投稿者プロフィールを別取得で結合する。
// 未設定/失敗時は null(呼び出し側はモックへフォールバック)。
export async function fetchTimelinePosts(): Promise<TimelinePost[] | null> {
  if (!supabase) {
    if (__DEV__) console.warn("[posts] fetchTimeline: Supabase未設定 → モックへ");
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id,author_id,title,description,category,image_url,video_url,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    // posts 取得自体が失敗 → null(フォールバック)。空配列は成功(0件)として扱う。
    if (error) {
      if (__DEV__) console.warn("[posts] fetchTimeline posts ERROR:", error.message);
      return null;
    }
    const rows = (data ?? []) as unknown as DbPostRow[];
    if (__DEV__) console.warn(`[posts] fetchTimeline OK: ${rows.length}件`);

    // 投稿者プロフィールをまとめて取得(失敗しても投稿は表示する=非致命)。
    const ids = [...new Set(rows.map((r) => r.author_id))];
    const profileMap = new Map<string, ProfileRow>();
    if (ids.length > 0) {
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("id,display_name,handle,avatar_url")
        .in("id", ids);
      if (__DEV__ && pErr) console.warn("[posts] profiles fetch ERROR (非致命):", pErr.message);
      ((profs ?? []) as unknown as ProfileRow[]).forEach((p) =>
        profileMap.set(p.id, p),
      );
    }
    return rows.map((r) => toTimelinePost(r, profileMap.get(r.author_id)));
  } catch (e) {
    if (__DEV__) console.warn("[posts] fetchTimeline EXCEPTION:", String(e));
    return null;
  }
}

// クリエイタープロフィール(他ユーザー)。
export interface SupaCreator {
  id: string;
  display_name: string | null;
  handle: string | null;
  bio: string | null;
  location: string | null;
  role: string | null;
  avatar_url: string | null;
}

// 作品カード(クリエイタープロフィールのグリッド表示用)。
export interface CreatorWork {
  id: string;
  title: string;
  genre: string;
  imageUrl: string;
  isVideo: boolean;
}

// handle(@なし)から profiles を1件取得。未設定/不在は null。
export async function fetchProfileByHandle(
  handle: string,
): Promise<SupaCreator | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,handle,bio,location,role,avatar_url")
      .eq("handle", handle)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as SupaCreator;
  } catch {
    return null;
  }
}

// author_id の投稿を作品カードとして取得(新着順)。未設定/失敗は null。
export async function fetchCreatorWorks(
  userId: string,
): Promise<CreatorWork[] | null> {
  const rows = await fetchUserPosts(userId);
  if (rows === null) return null;
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    genre: p.category ?? "その他",
    imageUrl: p.image_url ?? DEFAULT_ARTWORK_IMAGE,
    isVideo: !!p.video_url,
  }));
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
