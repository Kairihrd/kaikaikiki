# senseed (Mobile)

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

## 起動方法（iOS Simulator・推奨）

iOS Simulator で確認するときは、**Expo Go を使わずネイティブ実行する `npm run ios` を推奨**します。Expo Go の接続キャッシュに依存しないため、`Could not connect to the server` が起きません。

```bash
npm install
npm run ios   # ← 推奨。senseed を iOS Simulator にネイティブ実行（Expo Go 不要）
```

- 初回は **prebuild（`ios/` 生成）→ CocoaPods → ネイティブビルド**が走るため数分かかります（2回目以降は速い）。
- 初回に **bundle identifier を聞かれたら Enter** で既定値を受け入れてください。
- ビルド済みアプリが Simulator に直接インストールされ、Metro（`127.0.0.1:8082`）に接続します。**Cmd+R のリロードでも接続エラーになりません**。
- 必要環境: **Xcode + CocoaPods**（このMacは導入済みを確認済み）。

> ⚠️ この環境では **ポート 8081 が別プロジェクトに使われている**ため、senseed は **必ず 8082** を使います。下記 npm script はすべて 8082 固定です。素の `npx expo start`（ポート無指定）は使わないでください。

### 起動コマンド一覧

| コマンド | 用途 |
| --- | --- |
| `npm run ios` | **推奨**。iOS Simulator にネイティブ実行（`expo run:ios --port 8082`、Expo Go 不要） |
| `npm run ios:clean` | ビルドキャッシュを使わずネイティブ実行（ビルドがおかしいとき） |
| `npm run demo` | 本番に近いデモ起動（開発オーバーレイ非表示・最小化） |

### 実機（物理デバイス）で確認するとき＝ Expo Go（補助）

実機確認は従来どおり Expo Go を使います（Simulator では使いません）。

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー起動（QRコードを実機の Expo Go で読む・`--port 8082`） |
| `npm run dev:tunnel` | 同一Wi-Fiで繋がらない実機向け（トンネル経由） |
| `npm run dev:clear` | Metro キャッシュをクリアして起動 |

> Simulator で `Could not connect to the server` が出る場合は、Expo Go 経由（`dev:ios` / `dev:ios:fresh`）ではなく **`npm run ios`（ネイティブ実行）を使ってください。** これが最も確実です。
>
> Expo Go ベースの補助スクリプト（`dev:ios` / `dev:ios:fresh` / `sim:reset`）も残してあります（`package.json` 参照）。Simulator で Expo Go をどうしても使う場合のみ利用してください。

> Mac + iOS Simulator では **`--localhost` が最も安定**します。物理デバイスで確認する場合のみ `npm run dev`（同一Wi-Fi）または `npm run dev:tunnel` を使ってください。

## 8082 で起動中か確認する

```bash
lsof -i :8082        # 何か表示されれば Metro が 8082 で起動中
```

何も表示されない場合は Metro が起動していません（= `Could not connect` の原因）。

## Simulator で「Could not connect to the server」が出るとき

**まず `npm run ios`（ネイティブ実行）を使ってください。** Expo Go の接続キャッシュに依存しないため、この方式なら接続エラーは起きません。

```bash
# Ctrl+C で起動中の Metro を止めてから
npm run ios          # ネイティブ実行で iOS Simulator に直接インストール
npm run ios:clean    # ビルドが壊れている疑いがあるとき
```

### それでもダメなとき（Simulator 自体を作り直す）

```bash
xcrun simctl shutdown booted && open -a Simulator   # Simulator を再起動
npm run ios:clean                                    # ビルドキャッシュ無しで再実行
```

### 実機で Expo Go を使っていて接続できない場合（補助）

1. 実機の **Expo Go を完全終了 → 再起動**
2. ターミナルの **Metro を `Ctrl + C` で停止**
3. `npm run dev:clear`（同一Wi-Fi）または `npm run dev:tunnel` で起動し直す

> ※ Simulator で Expo Go をどうしても使う場合のみ、`npm run sim:reset`（Expo Go を終了＋アンインストール）→ `npm run dev:ios:fresh` も使えます。ただし **Simulator は `npm run ios` のネイティブ実行が推奨**です。
>
> デモ中は **Metro のターミナルを閉じない**でください。サーバーが動き続けていれば、アプリ内 **Cmd + R** のリロードで `Could not connect` にはなりません。

## Dev Menu（青い歯車）について

- 開発中、iOS Simulator / Expo Go 上に **Expo の開発メニュー（青い歯車のフローティングボタン）** が表示されることがあります。
- これは **Expo / React Native 標準の開発用UI** であり、アプリのコードではありません。
- **本番 / プレビュー起動では表示されません。** デモで消したい場合は `npm run demo` で起動してください。

## スクリプト

```bash
# iOS Simulator（推奨・Expo Go 不要）
npm run ios           # ネイティブ実行で iOS Simulator に直接インストール（8082固定）
npm run ios:clean     # ビルドキャッシュ無しでネイティブ実行

# 実機（Expo Go・補助）
npm run dev           # 開発サーバー（QRコード表示・8082固定）
npm run dev:clear     # キャッシュクリア起動
npm run dev:tunnel    # トンネル起動

# Expo Go を Simulator で使う場合のみ（補助）
npm run dev:ios       # Expo Go で Simulator を直接起動
npm run dev:ios:fresh # Expo Go を作り直して Simulator で開く
npm run sim:reset     # Simulator の Expo Go を終了＋アンインストール

# その他
npm run demo          # 本番に近いデモ起動
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
```

## 画面一覧（Expo Router）

| ルート | 画面 |
| --- | --- |
| `/` | 今日のビルボード（メイン） |
| `/matching` | マッチング（Resonance Agent / AI推薦） |
| `/theme` | テーマビルボード（ビルボード配下のサブ画面） |
| `/timeline` | タイムライン（Reels風・縦型） |
| `/artwork/[id]` | 作品詳細 |
| `/profile` | マイページ |
| `/post` | 投稿（フォーム + プレビュー、`?mode=billboard\|theme`） |
| `/supporting` | サポーター中（マイページ配下） |

### 下部タブバー

`ビルボード / マッチング / [中央=投稿] / タイムライン / マイページ` の5タブ構成です。
「テーマ」はビルボード配下のサブ画面（`/theme`）、「サポーター中」はマイページ配下（`/supporting`）として扱い、下部タブには置きません。`/theme` 表示中はビルボードを、`/supporting` 表示中はマイページを、それぞれアクティブ表示にします。

## ビルボード選出ルール（Sensedルール）

`getTodaysBillboardArtworks()` / `getThemeBillboardArtworks()` で実装しています（MVPは `mockData` で疑似実装）。

- 今日の100は **毎日表示されるアーティストが入れ替わる**（今日の日付を seed にする）。
- 全員が満遍なく露出するよう、**過去の表示回数（`shownCount`）が少ない人を優先**して選ぶ。
- 表示回数が同じ場合は **日付 seed による擬似ランダム**で並べる。
- 作品/ユーザーが **100人以下なら全件表示**（順番だけ毎日変わる）。100人超でも上位 `limit` 件を返せる設計。
- テーマビルボードも、テーマ参加作品から同じルールで毎日選出する。
- DB 接続後は、各関数の中身をサーバ側のクエリに差し替えるだけで移行できます。

## マッチング（Resonance Agent）

`/matching` 画面。**AIは作品を評価しません。** ユーザーのいいね履歴から感性を推定し、ジャンルを越えたクリエイター/作品との出会い（推薦）を作る、という設計を UI で表現しています（現状は `mockData` 駆動。Embedding / Claude API は未接続）。

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
