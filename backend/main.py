import os
import sys
from contextlib import asynccontextmanager

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _BASE_DIR)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(_BASE_DIR, "..", ".env"))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.types import Scope


class NoCacheStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Scope):
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        return response

from routes.auth import router as auth_router
from routes.movies import router as movies_router
from routes.recommend import router as recommend_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # Nothing to init server-side — search runs client-side via TMDB


app = FastAPI(title="CineAI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,  prefix="/api/auth",    tags=["auth"])
app.include_router(movies_router, prefix="/api/movies", tags=["movies"])
app.include_router(recommend_router, prefix="/api",     tags=["recommend"])

# Silence Chrome DevTools probe
@app.get("/.well-known/appspecific/com.chrome.devtools.json", include_in_schema=False)
async def chrome_devtools():
    return JSONResponse([])

# Mount frontend LAST
FRONTEND_DIR = os.path.join(_BASE_DIR, "..", "frontend")
app.mount("/", NoCacheStaticFiles(directory=FRONTEND_DIR, html=True), name="static")
