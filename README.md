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

## 起動方法（ポート 8082 固定）

```bash
npm install
npm run dev:ios   # ← 推奨。iOS Simulator を直接起動する
```

> ⚠️ この環境では **ポート 8081 が別プロジェクトに使われている**ため、Billdist は **必ず 8082** を使います。下記の npm script はすべて 8082 固定です。素の `npx expo start`（ポート無指定）は 8081 に取られてポートが揺れるので使わないでください。

### 起動コマンド一覧

| コマンド | 用途 |
| --- | --- |
| `npm run dev:ios` | **推奨**。キャッシュクリア + iOS Simulator を直接起動（`--clear --localhost --ios --port 8082`） |
| `npm run dev` | 通常起動（`--port 8082`、QRコードで実機/Simulator） |
| `npm run dev:clear` | キャッシュクリア起動（表示が崩れる/古いとき） |
| `npm run dev:tunnel` | トンネル経由（同一Wi-Fiで繋がらない実機向け） |
| `npm run demo` | 本番に近いデモ起動（開発オーバーレイ非表示・最小化） |

### なぜ `npm run dev:ios` が安定するのか（推奨理由）

- **`--localhost`**: iOS Simulator は Mac と同じマシン上で動くため `127.0.0.1:8082` が常に有効。Wi-Fi の LAN IP が変わっても URL がズレず、`Could not connect` の主因（古い LAN URL を掴み続ける問題）を回避できる。
- **`--ios`**: 毎回 Simulator を**最新の起動中サーバーに繋ぎ直して**アプリを開く。Expo Go が古いセッション URL を掴んでいても、起動のたびに上書きされる。
- **`--port 8082`**: ポートを固定。8081 を使う別プロジェクトと衝突しない。
- **`--clear`**: 古い Metro キャッシュを捨てて起動。

> Mac + iOS Simulator では **`--localhost` が最も安定**します。物理デバイスで確認する場合のみ `npm run dev`（同一Wi-Fi）または `npm run dev:tunnel` を使ってください。

## 8082 で起動中か確認する

```bash
lsof -i :8082        # 何か表示されれば Metro が 8082 で起動中
```

何も表示されない場合は Metro が起動していません（= `Could not connect` の原因）。`npm run dev:ios` で起動してください。

## 接続できないとき（Could not connect to the server）— 復旧手順

`Could not connect to the server.` のほとんどは **Metro が起動していない／古い URL を掴んでいる**ことが原因です。次の順で復旧します。

1. iOS Simulator の **Expo Go を完全終了**する（アプリスイッチャーから上スワイプ）
2. ターミナルの **Metro を `Ctrl + C` で停止**する
3. `npm run dev:clear` を実行する
4. **iOS Simulator を開き直す**（`npm run dev:ios` なら自動で開く）
5. それでもダメなら `npm run dev:tunnel` を試す

> デモ中は **Metro のターミナルを閉じない**でください。サーバーが動き続けていれば、アプリ内 **Cmd + R** のリロードで `Could not connect` にはなりません。

## Dev Menu（青い歯車）について

- 開発中、iOS Simulator / Expo Go 上に **Expo の開発メニュー（青い歯車のフローティングボタン）** が表示されることがあります。
- これは **Expo / React Native 標準の開発用UI** であり、アプリのコードではありません。
- **本番 / プレビュー起動では表示されません。** デモで消したい場合は `npm run demo` で起動してください。

## スクリプト

```bash
npm run dev:ios     # 推奨: iOS Simulator を直接起動（8082固定）
npm run dev         # 開発サーバー（QRコード表示・8082固定）
npm run dev:clear   # キャッシュクリア起動
npm run dev:tunnel  # トンネル起動
npm run demo        # 本番に近いデモ起動
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
