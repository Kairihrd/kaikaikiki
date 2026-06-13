"""Resonance Agent (Billdist) — 感性プロファイル生成 + 2種類の推薦"""
from __future__ import annotations
import json, math, os, sys
from typing import Any
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

# --- Models ---

class Artwork(BaseModel):
    title: str; artist: str; year: int | None = None; genre: str
    medium: str | None = None; description: str | None = None
    tags: list[str] = Field(default_factory=list); image_url: str | None = None

class ArtworkKeywords(BaseModel):
    title: str; keywords: list[str]; emotions: list[str]; themes: list[str]

class SensibilityVector(BaseModel):
    keyword_weights: dict[str, float]; top_genres: list[str]; aesthetic_summary: str

class ResonantUser(BaseModel):
    user_id: str; name: str; resonance_score: float
    shared_keywords: list[str]; their_genres: list[str]

class CrossGenreWork(BaseModel):
    title: str; creator: str; genre: str; why_it_resonates: str

class ResonanceResult(BaseModel):
    sensibility_vector: SensibilityVector
    resonant_users: list[ResonantUser]
    cross_genre_works: list[CrossGenreWork]

# --- Mock User DB ---

MOCK_USERS: list[dict[str, Any]] = [
    {"user_id": "u001", "name": "Shinonome_Kairi",
     "keyword_weights": {"melancholy": 0.9, "sublime": 0.8, "nature": 0.7, "transience": 0.8, "solitude": 0.6, "wabi-sabi": 0.9},
     "genres": ["Ukiyo-e", "Photography", "Architecture"]},
    {"user_id": "u002", "name": "Jotaro",
     "keyword_weights": {"power": 0.9, "confrontation": 0.8, "identity": 0.7, "urban": 0.8, "tension": 0.7, "rawness": 0.8},
     "genres": ["Street Art", "Hip-Hop", "Documentary Film"]},
    {"user_id": "u003", "name": "yuki_m",
     "keyword_weights": {"dream": 0.9, "uncanny": 0.8, "subconscious": 0.9, "melancholy": 0.7, "silence": 0.6, "transcendence": 0.7},
     "genres": ["Surrealism", "Electronic Music", "Experimental Film"]},
    {"user_id": "u004", "name": "hana_art",
     "keyword_weights": {"nature": 0.9, "serenity": 0.8, "transience": 0.7, "wabi-sabi": 0.8, "minimalism": 0.9, "fragility": 0.7},
     "genres": ["Ikebana", "Ceramics", "Ambient Music"]},
    {"user_id": "u005", "name": "ren_tokyo",
     "keyword_weights": {"urban": 0.9, "nocturnal": 0.8, "alienation": 0.7, "solitude": 0.8, "tension": 0.6, "sublime": 0.5},
     "genres": ["Neo-Noir Film", "Jazz", "Street Photography"]},
]

# --- STEP 1: キーワード抽出 ---

def extract_keywords_for_artwork(client: genai.Client, artwork: Artwork) -> ArtworkKeywords:
    prompt = f'Title: "{artwork.title}" by {artwork.artist}'
    if artwork.year: prompt += f" ({artwork.year})"
    prompt += f"\nGenre: {artwork.genre}"
    if artwork.medium: prompt += f"\nMedium: {artwork.medium}"
    if artwork.description: prompt += f"\nDescription: {artwork.description}"
    if artwork.tags: prompt += f"\nTags: {', '.join(artwork.tags)}"
    prompt += """

You are an expert art critic.
Extract sensibility keywords, emotions, and themes from this artwork.
Return ONLY valid JSON in this format (no extra text):
{
  "title": "...",
  "keywords": ["...", "..."],
  "emotions": ["...", "..."],
  "themes": ["...", "..."]
}"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    try:
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        data.setdefault("title", artwork.title)
        return ArtworkKeywords.model_validate(data)
    except Exception:
        return ArtworkKeywords(title=artwork.title, keywords=artwork.tags[:5], emotions=[], themes=[])

# --- STEP 2: 感性ベクトル生成 ---

def build_sensibility_vector(kw_results: list[ArtworkKeywords], artworks: list[Artwork]) -> SensibilityVector:
    weights: dict[str, float] = {}
    total = len(kw_results)
    for r in kw_results:
        for term in r.keywords + r.emotions + r.themes:
            k = term.lower().strip()
            weights[k] = weights.get(k, 0.0) + 1.0 / total
    max_w = max(weights.values()) if weights else 1.0
    top = dict(sorted({k: round(v / max_w, 3) for k, v in weights.items()}.items(), key=lambda x: x[1], reverse=True)[:15])
    genres = list({a.genre for a in artworks})
    keys = list(top.keys())[:5]
    return SensibilityVector(
        keyword_weights=top, top_genres=genres,
        aesthetic_summary=f"感性の核: {', '.join(keys[:3])}。接触ジャンル: {', '.join(genres[:3])}。",
    )

# --- STEP 3: 類似ユーザー探索 ---

def cosine_similarity(a: dict[str, float], b: dict[str, float]) -> float:
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0.0) * b.get(k, 0.0) for k in keys)
    na, nb = math.sqrt(sum(v**2 for v in a.values())), math.sqrt(sum(v**2 for v in b.values()))
    return round(dot / (na * nb), 3) if na and nb else 0.0

def find_resonant_users(vector: SensibilityVector, users: list[dict[str, Any]], top_k: int = 3) -> list[ResonantUser]:
    scored = [ResonantUser(
        user_id=u["user_id"], name=u["name"],
        resonance_score=cosine_similarity(vector.keyword_weights, u["keyword_weights"]),
        shared_keywords=[k for k in vector.keyword_weights if k in u["keyword_weights"] and vector.keyword_weights[k] > 0.3][:5],
        their_genres=u["genres"],
    ) for u in users]
    return sorted(scored, key=lambda u: u.resonance_score, reverse=True)[:top_k]

# --- STEP 4: 異ジャンル推薦 ---

def generate_cross_genre_recommendations(client: genai.Client, vector: SensibilityVector, resonant_users: list[ResonantUser]) -> list[CrossGenreWork]:
    candidate_genres = [g for u in resonant_users for g in u.their_genres if g not in vector.top_genres]
    prompt = (f"Sensibility keywords: {', '.join(list(vector.keyword_weights.keys())[:8])}\n"
              f"Known genres: {', '.join(vector.top_genres)}\n"
              f"Candidate new genres: {', '.join(list(dict.fromkeys(candidate_genres))[:6])}\n\n"
              "Recommend 5 works from unknown genres. Explain why each resonates.\n"
              "Return ONLY valid JSON in this format (no extra text):\n"
              '{"works": [{"title": "...","creator": "...","genre": "...","why_it_resonates": "..."}]}')
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )
    try:
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        return [CrossGenreWork.model_validate(w) for w in data.get("works", [])]
    except Exception:
        return []

# --- メインエージェント ---

def run_resonance_agent(artworks: list[Artwork]) -> ResonanceResult:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    print("STEP 1: 各作品から感性キーワードを抽出中...", flush=True)
    kw_results = []
    for a in artworks:
        print(f"  → {a.title}", flush=True)
        kw_results.append(extract_keywords_for_artwork(client, a))

    print("\nSTEP 2: 感性ベクトルを生成中...", flush=True)
    vector = build_sensibility_vector(kw_results, artworks)
    print(f"  → 上位キーワード: {', '.join(list(vector.keyword_weights.keys())[:5])}", flush=True)

    print("\nSTEP 3: 類似ユーザーを探索中...", flush=True)
    resonant_users = find_resonant_users(vector, MOCK_USERS)
    for u in resonant_users:
        print(f"  → {u.name} (共鳴度: {u.resonance_score:.2f})", flush=True)

    print("\nSTEP 4: 異ジャンル推薦を生成中...", flush=True)
    cross_genre_works = generate_cross_genre_recommendations(client, vector, resonant_users)

    return ResonanceResult(sensibility_vector=vector, resonant_users=resonant_users, cross_genre_works=cross_genre_works)

# --- 出力 ---

def print_result(result: ResonanceResult) -> None:
    v = result.sensibility_vector
    print("\n╔" + "═"*58 + "╗")
    print("║" + "  RESONANCE RESULT".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    print("\n▸ 感性ベクトル (上位10)")
    for kw, score in list(v.keyword_weights.items())[:10]:
        print(f"  {kw:<20} {'█'*int(score*20):<20} {score:.2f}")
    print(f"\n▸ 感性サマリー\n  {v.aesthetic_summary}")
    print("\n" + "─"*60)
    print("  ① 共鳴ユーザー推薦  ─  感性が近いクリエイターとの出会い")
    print("─"*60)
    for i, u in enumerate(result.resonant_users, 1):
        print(f"\n  {i}. @{u.name}  (共鳴度: {u.resonance_score:.2f})")
        print(f"     共有キーワード: {', '.join(u.shared_keywords)}")
        print(f"     得意ジャンル:   {', '.join(u.their_genres)}")
    print("\n" + "─"*60)
    print("  ② 異ジャンル発見推薦  ─  感性が共鳴する新しい出会い")
    print("─"*60)
    for i, w in enumerate(result.cross_genre_works, 1):
        print(f"\n  {i}. 『{w.title}』 — {w.creator}  ({w.genre})")
        print(f"     {w.why_it_resonates}")
    print("\n" + "═"*60)

# --- サンプルデータ ---

LIKED_ARTWORKS: list[dict[str, Any]] = [
    {"title": "Wheatfield with Crows", "artist": "Vincent van Gogh", "year": 1890,
     "genre": "Post-Impressionism", "medium": "Oil on canvas",
     "description": "Dark turbulent sky over a golden wheatfield, ominous crows in flight.",
     "tags": ["melancholy", "turbulence", "nature", "foreboding"]},
    {"title": "The Great Wave off Kanagawa", "artist": "Katsushika Hokusai", "year": 1831,
     "genre": "Ukiyo-e", "medium": "Woodblock print",
     "description": "A towering wave about to crash over boats, Mt. Fuji in the distance.",
     "tags": ["sublime", "nature", "power", "fragility", "transience"]},
    {"title": "Nighthawks", "artist": "Edward Hopper", "year": 1942,
     "genre": "American Realism", "medium": "Oil on canvas",
     "description": "Late-night diner scene, figures isolated in fluorescent light.",
     "tags": ["solitude", "urban", "alienation", "silence", "nocturnal"]},
    {"title": "The Persistence of Memory", "artist": "Salvador Dalí", "year": 1931,
     "genre": "Surrealism", "medium": "Oil on canvas",
     "description": "Melting clocks draped over a barren landscape.",
     "tags": ["time", "dream", "melting", "uncanny", "subconscious"]},
    {"title": "Untitled (Your body is a battleground)", "artist": "Barbara Kruger", "year": 1989,
     "genre": "Conceptual Art", "medium": "Photographic silkscreen",
     "description": "Split-image portrait overlaid with stark typographic text.",
     "tags": ["feminism", "power", "identity", "confrontation", "text-image"]},
]

if __name__ == "__main__":
    artworks = [Artwork(**a) for a in LIKED_ARTWORKS]
    result = run_resonance_agent(artworks)
    print_result(result)
    if "--json" in sys.argv:
        print("\n--- Raw JSON ---")
        print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))