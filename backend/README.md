# senseed backend — Resonance API

`/matching` 画面のための AI 推薦 API と、月間ビルボードテーマの生成 API。**GEMINI_API_KEY が無くても動作します**（未設定時は `usedAI:false` のモック/ローカル結果を返す）。

## 構成

- `main.py` — FastAPI サーバー（`/health`, `/resonance`, `/theme/current`, `/theme/generate`）
- `aiAgent.py` — Resonance Agent のロジック（スタンドアロン CLI としても実行可）
- `requirements.txt` — 依存
- `.env.example` — 環境変数のサンプル

## 起動方法

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env に GEMINI_API_KEY を入れる（無くてもOK。その場合はモック結果）
uvicorn main:app --reload --port 8000
```

実機スマホからアクセスする場合は host を公開する:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## エンドポイント

### GET /health

```json
{ "ok": true }
```

### POST /resonance

入力:

```json
{
  "likedArtworks": [
    { "id": "1", "title": "静寂の入口", "genre": "写真", "description": "...", "tags": ["#写真", "#光と影"] }
  ]
}
```

出力:

```json
{
  "profile": [
    { "label": "静寂", "score": 93 },
    { "label": "余白", "score": 87 },
    { "label": "孤独", "score": 72 },
    { "label": "光", "score": 65 }
  ],
  "matches": [
    { "id": "u001", "name": "カナタ", "genre": "写真", "resonance": 93, "reason": "静けさと余白への感性が近いです。" }
  ],
  "discoveries": [
    { "title": "映像作家 × 音楽", "description": "普段は写真を見ていますが、音楽や映像にも近い感性があります。" }
  ],
  "usedAI": true
}
```

### GET /theme/current

現在の月のテーマを返す。

```json
{
  "month": "2026-06",
  "theme": {
    "id": "theme-2026-06",
    "title": "境界",
    "description": "境界線を越える / 境界を感じる作品",
    "generatedByAI": true,
    "generatedAt": "2026-06-01T00:00:00Z"
  }
}
```

### POST /theme/generate

その月のテーマを生成する（MVPは認証なし・管理者操作想定）。

入力:

```json
{ "month": "2026-06", "pastThemes": ["境界", "余白", "反射"] }
```

出力:

```json
{
  "theme": {
    "id": "theme-2026-06",
    "title": "見えない重力",
    "description": "引き寄せられる感覚、離れられない関係、目に見えない力を表現する作品",
    "generatedByAI": true,
    "generatedAt": "..."
  },
  "usedAI": true
}
```

- `GEMINI_API_KEY` があれば Gemini で抽象テーマを1つ生成（`usedAI: true`）。
- 無い/失敗時はローカル候補から **過去テーマ（`pastThemes`）と重複・類似しない**ものを返す（`usedAI: false`）。
- 生成結果は月単位でメモリ保存（MVP）。将来 Supabase + Cron で毎月1日に自動生成予定。

## 挙動（Gemini APIキー）

- **GEMINI_API_KEY あり**: Gemini（既定 `gemini-2.5-flash`、`GEMINI_MODEL` で変更可）で推定 → `usedAI: true`。
  - Gemini 呼び出しが失敗（キー不正・ネットワーク・パース失敗）しても落ちず、自動でモックにフォールバック。
- **GEMINI_API_KEY なし**: いいね履歴のタグ/説明から**ローカル計算**で感性プロファイルを作り、モックの共鳴相手/発見を返す → `usedAI: false`。

## 動作確認

```bash
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/resonance \
  -H "Content-Type: application/json" \
  -d '{"likedArtworks":[{"id":"1","title":"静寂の入口","genre":"写真","description":"光の先","tags":["#光と影"]}]}'
```

## スタンドアロン CLI（任意）

```bash
python3 aiAgent.py          # サンプル作品で Resonance Agent を実行（GEMINI_API_KEY 必須）
python3 aiAgent.py --json   # 生 JSON も出力
```
