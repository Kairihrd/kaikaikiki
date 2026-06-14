// Supabase スキーマの型定義(プレースホルダ)。
// 実テーブル追加後に、以下で自動生成したものへ置き換える:
//   npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
// 現時点ではテーブル未接続のため最小の空スキーマ。
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
