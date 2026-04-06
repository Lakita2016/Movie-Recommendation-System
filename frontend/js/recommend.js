import { renderNavbar, goToMovie, toast, omdbSearch } from './app.js';

const SUGGESTIONS = [
  'dark thriller',
  'comedy romance',
  'sci-fi adventure',
  'war drama',
  'superhero',
  'horror ghost',
  'animated family',
  'heist crime',
];

function renderResults(movies) {
  const grid = document.getElementById('results-grid');
  if (!movies.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <p>No matches found. Try a different description.</p>
    </div>`;
    return;
  }
  grid.innerHTML = movies.map(m => {
    const poster = m.Poster && m.Poster !== 'N/A' ? m.Poster : '';
    const img = poster
      ? `<img src="${poster}" alt="${m.Title}" loading="lazy" />`
      : `<div style="aspect-ratio:2/3;background:var(--card);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.8rem;padding:.5rem;text-align:center;">${m.Title}</div>`;
    return `
      <div class="result-card" data-id="${m.imdbID}">
        ${img}
        <div class="result-card-info">
          <div class="result-card-title">${m.Title}</div>
          <div class="result-card-year">${m.Year || ''}</div>
        </div>
      </div>`;
  }).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-id]');
    if (card) goToMovie(card.dataset.id);
  }, { once: true });
}

async function doSearch(query) {
  if (!query.trim()) return;
  const input = document.getElementById('search-input');
  const btn   = document.getElementById('search-btn');
  const grid  = document.getElementById('results-grid');

  input.value = query;
  btn.disabled = true;
  btn.textContent = 'Searching…';
  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const movies = await omdbSearch(query);
    renderResults(movies);
    history.replaceState(null, '', `/recommend.html?q=${encodeURIComponent(query)}`);
  } catch (e) {
    toast('Search failed');
    grid.innerHTML = '';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Search';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();

  const chips = document.getElementById('chips');
  chips.innerHTML = SUGGESTIONS.map(s => `<button class="chip">${s}</button>`).join('');
  chips.addEventListener('click', e => {
    if (e.target.classList.contains('chip')) doSearch(e.target.textContent);
  });

  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    doSearch(document.getElementById('search-input').value);
  });

  const q = new URLSearchParams(window.location.search).get('q');
  if (q) doSearch(q);
});
