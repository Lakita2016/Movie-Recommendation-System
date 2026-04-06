/* ── Shared utilities used by all pages ───────────────────── */

const API = '';  // same origin

// ── Token management ─────────────────────────────────────────
export function getToken()          { return localStorage.getItem('cineai_token'); }
export function setToken(t)         { localStorage.setItem('cineai_token', t); }
export function removeToken()       { localStorage.removeItem('cineai_token');
                                      localStorage.removeItem('cineai_user'); }
export function getUser()           { try { return JSON.parse(localStorage.getItem('cineai_user')); } catch { return null; } }
export function setUser(u)          { localStorage.setItem('cineai_user', JSON.stringify(u)); }

// ── Fetch helper (our backend) ────────────────────────────────
export async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// ── OMDb API ──────────────────────────────────────────────────
const OMDB_KEY = 'trilogy';
const OMDB_BASE = 'https://www.omdbapi.com/';

export async function omdbSearch(query, page = 1) {
  const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.Response === 'False') return [];
  return data.Search || [];
}

export async function omdbDetail(imdbId) {
  const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&i=${encodeURIComponent(imdbId)}&plot=full`;
  const res = await fetch(url);
  return res.json();
}

// ── Toast ────────────────────────────────────────────────────
export function toast(msg, type = 'error') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Navbar ───────────────────────────────────────────────────
export function renderNavbar(containerId = 'navbar') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const user = getUser();
  const initials = user ? user.username.slice(0, 2).toUpperCase() : '';

  el.innerHTML = `
    <a class="nav-logo" href="/">CineAI</a>
    <nav class="nav-links">
      <a href="/">Home</a>
      <a href="/recommend.html">AI Picks</a>
    </nav>
    <div class="nav-right">
      <div class="nav-search-wrap">
        <span class="search-icon">&#128269;</span>
        <input type="text" id="nav-search" placeholder="Search movies…" />
      </div>
      ${user
        ? `<div class="avatar" tabindex="0">
             ${initials}
             <div class="avatar-menu">
               <span style="padding:.4rem 1rem;font-size:.78rem;color:#999;">${user.username}</span>
               <button id="logout-btn">Sign Out</button>
             </div>
           </div>`
        : `<a href="/signin.html" class="btn btn-outline" style="padding:.4rem .9rem;font-size:.85rem;">Sign In</a>
           <a href="/signup.html" class="btn btn-red" style="padding:.4rem .9rem;font-size:.85rem;">Sign Up</a>`
      }
    </div>
  `;

  window.addEventListener('scroll', () => {
    el.classList.toggle('scrolled', window.scrollY > 60);
  });

  document.getElementById('nav-search')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      window.location.href = `/recommend.html?q=${encodeURIComponent(e.target.value.trim())}`;
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    removeToken();
    window.location.href = '/';
  });
}

// ── Movie card HTML (OMDb format) ─────────────────────────────
export function movieCardHTML(movie) {
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '';
  const img = poster
    ? `<img src="${poster}" alt="${movie.Title}" loading="lazy" />`
    : `<div class="no-poster">${movie.Title || 'No Image'}</div>`;
  return `
    <div class="card" data-id="${movie.imdbID}">
      ${img}
      <div class="card-info">
        <div class="card-title">${movie.Title || ''}</div>
        <div class="card-year">${movie.Year || ''}</div>
      </div>
    </div>`;
}

// ── Navigate to movie page ────────────────────────────────────
export function goToMovie(id) {
  window.location.href = `/movie.html?id=${id}`;
}

// ── Attach click handlers to cards in a container ────────────
export function bindCardClicks(container) {
  container.addEventListener('click', e => {
    const card = e.target.closest('[data-id]');
    if (card) goToMovie(card.dataset.id);
  });
}

// ── Build a carousel section ─────────────────────────────────
export function buildCarousel(title, movies, sectionEl) {
  const id = 'c-' + Math.random().toString(36).slice(2);
  sectionEl.innerHTML = `
    <div class="section-title">${title}</div>
    <div class="carousel-wrap">
      <button class="carousel-btn prev" data-target="${id}">&#8249;</button>
      <div class="carousel" id="${id}">
        ${movies.map(movieCardHTML).join('')}
      </div>
      <button class="carousel-btn next" data-target="${id}">&#8250;</button>
    </div>`;

  bindCardClicks(sectionEl);

  sectionEl.querySelector('.prev').addEventListener('click', () => {
    document.getElementById(id).scrollBy({ left: -600, behavior: 'smooth' });
  });
  sectionEl.querySelector('.next').addEventListener('click', () => {
    document.getElementById(id).scrollBy({ left: 600, behavior: 'smooth' });
  });
}
