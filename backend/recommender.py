import os
import httpx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

TMDB_TOKEN = os.getenv("TMDB_TOKEN")
TMDB_BASE = "https://api.themoviedb.org/3"


class Recommender:
    def __init__(self):
        self.movies: list[dict] = []
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))

    async def build_index(self):
        headers = {"Authorization": f"Bearer {TMDB_TOKEN}"}
        collected: list[dict] = []

        async with httpx.AsyncClient(timeout=15) as client:
            for endpoint in ["popular", "top_rated", "now_playing"]:
                for page in range(1, 6):
                    try:
                        r = await client.get(
                            f"{TMDB_BASE}/movie/{endpoint}",
                            headers=headers,
                            params={"language": "en-US", "page": page},
                        )
                        if r.status_code == 200:
                            collected.extend(r.json().get("results", []))
                    except Exception:
                        pass

        # Deduplicate by movie id
        seen: set[int] = set()
        for m in collected:
            if m["id"] not in seen:
                seen.add(m["id"])
                self.movies.append(m)

        # Build TF-IDF corpus: title (weighted 3x) + year + overview
        corpus = []
        for m in self.movies:
            title = m.get("title", "")
            overview = m.get("overview", "")
            year = (m.get("release_date") or "")[:4]
            # Repeat title to boost its weight in similarity scoring
            corpus.append(f"{title} {title} {title} {year} {overview}")

        if corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        if self.movies:
            print(f"[Recommender] Index built with {len(self.movies)} movies.")
        else:
            print("[Recommender] Could not reach TMDB — search will use TMDB directly from the browser.")

    def search(self, query: str, top_n: int = 10) -> list[dict]:
        if self.tfidf_matrix is None or not query.strip():
            return []
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_idx = np.argsort(sims)[::-1][:top_n]
        return [self.movies[i] for i in top_idx if sims[i] > 0]
