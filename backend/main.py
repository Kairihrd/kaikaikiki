"""senseed Resonance API — FastAPI wrapper around the resonance agent.

GEMINI_API_KEY があれば Gemini を使い、無ければローカル計算/モックでフォールバックする。
デモ中に API キーやネットワークで壊れないよう、Gemini 失敗時も必ずモック結果を返す。

起動:
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

# モデルIDは環境変数で上書き可。既定は現在利用可能な安定 Flash 版 gemini-2.5-flash。
# (gemini-2.0-flash は提供終了、gemini-3.5-flash は当初の不確かな値だったため変更)
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

app = FastAPI(title="senseed Resonance API")

# Expo / ブラウザからのローカル開発アクセスを許可(MVP用に全許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 入出力モデル -----------------------------------------------------------


class LikedArtwork(BaseModel):
    id: str = ""
    title: str = ""
    genre: str = ""
    description: str = ""
    tags: list[str] = Field(default_factory=list)


class ResonanceRequest(BaseModel):
    likedArtworks: list[LikedArtwork] = Field(default_factory=list)


class ProfileTrait(BaseModel):
    label: str
    score: int


class Match(BaseModel):
    id: str
    name: str
    genre: str
    resonance: int
    reason: str


class Discovery(BaseModel):
    title: str
    description: str


class ResonanceResponse(BaseModel):
    profile: list[ProfileTrait]
    matches: list[Match]
    discoveries: list[Discovery]
    usedAI: bool


# --- モック / フォールバック ------------------------------------------------

# 感性ラベルと、それを示唆するキーワード(日英)。いいね履歴から頻度で加点する。
_SENSE_HINTS: dict[str, tuple[int, list[str]]] = {
    "静寂": (60, ["静", "沈黙", "無音", "しずか", "quiet", "silence", "calm"]),
    "余白": (55, ["余白", "空", "間", "white", "minimal", "space"]),
    "孤独": (50, ["孤", "ひとり", "独", "solitude", "alone", "isolation"]),
    "光": (48, ["光", "ひかり", "陰影", "光と影", "light", "shadow"]),
    "境界": (45, ["境界", "輪郭", "際", "border", "boundary", "edge"]),
    "余韻": (42, ["余韻", "残響", "echo", "reverb", "trace"]),
}

_MOCK_MATCHES = [
    Match(id="u001", name="カナタ", genre="写真", resonance=93,
          reason="静けさと余白への感性が近いです。"),
    Match(id="u002", name="ミナ", genre="映像", resonance=88,
          reason="時間の“余白”の使い方にあなたの感性と共通点があります。"),
    Match(id="u003", name="ソウ", genre="音楽", resonance=82,
          reason="アンビエントの“間”の取り方が、あなたの好む静寂と響き合います。"),
    Match(id="u004", name="シオン", genre="彫刻", resonance=76,
          reason="光と孤独への反応傾向から、未接触ジャンルとして提案します。"),
]

_MOCK_DISCOVERIES = [
    Discovery(title="映像作家 × 音楽",
              description="普段は写真を見ていますが、音楽や映像にも近い感性があります。ジャンルの外側に響き合う表現が見つかりました。"),
]


def build_mock(req: ResonanceRequest) -> ResonanceResponse:
    """API キーが無い/失敗した場合のローカル計算+モック結果。"""
    text = " ".join(
        f"{a.title} {a.description} {' '.join(a.tags)} {a.genre}"
        for a in req.likedArtworks
    )
    traits: list[ProfileTrait] = []
    for label, (base, hints) in _SENSE_HINTS.items():
        bonus = sum(8 for kw in hints if kw in text)
        traits.append(ProfileTrait(label=label, score=min(99, base + bonus)))
    traits.sort(key=lambda t: t.score, reverse=True)
    return ResonanceResponse(
        profile=traits[:4],
        matches=_MOCK_MATCHES,
        discoveries=_MOCK_DISCOVERIES,
        usedAI=False,
    )


# --- Gemini パス ------------------------------------------------------------


def try_gemini(req: ResonanceRequest) -> Optional[ResonanceResponse]:
    """GEMINI_API_KEY がある場合のみ実行。失敗時は None を返し、呼び出し側がモックへフォールバック。"""
    try:
        from google import genai  # 遅延 import(未インストールでもモックは動く)

        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        liked = "\n".join(
            f"- {a.title}（{a.genre}）: {a.description} tags={','.join(a.tags)}"
            for a in req.likedArtworks
        ) or "(履歴なし)"

        prompt = (
            "あなたはアート推薦エージェントです。作品の良し悪しは評価しません。"
            "ユーザーのいいね履歴から感性プロファイルを推定し、ジャンルを越えて"
            "共鳴するクリエイターと、新しい発見を日本語で提案してください。\n\n"
            f"いいねした作品:\n{liked}\n\n"
            "次の JSON だけを厳密に返してください(余計な文章やコードフェンス以外の説明は禁止):\n"
            '{"profile":[{"label":"静寂","score":93}],'
            '"matches":[{"id":"u001","name":"カナタ","genre":"写真","resonance":93,"reason":"..."}],'
            '"discoveries":[{"title":"映像作家 × 音楽","description":"..."}]}'
        )
        resp = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        text = (resp.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())

        return ResonanceResponse(
            profile=[ProfileTrait(label=str(p["label"]), score=int(round(float(p["score"]))))
                     for p in data["profile"]][:6],
            matches=[Match(id=str(m.get("id", f"u{i}")), name=str(m["name"]),
                           genre=str(m.get("genre", "")), resonance=int(round(float(m["resonance"]))),
                           reason=str(m.get("reason", "")))
                     for i, m in enumerate(data["matches"], 1)][:6],
            discoveries=[Discovery(title=str(d["title"]), description=str(d.get("description", "")))
                         for d in data.get("discoveries", [])][:4],
            usedAI=True,
        )
    except Exception as e:  # API キー不正・ネットワーク・パース失敗など全て握る
        print(f"[resonance] Gemini fallback to mock: {e}", flush=True)
        return None


# --- エンドポイント ---------------------------------------------------------


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/resonance", response_model=ResonanceResponse)
def resonance(req: ResonanceRequest) -> ResonanceResponse:
    if os.environ.get("GEMINI_API_KEY"):
        ai = try_gemini(req)
        if ai is not None:
            return ai
    return build_mock(req)


# ============================================================================
# 月間ビルボードテーマの生成
# ----------------------------------------------------------------------------
# 1ヶ月に1回、AIが抽象的なテーマを生成する。過去テーマと重複/類似しないようにする。
# GEMINI_API_KEY があれば Gemini、無ければローカル候補からフォールバック(usedAI:false)。
# MVP ではメモリ上に保存(プロセス再起動で消える)。将来 Supabase + Cron に移行予定。
# ============================================================================


class ThemeObject(BaseModel):
    id: str
    title: str
    description: str
    generatedByAI: bool
    generatedAt: str


class ThemeCurrentResponse(BaseModel):
    month: str
    theme: ThemeObject


class ThemeGenerateRequest(BaseModel):
    month: Optional[str] = None
    pastThemes: list[str] = Field(default_factory=list)


class ThemeGenerateResponse(BaseModel):
    theme: ThemeObject
    usedAI: bool


# 抽象テーマのローカル候補(タイトル, 説明)。直接的な物体名は避けている。
_LOCAL_THEMES: list[tuple[str, str]] = [
    ("境界", "境界線を越える / 境界を感じる作品"),
    ("余白", "語らないことで語る、余白と間を生かした作品"),
    ("反射", "光・水・鏡・他者の中に映り込む自分を捉えた作品"),
    ("記憶の輪郭", "曖昧になっていく記憶の形を呼び起こす作品"),
    ("見えない重力", "引き寄せられる感覚、離れられない関係、目に見えない力を表現する作品"),
    ("夜明け前", "一番暗い時間に差し込む、わずかな兆しを描く作品"),
    ("ノイズの中の静けさ", "騒がしさのただ中で見つける、静けさや祈りを表現する作品"),
    ("触れられない距離", "近いのに届かない、心理的な距離を描く作品"),
    ("まだ名前のない感情", "言葉にできない、名前のつかない感情をかたちにする作品"),
    ("揺らぎ", "確かさと不確かさのあいだで揺れる瞬間を捉えた作品"),
    ("透過", "光や時間が通り抜けていく、透けるものを描く作品"),
    ("残響", "消えたあとに残る、余韻や気配を表現する作品"),
]

# 月("YYYY-MM") -> ThemeObject のメモリ保存。
_THEME_STORE: dict[str, ThemeObject] = {}

# 未生成時のデフォルト(アプリ側 mock と揃える)。
_DEFAULT_THEME_TITLE = "境界"
_DEFAULT_THEME_DESC = "境界線を越える / 境界を感じる作品"


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _current_month() -> str:
    return datetime.now().strftime("%Y-%m")


def _is_too_similar(title: str, past: list[str]) -> bool:
    """過去テーマと同一/部分一致(似すぎ)なら True。"""
    t = title.strip()
    if not t:
        return True
    for p in past:
        p = p.strip()
        if not p:
            continue
        if t == p or t in p or p in t:
            return True
    return False


def _local_theme(month: str, past: list[str]) -> ThemeObject:
    """ローカル候補から、過去テーマと被らない最初のものを選ぶ(月で開始位置を変える)。"""
    n = len(_LOCAL_THEMES)
    start = sum(ord(c) for c in month) % n
    for k in range(n):
        title, desc = _LOCAL_THEMES[(start + k) % n]
        if not _is_too_similar(title, past):
            return ThemeObject(
                id=f"theme-{month}", title=title, description=desc,
                generatedByAI=False, generatedAt=_now_iso(),
            )
    # 全候補が過去と被る場合は先頭にフォールバック。
    title, desc = _LOCAL_THEMES[0]
    return ThemeObject(
        id=f"theme-{month}", title=title, description=desc,
        generatedByAI=False, generatedAt=_now_iso(),
    )


def _try_theme_gemini(month: str, past: list[str]) -> Optional[ThemeObject]:
    """GEMINI_API_KEY がある場合のみ実行。失敗/過去と類似なら None でローカルへフォールバック。"""
    try:
        from google import genai  # 遅延 import(未インストールでもローカルは動く)

        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        past_str = "、".join(p for p in past if p.strip()) or "(なし)"
        prompt = (
            "あなたは senseed の月間ビルボードテーマを1つ生成するエージェントです。\n"
            "無名クリエイターが写真・映像・音楽・イラスト・建築・ファッション・詩など、"
            "ジャンルを越えて参加できる抽象的なテーマを作ってください。\n\n"
            "条件:\n"
            "- 日本語で短いタイトル(2〜8文字程度が理想。『まだ名前のない感情』のような少し長いものも可)\n"
            "- 直接的な物体名(夏・猫・海・東京など)は避け、"
            "感覚・関係・状態・時間・距離・余白・変化を想起させる\n"
            "- 過去テーマと被らない、似すぎない\n"
            "- 説明文は1文で、作品投稿の方向性がわかるようにする\n"
            f"- 過去テーマ: {past_str}\n\n"
            "次の JSON だけを厳密に返してください(コードフェンスや説明文は禁止):\n"
            '{"title":"...","description":"..."}'
        )
        resp = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        text = (resp.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        title = str(data["title"]).strip()
        desc = str(data.get("description", "")).strip()
        if _is_too_similar(title, past):
            return None
        return ThemeObject(
            id=f"theme-{month}", title=title, description=desc,
            generatedByAI=True, generatedAt=_now_iso(),
        )
    except Exception as e:  # キー不正・ネットワーク・パース失敗など全て握る
        print(f"[theme] Gemini fallback to local: {e}", flush=True)
        return None


@app.get("/theme/current", response_model=ThemeCurrentResponse)
def theme_current() -> ThemeCurrentResponse:
    month = _current_month()
    theme = _THEME_STORE.get(month)
    if theme is None:
        # 未生成ならデフォルト(境界)を返す。
        theme = ThemeObject(
            id=f"theme-{month}", title=_DEFAULT_THEME_TITLE,
            description=_DEFAULT_THEME_DESC, generatedByAI=False,
            generatedAt=_now_iso(),
        )
    return ThemeCurrentResponse(month=month, theme=theme)


@app.post("/theme/generate", response_model=ThemeGenerateResponse)
def theme_generate(req: ThemeGenerateRequest) -> ThemeGenerateResponse:
    month = req.month or _current_month()
    past = list(req.pastThemes)

    theme: Optional[ThemeObject] = None
    used_ai = False
    if os.environ.get("GEMINI_API_KEY"):
        theme = _try_theme_gemini(month, past)
        used_ai = theme is not None
    if theme is None:
        theme = _local_theme(month, past)

    _THEME_STORE[month] = theme  # メモリ保存(MVP)
    return ThemeGenerateResponse(theme=theme, usedAI=used_ai)
