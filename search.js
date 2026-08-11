/* ── Zentrevo Site Search ── */
(function () {
  let SEARCH_INDEX = null;
  let indexLoading = null;

  function getBasePath() {
    // Determine relative path prefix to site root based on current location
    const path = window.location.pathname;
    return path.includes('/blog/') ? '../' : '';
  }

  function loadIndex() {
    if (SEARCH_INDEX) return Promise.resolve(SEARCH_INDEX);
    if (indexLoading) return indexLoading;
    indexLoading = fetch(getBasePath() + 'search-index.json')
      .then(r => r.json())
      .then(data => { SEARCH_INDEX = data; return data; })
      .catch(() => { SEARCH_INDEX = []; return []; });
    return indexLoading;
  }

  function scoreEntry(entry, query) {
    const q = query.toLowerCase();
    const title = entry.title.toLowerCase();
    const desc = (entry.desc || '').toLowerCase();
    if (title.startsWith(q)) return 100;
    if (title.includes(q)) return 60;
    if (desc.includes(q)) return 20;
    return 0;
  }

  function renderResults(container, results, basePath) {
    if (!results.length) {
      container.innerHTML = '<div class="search-no-results">No results found. Try a different term.</div>';
      return;
    }
    container.innerHTML = results.slice(0, 8).map(r => `
      <a class="search-result" href="${basePath}${r.url}">
        <span class="search-result-type">${r.type === 'blog' ? '📄' : '🏠'}</span>
        <div>
          <div class="search-result-title">${r.title}</div>
          <div class="search-result-desc">${r.desc}</div>
        </div>
      </a>
    `).join('');
  }

  function initSearch() {
    const toggle = document.querySelector('.search-toggle');
    const overlay = document.querySelector('.search-overlay');
    const input = document.querySelector('.search-input');
    const resultsBox = document.querySelector('.search-results');
    const closeBtn = document.querySelector('.search-close');
    if (!toggle || !overlay || !input || !resultsBox) return;

    const basePath = getBasePath();

    function openSearch() {
      overlay.classList.add('search-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 50);
      loadIndex();
    }
    function closeSearch() {
      overlay.classList.remove('search-open');
      document.body.style.overflow = '';
      input.value = '';
      resultsBox.innerHTML = '';
    }

    toggle.addEventListener('click', openSearch);
    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) {
        resultsBox.innerHTML = '';
        return;
      }
      loadIndex().then(data => {
        const scored = data
          .map(entry => ({ entry, score: scoreEntry(entry, q) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(x => x.entry);
        renderResults(resultsBox, scored, basePath);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
