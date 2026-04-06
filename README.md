# CineAI - Movie Discovery App with Lexical Search

A Netflix-style movie discovery web application built with **Python (FastAPI)** on the backend and **vanilla HTML, CSS, JavaScript** on the frontend. It features user authentication, movie browsing with horizontal carousels, detailed movie pages, and a **lexical search** system for finding movies by natural-language descriptions.

---

## Features

- **Netflix-style UI** - Dark theme with hero banner, horizontal scrolling carousels, hover effects, and responsive design
- **Movie Browsing** - Categorized carousels (Action, Sci-Fi, Comedy, Thriller, Animated) powered by OMDb API
- **Movie Detail Page** - Full info including plot, director, cast, ratings (IMDb, Rotten Tomatoes, Metacritic), box office, awards, and "You Might Also Like" section
- **Lexical Search / AI Picks** - Search movies using natural-language queries like "dark thriller" or "sci-fi adventure"
- **User Authentication** - Signup, login, logout with JWT tokens and bcrypt password hashing
- **Responsive** - Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | **Python 3.13 + FastAPI** |
| Database | **SQLite** (via SQLAlchemy ORM) |
| Authentication | **JWT** (python-jose) + **bcrypt** |
| Movie Data | **OMDb API** (The Open Movie Database) |
| Frontend | **Vanilla HTML + CSS + JavaScript** (ES Modules) |
| Styling | Custom CSS (Netflix dark theme, no frameworks) |

---

## How Lexical Search Works

The search/recommendation feature uses **lexical search** — matching user queries against movie titles and metadata via keyword matching.

### Flow

```
User types: "dark thriller"
        |
        v
Frontend sends query to OMDb Search API
        |
        v
OMDb performs keyword-based text search
across its database of movie titles
        |
        v
Returns matching movies with posters,
titles, years, and IMDb IDs
        |
        v
User clicks a result -> full detail page
with plot, cast, ratings, similar movies
```

### What is Lexical Search?

Lexical search (also called keyword search) matches documents based on the **exact or partial overlap of words** between the query and the indexed text. Unlike semantic search (which understands meaning), lexical search works by:

1. **Tokenization** - Breaking the query ("dark thriller") into individual terms: `["dark", "thriller"]`
2. **Index Lookup** - Searching an inverted index for documents containing those terms
3. **Ranking** - Scoring results by how well they match (term frequency, field weights, etc.)

This is the same approach used by traditional search engines. It's fast, requires no ML models, and works well for movie discovery where users often search by genre, mood, or descriptive keywords.

### Why Lexical Over Semantic?

| Aspect | Lexical Search | Semantic Search |
|---|---|---|
| Speed | Very fast | Slower (needs embedding computation) |
| Dependencies | None (API handles it) | Requires ML model (e.g., TF-IDF, BERT) |
| Setup | Zero config | Needs index building, vector store |
| Good for | Known genres, titles, keywords | Abstract queries ("movies that make you think") |
| Used here | OMDb keyword search | Not used (but could be added with scikit-learn TF-IDF) |

---

## Project Structure

```
CineAI/
├── backend/
│   ├── main.py                 # FastAPI app - serves API + static files
│   ├── models.py               # SQLAlchemy User model + SQLite setup
│   ├── auth_utils.py           # JWT token creation/verification + bcrypt
│   ├── recommender.py          # (Reserved for future TF-IDF recommender)
│   └── routes/
│       ├── auth.py             # POST /api/auth/signup, login, GET /me
│       ├── movies.py           # TMDB proxy routes (unused - OMDb used client-side)
│       └── recommend.py        # (Reserved for future server-side search)
├── frontend/
│   ├── index.html              # Homepage - hero + carousels
│   ├── movie.html              # Movie detail page
│   ├── signin.html             # Login page
│   ├── signup.html             # Registration page
│   ├── recommend.html          # Search/AI Picks page
│   ├── css/
│   │   └── style.css           # Full Netflix-dark theme
│   └── js/
│       ├── app.js              # Shared: auth, OMDb API, navbar, card builder
│       ├── home.js             # Homepage: hero + category carousels
│       ├── movie.js            # Movie detail: full info + similar movies
│       ├── recommend.js        # Search page: query + results grid
│       └── auth.js             # Signup/signin form handlers
├── .env                        # Environment variables (JWT secret, TMDB token)
├── .env.example                # Template for .env
├── requirements.txt            # Python dependencies
├── start.bat                   # Windows startup script
└── README.md                   # This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account (username, email, password) |
| `POST` | `/api/auth/login` | Login (email, password) → JWT token |
| `GET` | `/api/auth/me` | Get current user (requires Bearer token) |

Movie data is fetched **client-side** directly from the OMDb API — no server proxy needed.

---

## Running Instructions

### Prerequisites

- **Python 3.10+** installed
- **pip** (comes with Python)
- Internet connection (for OMDb API)

### Setup

1. **Clone or navigate to the project folder**

   ```bash
   cd C:\CineAI
   ```

2. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   The `.env` file is pre-configured. To customize, edit `C:\CineAI\.env`:

   ```env
   JWT_SECRET=your-secret-key-here
   ```

4. **Start the server**

   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

5. **Open the app**

   Navigate to [http://localhost:8000](http://localhost:8000) in your browser.

### Quick Start (Windows)

```bash
cd C:\CineAI
start.bat
```

---

## Pages

| Page | URL | Description |
|---|---|---|
| Home | `/` | Hero banner + 5 movie carousels |
| Movie Detail | `/movie.html?id=tt0372784` | Full movie info (pass IMDb ID) |
| AI Picks | `/recommend.html` | Lexical search with suggestion chips |
| Sign In | `/signin.html` | Login form |
| Sign Up | `/signup.html` | Registration form |

---

## Architecture Decisions

- **OMDb over TMDB** - OMDb API was chosen for reliable network accessibility. TMDB can be swapped in by updating `app.js`.
- **Client-side movie fetching** - Movie data is fetched directly from OMDb in the browser, keeping the Python backend lightweight (auth only).
- **SQLite** - Zero-config database, perfect for development. Can be swapped with PostgreSQL for production.
- **No frontend framework** - Vanilla JS with ES Modules keeps the project simple and dependency-free on the frontend.
- **JWT in localStorage** - Simple token-based auth without cookies. Tokens expire after 7 days.
