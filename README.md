# Billdist (Mobile)

毎日100人のクリエイター・作品が表示される、ビルボード型のアート発掘SNS。
**Expo + React Native** で作るスマホアプリ版の MVP（UIモック）です。

無名のアーティスト・写真家・音楽家・建築家・映像作家・ファッションデザイナー・パフォーマーなどを発掘するサービスのモバイルフロントエンドモックです。

## 技術構成

- Expo (SDK 56) / React Native
- TypeScript
- Expo Router（ファイルベースルーティング）
- lucide-react-native（アイコン）
- expo-image / expo-linear-gradient / react-native-svg
- react-native-safe-area-context / react-native-gesture-handler

> Supabase / Gemini API はまだ接続していません。データはすべて `src/lib/mockData.ts` のモックから読み込んでいます（後で API に差し替えやすい構成）。

## 起動方法（スマホ実機で確認）

```bash
npm install
npx expo start
```

1. ターミナルに表示される **QRコード** を読み込みます。
   - iPhone: 標準カメラアプリで読み取り → Expo Go が開きます
   - Android: **Expo Go** アプリ内のスキャナーで読み取ります
2. 事前に App Store / Google Play で **Expo Go** をインストールしておいてください。
3. PC とスマホは同じ Wi-Fi に接続してください（つながらない場合は `npx expo start --tunnel`）。

## スクリプト

```bash
npx expo start      # 開発サーバー（QRコード表示）
npm run ios         # iOS シミュレータ（Mac + Xcode が必要）
npm run android     # Android エミュレータ
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

## 画面一覧（Expo Router）

| ルート | 画面 |
| --- | --- |
| `/` | 今日のビルボード（メイン） |
| `/theme` | テーマビルボード（テーマ：境界） |
| `/timeline` | タイムライン（Reels風・縦型） |
| `/artwork/[id]` | 作品詳細 |
| `/profile` | マイページ |
| `/post` | 投稿（フォーム + プレビュー） |
| `/supporting` | サポーター中 |

## ディレクトリ

```
app/              # Expo Router の各画面
  _layout.tsx     # ルートレイアウト（Stack）
  index.tsx       # 今日のビルボード
  artwork/[id].tsx
  ...
src/
  components/     # 共通UIコンポーネント
  lib/
    mockData.ts   # モックデータ + 取得関数（API差し替え窓口）
    theme.ts      # 色・グラデーション等のデザイントークン
    format.ts     # 表示用ユーティリティ
```

## 次フェーズ（未実装）

Supabase / Gemini API 接続、認証、実アップロード、いいね・コメント永続化など。
データ取得は `src/lib/mockData.ts` の `getXxx()` を fetch に差し替える形を想定しています。

## ライセンス

未定
