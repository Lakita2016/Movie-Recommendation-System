import { renderNavbar, buildCarousel, goToMovie, omdbDetail, omdbSearch } from './app.js';

async function loadMovie() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/'; return; }

  const main = document.getElementById('movie-main');
  main.innerHTML = '<div class="spinner"></div>';

  try {
    const m = await omdbDetail(id);
    if (m.Response === 'False') throw new Error('Movie not found');

    document.title = `${m.Title} — CineAI`;

    const poster = m.Poster && m.Poster !== 'N/A' ? m.Poster.replace('SX300', 'SX600') : null;
    const backdrop = poster ? poster.replace('SX600', 'SX1200') : '';

    const genres = (m.Genre || '').split(',').map(g => `<span class="badge">${g.trim()}</span>`).join('');
    const rating = m.imdbRating && m.imdbRating !== 'N/A' ? m.imdbRating : '';

    // Parse actors
    const actors = (m.Actors || '').split(',').map(name => name.trim()).filter(Boolean);
    const cast = actors.map(name => `
      <div class="cast-card">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%231f1f1f' width='80' height='80'/%3E%3Ctext x='50%25' y='55%25' font-size='18' fill='%23b3b3b3' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(name.split(' ').map(n=>n[0]).join(''))}%3C/text%3E%3C/svg%3E" />
        <div class="cast-name">${name}</div>
      </div>`
    ).join('');

    // Get ratings
    const ratings = (m.Ratings || []).map(r =>
      `<div class="meta-item"><label>${r.Source.replace('Internet Movie Database','IMDb')}</label><span>${r.Value}</span></div>`
    ).join('');

    main.innerHTML = `
      <div class="movie-page">
        <div class="movie-backdrop" style="background-image:url('${backdrop}')"></div>

        <div class="movie-detail-wrap">
          <div class="movie-poster">
            ${poster
              ? `<img src="${poster}" alt="${m.Title}" />`
              : `<div style="width:220px;height:330px;background:var(--card);display:flex;align-items:center;justify-content:center;color:var(--muted)">No Poster</div>`
            }
          </div>
          <div class="movie-info">
            <h1>${m.Title}</h1>

            <div class="badges">
              ${rating ? `<span class="badge badge-green">&#9733; ${rating}</span>` : ''}
              ${m.Year ? `<span class="badge">${m.Year}</span>` : ''}
              ${m.Runtime && m.Runtime !== 'N/A' ? `<span class="badge">${m.Runtime}</span>` : ''}
              ${m.Rated && m.Rated !== 'N/A' ? `<span class="badge">${m.Rated}</span>` : ''}
              ${genres}
            </div>

            <p class="movie-overview">${m.Plot || 'No overview available.'}</p>

            <div class="movie-meta-grid">
              ${m.Director && m.Director !== 'N/A' ? `<div class="meta-item"><label>Director</label><span>${m.Director}</span></div>` : ''}
              ${m.Writer && m.Writer !== 'N/A' ? `<div class="meta-item"><label>Writer</label><span>${m.Writer}</span></div>` : ''}
              ${m.Language && m.Language !== 'N/A' ? `<div class="meta-item"><label>Language</label><span>${m.Language}</span></div>` : ''}
              ${m.Country && m.Country !== 'N/A' ? `<div class="meta-item"><label>Country</label><span>${m.Country}</span></div>` : ''}
              ${m.Awards && m.Awards !== 'N/A' ? `<div class="meta-item"><label>Awards</label><span>${m.Awards}</span></div>` : ''}
              ${m.BoxOffice && m.BoxOffice !== 'N/A' ? `<div class="meta-item"><label>Box Office</label><span>${m.BoxOffice}</span></div>` : ''}
              ${ratings}
            </div>
          </div>
        </div>

        ${cast ? `<div class="page-section"><h2>Cast</h2><div class="cast-grid">${cast}</div></div>` : ''}

        <div class="section" id="similar-section"><div class="spinner"></div></div>
      </div>`;

    // Load similar movies by searching the first genre
    const firstGenre = (m.Genre || '').split(',')[0]?.trim();
    if (firstGenre) {
      const similar = await omdbSearch(firstGenre);
      const filtered = similar.filter(s => s.imdbID !== id);
      if (filtered.length) {
        buildCarousel('You Might Also Like', filtered, document.getElementById('similar-section'));
      } else {
        document.getElementById('similar-section').style.display = 'none';
      }
    } else {
      document.getElementById('similar-section').style.display = 'none';
    }

  } catch (e) {
    main.innerHTML = `<div class="empty-state"><p>Failed to load movie. <a href="/" style="color:var(--red)">Go Home</a></p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  loadMovie();
});
