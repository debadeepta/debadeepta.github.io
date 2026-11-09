// ==========================================================================
// Modern Academic Website Interactive Features
// - Dark / Light theme toggle
// - Mobile navigation menu
// - News date badge formatting & expand/collapse
// - Instant publication filtering (search & year range)
// - Abstract toggles
// - BibTeX Citation Modal (fetch / copy / download)
// - Global Search Modal (Cmd+K / Ctrl+K)
// ==========================================================================

(function () {
  // 1. Theme Toggle
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  const savedTheme = localStorage.getItem('site-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('site-theme', next);
      applyTheme(next);
    });
  }

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // 3. Format News Dates (MM/YYYY: -> badge) & Expand/Collapse
  const newsContainer = document.getElementById('news-container');
  const newsToggleBtn = document.getElementById('news-toggle-btn');
  if (newsContainer) {
    newsContainer.querySelectorAll('li').forEach(function (li) {
      li.innerHTML = li.innerHTML.replace(
        /^\s*(\d{2}\/\d{4}):\s*/,
        '<span class="news-date-badge">$1</span> '
      );
    });
  }
  if (newsToggleBtn && newsContainer) {
    newsToggleBtn.addEventListener('click', function () {
      const expanded = newsContainer.classList.toggle('expanded');
      newsToggleBtn.innerHTML = expanded
        ? '<i class="fas fa-compress-alt"></i> Compact view'
        : '<i class="fas fa-expand-alt"></i> Show all news';
    });
  }

  // 4. Abstract Toggles
  document.querySelectorAll('[data-abstract-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-abstract-toggle');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.toggle('open');
        target.classList.toggle('expanded');
      }
    });
  });

  // 5. All Publications Live Search & Year Filter
  const pubSearchInput = document.getElementById('pub-filter-search');
  const yearPills = document.querySelectorAll('[data-year-filter]');
  const pubItems = document.querySelectorAll('.pub-filterable-item');
  const pubCountBadge = document.getElementById('pub-visible-count');
  let activeYearFilter = 'all';

  function filterPublications() {
    const query = (pubSearchInput ? pubSearchInput.value : '').trim().toLowerCase();
    let visible = 0;

    pubItems.forEach(function (item) {
      const text = (item.getAttribute('data-search') || '').toLowerCase();
      const year = parseInt(item.getAttribute('data-year') || '0', 10);
      const isFeatured = item.getAttribute('data-featured') === 'true';

      let matchesYear = true;
      if (activeYearFilter === 'featured') {
        matchesYear = isFeatured;
      } else if (activeYearFilter === '2020-2026') {
        matchesYear = year >= 2020;
      } else if (activeYearFilter === '2016-2019') {
        matchesYear = year >= 2016 && year <= 2019;
      } else if (activeYearFilter === '2009-2015') {
        matchesYear = year <= 2015;
      }

      const matchesQuery = !query || text.indexOf(query) !== -1;
      if (matchesYear && matchesQuery) {
        item.style.display = '';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    if (pubCountBadge) {
      pubCountBadge.textContent = visible + (visible === 1 ? ' paper' : ' papers');
    }
  }

  if (pubSearchInput) {
    pubSearchInput.addEventListener('input', filterPublications);
  }

  yearPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      yearPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      activeYearFilter = pill.getAttribute('data-year-filter') || 'all';
      filterPublications();
    });
  });

  // 6. BibTeX Citation Modal
  const citeModal = document.getElementById('cite-modal');
  const citeCodeEl = document.getElementById('cite-modal-code');
  const citeCopyBtn = document.getElementById('cite-copy-btn');
  const citeDownloadBtn = document.getElementById('cite-download-btn');
  const citeCloseBtn = document.getElementById('cite-close-btn');

  function openCiteModal(bibText, filename) {
    if (!citeModal || !citeCodeEl) return;
    citeCodeEl.textContent = bibText.trim();
    if (citeDownloadBtn) {
      const blob = new Blob([bibText], { type: 'text/plain;charset=utf-8' });
      citeDownloadBtn.href = URL.createObjectURL(blob);
      citeDownloadBtn.download = filename || 'citation.bib';
    }
    citeModal.classList.add('open');
  }

  document.querySelectorAll('.js-cite-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const inlineBib = btn.getAttribute('data-bib');
      const bibUrl = btn.getAttribute('data-bib-url');
      const slug = btn.getAttribute('data-slug') || 'citation';
      if (inlineBib) {
        openCiteModal(inlineBib, slug + '.bib');
      } else if (bibUrl) {
        fetch(bibUrl)
          .then(function (r) { return r.text(); })
          .then(function (txt) { openCiteModal(txt, slug + '.bib'); });
      }
    });
  });

  if (citeCopyBtn && citeCodeEl) {
    citeCopyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(citeCodeEl.textContent).then(function () {
        const orig = citeCopyBtn.innerHTML;
        citeCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(function () { citeCopyBtn.innerHTML = orig; }, 1800);
      });
    });
  }

  document.querySelectorAll('.js-copy-inline-bib').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const code = btn.getAttribute('data-bib') || '';
      navigator.clipboard.writeText(code).then(function () {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(function () { btn.innerHTML = orig; }, 1800);
      });
    });
  });

  if (citeCloseBtn && citeModal) {
    citeCloseBtn.addEventListener('click', function () {
      citeModal.classList.remove('open');
    });
  }

  // 7. Global Search Modal (Cmd+K / Ctrl+K)
  const searchModal = document.getElementById('search-modal');
  const searchOpenBtn = document.getElementById('search-open-btn');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const globalSearchInput = document.getElementById('global-search-input');
  const globalSearchResults = document.getElementById('global-search-results');
  let searchIndex = null;

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return fetch('/index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchIndex = data;
        return data;
      })
      .catch(function () { return []; });
  }

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('open');
    loadSearchIndex().then(function () {
      if (globalSearchInput) {
        globalSearchInput.focus();
        renderGlobalSearch(globalSearchInput.value);
      }
    });
  }

  function renderGlobalSearch(query) {
    if (!globalSearchResults || !searchIndex) return;
    const q = (query || '').trim().toLowerCase();
    const matches = searchIndex.filter(function (item) {
      if (!q) return true;
      return (item.title + ' ' + item.authors + ' ' + item.venue + ' ' + item.summary)
        .toLowerCase()
        .indexOf(q) !== -1;
    }).slice(0, 12);

    if (matches.length === 0) {
      globalSearchResults.innerHTML = '<p style="color:var(--text-muted);margin:0.5rem 0;">No matching results found.</p>';
      return;
    }

    globalSearchResults.innerHTML = matches.map(function (item) {
      return (
        '<a class="search-result-item" href="' + item.permalink + '">' +
          '<div class="search-result-title">' + item.title + '</div>' +
          '<div class="search-result-meta">' + (item.venue ? item.venue + ' · ' : '') + item.date + (item.authors ? ' · ' + item.authors : '') + '</div>' +
        '</a>'
      );
    }).join('');
  }

  if (searchOpenBtn) {
    searchOpenBtn.addEventListener('click', openSearchModal);
  }
  if (searchCloseBtn && searchModal) {
    searchCloseBtn.addEventListener('click', function () {
      searchModal.classList.remove('open');
    });
  }
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', function () {
      renderGlobalSearch(globalSearchInput.value);
    });
  }

  window.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    } else if (e.key === 'Escape') {
      if (citeModal) citeModal.classList.remove('open');
      if (searchModal) searchModal.classList.remove('open');
    }
  });

  [citeModal, searchModal].forEach(function (modal) {
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  });
})();
