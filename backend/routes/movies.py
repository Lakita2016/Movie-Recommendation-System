import os
import httpx
from fastapi import APIRouter, Query, HTTPException

TMDB_TOKEN = os.getenv("TMDB_TOKEN")
TMDB_BASE = "https://api.themoviedb.org/3"
router = APIRouter()


def _headers() -> dict:
    return {"Authorization": f"Bearer {TMDB_TOKEN}"}


async def _get(url: str, params: dict = None) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, headers=_headers(), params=params or {})
        if r.status_code != 200:
            raise HTTPException(r.status_code, "TMDB request failed")
        return r.json()


@router.get("/now-playing")
async def now_playing():
    return await _get(f"{TMDB_BASE}/movie/now_playing", {"language": "en-US", "page": 1})


@router.get("/popular")
async def popular():
    return await _get(f"{TMDB_BASE}/movie/popular", {"language": "en-US", "page": 1})


@router.get("/top-rated")
async def top_rated():
    return await _get(f"{TMDB_BASE}/movie/top_rated", {"language": "en-US", "page": 1})


@router.get("/upcoming")
async def upcoming():
    return await _get(f"{TMDB_BASE}/movie/upcoming", {"language": "en-US", "page": 1})


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    return await _get(f"{TMDB_BASE}/search/movie", {"query": q, "language": "en-US", "page": 1})


@router.get("/{movie_id}")
async def movie_detail(movie_id: int):
    return await _get(
        f"{TMDB_BASE}/movie/{movie_id}",
        {"language": "en-US", "append_to_response": "credits,videos,similar"},
    )
