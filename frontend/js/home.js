import { renderNavbar, buildCarousel, goToMovie, omdbSearch, omdbDetail } from './app.js';

// OMDb doesn't have "now playing" etc — we simulate categories with curated searches
const CATEGORIES = [
  { title: 'Action Blockbusters',    query: 'action' },
  { title: 'Sci-Fi Adventures',      query: 'space' },
  { title: 'Comedy Hits',            query: 'comedy' },
  { title: 'Thriller & Mystery',     query: 'thriller' },
  { title: 'Animated Favorites',     query: 'animation' },
];

// Curated hero movies (well-known, guaranteed to have good posters)
const HERO_IDS = [
  'tt1375666', // Inception
  'tt0468569', // The Dark Knight
  'tt0816692', // Interstellar
  'tt4154796', // Avengers: Endgame
  'tt0133093', // The Matrix
  'tt1856101', // Blade Runner 2049
  'tt0120737', // Lord of the Rings
];

async function loadHero() {
  const heroEl = document.getElementById('hero');
  try {
    const id = HERO_IDS[Math.floor(Math.random() * HERO_IDS.length)];
    const movie = await omdbDetail(id);
    if (movie.Response === 'False') { heroEl.style.display = 'none'; return; }

    const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster.replace('SX300', 'SX1200') : '';

    heroEl.innerHTML = `
      <div class="hero-bg" style="background-image:url('${poster}')"></div>
      <div class="hero-content">
        <h1 class="hero-title">${movie.Title}</h1>
        <p class="hero-overview">${movie.Plot || ''}</p>
        <div class="hero-meta">
          ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `<span class="hero-rating">&#9733; ${movie.imdbRating}</span>` : ''}
          <span class="hero-year">${movie.Year || ''}</span>
          ${movie.Runtime && movie.Runtime !== 'N/A' ? `<span class="hero-runtime">${movie.Runtime}</span>` : ''}
        </div>
        <div class="hero-actions">
          <button class="btn btn-red" id="hero-info">More Info</button>
        </div>
      </div>`;

    document.getElementById('hero-info').addEventListener('click', () => goToMovie(movie.imdbID));
  } catch (e) {
    heroEl.style.display = 'none';
  }
}

async function loadCarousel(query, title, sectionId) {
  const section = document.getElementById(sectionId);
  try {
    const movies = await omdbSearch(query);
    if (movies.length) buildCarousel(title, movies, section);
    else section.style.display = 'none';
  } catch {
    section.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  loadHero();

  // Create section elements for each category
  const main = document.querySelector('main');
  CATEGORIES.forEach((cat, i) => {
    const sectionId = `sec-${i}`;
    let section = document.getElementById(sectionId);
    if (!section) {
      section = document.createElement('div');
      section.className = 'section';
      section.id = sectionId;
      section.innerHTML = '<div class="spinner"></div>';
      main.appendChild(section);
    }
    loadCarousel(cat.query, cat.title, sectionId);
  });
});
