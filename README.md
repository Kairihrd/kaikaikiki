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

## 起動方法（iOS Simulator）

> ⚠️ **このプロジェクトの開発ポートは 8082 に固定**です。素の `npx expo start`（ポート無指定＝8081）は **絶対に使わないでください**。8081 と 8082 で Metro が二重起動すると、Expo Go がどちらに繋ぐか不定になり `Could not connect to the server` の原因になります。**npm script はすべて 8082 固定**です。

### 安定起動手順（これだけ守れば詰まりません）

```bash
# 1. 古い Expo / Metro を全部止める（8081・8082 の両方）
lsof -ti tcp:8081,8082 | xargs kill -9
# （= npm run kill-port でも同じことができます）

# 2. プロジェクト直下へ移動
cd ~/Desktop/"カイカイキキ プロジェクト"

# 3. キャッシュクリアして 8082 で起動（iOS Simulator を自動で開く）
npm run ios:clear

# 4. それでも Expo Go が古い接続先を見ている場合
#    → Simulator 上の Expo Go を「完全終了」してから開き直す
#      （Simulator: アプリスイッチャーで Expo Go を上スワイプで終了）

# 5. まだダメなら Simulator 自体を再起動
xcrun simctl shutdown booted && open -a Simulator
```

### 起動コマンド一覧（すべて 8082 固定）

| コマンド | 用途 |
| --- | --- |
| `npm run ios` | iOS Simulator で起動（`expo start --ios --port 8082`） |
| `npm run ios:clear` | **推奨**。キャッシュクリアして iOS Simulator で起動 |
| `npm run dev` | 開発サーバーのみ起動（QRコードを実機 Expo Go で読む） |
| `npm run dev:clear` | キャッシュクリアして開発サーバー起動 |
| `npm run kill-port` | 8081 / 8082 に残った Metro を強制終了 |
| `npm run reset` | kill-port → キャッシュクリア起動（迷ったらこれ） |
| `npm run dev:tunnel` | 同一Wi-Fiで繋がらない実機向け（トンネル経由） |
| `npm run native:ios` | ネイティブビルドで実行（Expo Go 不要・最も堅牢だが初回は数分） |
| `npm run sim:reset` | Simulator 上の Expo Go を終了＋アンインストール |

## 「Could not connect to the server」復旧手順

これは **コードのバグではなく Metro 接続先の問題**です。コードは修正せず、以下の順で対処してください。

```bash
# 1. 8081 に古い Metro が残っていないか確認（残っていたら止める）
lsof -i :8081
lsof -i :8082        # 8082 で起動しているのが正しい状態
npm run kill-port    # 両方まとめて止める

# 2. 8082 でキャッシュクリア起動
npm run ios:clear    # （= npm run reset でも可）

# 3. Simulator 上の Expo Go を完全終了 → 開き直す
# 4. まだ出るなら Simulator を再起動
xcrun simctl shutdown booted && open -a Simulator
```

チェックの目安：

- `lsof -i :8082` で Metro が表示されていれば起動中（何も出なければ未起動＝`Could not connect` の原因）。
- `lsof -i :8081` に **何か表示されたら二重起動**。`npm run kill-port` で必ず止める。
- それでも接続できないときだけ、Expo Go に依存しない `npm run native:ios`（ネイティブ実行）を使う。

## Dev Menu（青い歯車）について

- 開発中、Simulator / Expo Go 上に **Expo の開発メニュー（青い歯車のフローティングボタン）** が表示されることがあります。
- これは **Expo / React Native 標準の開発用UI** であり、アプリのコードではありません。本番 / プレビュー起動では表示されません。

## スクリプト

```bash
# iOS Simulator
npm run ios           # Simulator で起動（8082固定）
npm run ios:clear     # キャッシュクリアして Simulator 起動（推奨）

# 開発サーバーのみ（実機 Expo Go で QR を読む）
npm run dev           # 開発サーバー（8082固定）
npm run dev:clear     # キャッシュクリア起動
npm run dev:tunnel    # トンネル起動（実機が同一Wi-Fiで繋がらないとき）

# トラブル対応
npm run kill-port     # 8081/8082 の Metro を強制終了
npm run reset         # kill-port → キャッシュクリア起動
npm run sim:reset     # Simulator の Expo Go を終了＋アンインストール
npm run native:ios    # ネイティブ実行（Expo Go 不要・最も堅牢）

# その他
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

## 対応ジャンル（ジャンル横断のアート投稿アプリ）

senseed は写真アプリではなく、**ジャンル横断のアート投稿アプリ**です。以下の11ジャンルを扱います。

**絵画 / イラスト / 写真 / 映像 / 音楽 / 文章 / ファッション / 立体・工芸 / デジタル / パフォーマンス / その他**

（絵画＝キャンバス・油彩・水彩・アクリル・抽象画・筆跡／イラスト＝線画・キャラクター・グラフィック・ドローイング寄り、として区別します。）

- ビルボードは**ジャンル横断**で、特定ジャンル（特に写真）に偏りすぎないように表示します。
- 各作品は `genre`（上記10種）を持ち、`src/lib/genre.ts` がジャンルごとのアイコン・アクセント色・カード表現（写真 / グラデーション+アイコン / 文章カード）を一元管理します。
- ビルボード・テーマ・タイムライン・プロフィールのカード右上に**ジャンルバッジ**を表示し、写真っぽい見た目でも「音楽・文章・デジタル等」だと分かるようにしています。
- 写真を使わないジャンル（音楽・文章・デジタル・その他）は、外部画像を増やさず**グラデーション背景＋アイコン＋テキスト**で表現します。

## ビルボード選出ルール（Sensedルール）

`getTodaysBillboardArtworks()` / `getThemeBillboardArtworks()` で実装しています（MVPは `mockData` で疑似実装）。

- 今日の100は **毎日表示されるアーティストが入れ替わる**（今日の日付を seed にする）。
- **ジャンルが偏らないよう、まず各ジャンルから最低1作品ずつ選出**し、残り枠を通常ロジックで埋める。
- 全員が満遍なく露出するよう、**過去の表示回数（`shownCount`）が少ない人を優先**して選ぶ。
- 表示回数が同じ場合は **日付 seed による擬似ランダム**で並べる。
- 作品/ユーザーが **100人以下なら全件表示**（順番だけ毎日変わる）。100人超でも上位 `limit` 件を返せる設計。
- テーマビルボードも、テーマ参加作品から同じルールで毎日選出する。
- DB 接続後は、各関数の中身をサーバ側のクエリに差し替えるだけで移行できます。

## 月間テーマ生成（AI）

ビルボードの「テーマ」は **月1回、AIが抽象的なテーマを生成**します。

- 1ヶ月に1回だけ生成（例：境界 / 余白 / 見えない重力 / まだ名前のない感情 …）。
- **過去テーマと重複・類似しない**ようにする（夏・猫・海などの直接的すぎる語は避ける）。
- **Gemini APIキーがある場合は AI 生成**（`backend` 経由）。
- 失敗時・キー未設定時は **ローカル候補からフォールバック**（`usedAI: false`）。APIキーが無くても落ちません。
- MVP では `backend` のメモリ上に保存（プロセス再起動で消える）。**手動ボタンで生成確認**（`/theme` 画面の「AIで今月のテーマを生成」）。
- 将来的には **Supabase + Cron** で毎月1日に自動生成する予定。

### テーマ API（backend）

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/theme/current` | 現在の月のテーマを返す |
| `POST` | `/theme/generate` | その月のテーマを生成（`{ month, pastThemes }`）。MVPは認証なし |

### モバイル側の接続

`EXPO_PUBLIC_API_URL` が設定され backend が起動していれば、`/`（テーマカード）と `/theme`（タイトル・説明）が `GET /theme/current` の結果を表示します。未設定・失敗時は mock の「境界」を表示し、落ちません。テーマ生成ロジックは `src/lib/themeApi.ts` に集約しています。

## マッチング（Resonance Agent）

`/matching` 画面。**AIは作品を評価しません。** ユーザーのいいね履歴から感性を推定し、ジャンルを越えたクリエイター/作品との出会い（推薦）を作る、という設計を UI で表現しています。

`EXPO_PUBLIC_API_URL` が設定され、`backend/` の FastAPI が起動していれば「再解析する」で実 API（`POST /resonance`）を呼びます。未設定・接続失敗時はモック表示のまま落ちません。

### マッチング解析の「1日1回」ルール

Gemini API の使用量を抑えるため、AI 解析は **1ユーザーにつき1日1回まで**に制限しています。

- MVP ではログイン/DB が無いため、**端末ローカルの AsyncStorage** で制限（保存キー: `senseed:matching:lastAnalysis:current-user`）。
- 今日すでに解析済みなら、「再解析する」を押しても Gemini API は呼ばず、前回結果を表示し「今日のマッチング解析は完了しています。明日また解析できます。」と通知。
- 日付（ローカル `YYYY-MM-DD`）が変われば再度解析可能。
- API 接続失敗時は保存しない（=その日は再試行できる）。backend が `usedAI:false`（Gemini 失敗のフォールバック）を返した場合は HTTP 200 なので保存する。
- 将来 DB 接続後は **Supabase 等で `user_id + date` 単位**で制限する予定。

### backend（AI推薦API）起動

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env に GEMINI_API_KEY を入れる（無くてもOK。未設定なら usedAI:false のモック結果）
uvicorn main:app --reload --port 8000
```

詳細・API 仕様は [backend/README.md](backend/README.md) を参照。

> 🔑 **APIキーの扱い**：`GEMINI_API_KEY` は **`backend/.env` で管理**します。`backend/.env` は `.gitignore` 済みで**コミットされません**。テンプレートの `backend/.env.example`（プレースホルダのみ）だけを追跡します。コードや README に実キーを直接書かないでください。
>
> ```bash
> cd backend
> cp .env.example .env
> # .env を開いて GEMINI_API_KEY=<実際のキー> を入れる
> ```

### Expo を API 接続して起動

```bash
# iOS Simulator（Mac 上の backend を 127.0.0.1 で見る）
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000 npx expo start
```

手順：
1. `backend/` を 8000 で起動（上記）
2. 上のコマンドで Expo を起動 → `i` で iOS Simulator
3. `/matching`（マッチング）タブを開く → 「再解析する」
   - 接続できれば感性プロファイル・共鳴ユーザー・発見カードが API 結果で更新
   - 失敗時は「AIサーバーに接続できないため、モック結果を表示しています」と出し、モックのまま

**Gemini APIキーが無い場合**：backend は `usedAI:false` のモック結果を返し、アプリは落ちません。

**実機スマホの場合**：

```bash
# backend を LAN に公開
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Expo は Mac の LAN IP を指定
EXPO_PUBLIC_API_URL=http://<MacのLAN_IP>:8000 npx expo start
```

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
