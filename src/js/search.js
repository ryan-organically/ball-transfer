/**
 * Ball Transfer Systems - Search with Autocomplete
 * Full-text product search with filtering
 */

(function() {
  'use strict';

  // Product database for search
  const products = [
    { id: 'smc-14', name: 'SMC 1/4', type: 'Stud Mount', capacity: '75 lbs', material: 'Carbon Steel', image: 'assets/images/products/stud-mount-1-1.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'sms-14', name: 'SMS 1/4', type: 'Stud Mount', capacity: '125 lbs', material: 'Stainless Steel', image: 'assets/images/products/stud-mount-1-1.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'nsmc-14', name: 'NSMC 1/4', type: 'Stud Mount', capacity: '75 lbs', material: 'Nylon Ball', image: 'assets/images/products/stud-mount-1-1.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'smc-112', name: '1-1/2 SMC', type: 'Stud Mount', capacity: '250 lbs', material: 'Carbon Steel', image: 'assets/images/products/stud-mount-1-1.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'sms-112', name: '1-1/2 SMS', type: 'Stud Mount', capacity: '350 lbs', material: 'Stainless Steel', image: 'assets/images/products/stud-mount-1-1.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'ehsmc', name: 'EHSMC', type: 'Stud Mount', capacity: '50 lbs', material: 'Carbon Steel', image: 'assets/images/products/stud-mount-2.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'ldsmc', name: 'LDSMC', type: 'Stud Mount', capacity: '65 lbs', material: 'Carbon Steel', image: 'assets/images/products/stud-mount-3.jpg', link: 'stud-mount-ball-transfer-units.html' },
    { id: 'fmc', name: 'FMC', type: 'Flange Mount', capacity: '75 lbs', material: 'Carbon Steel', image: 'assets/images/products/FMC-flange.jpg', link: 'flange-mount-ball-transfer-units.html' },
    { id: 'fms', name: 'FMS', type: 'Flange Mount', capacity: '125 lbs', material: 'Stainless Steel', image: 'assets/images/products/FMC-flange.jpg', link: 'flange-mount-ball-transfer-units.html' },
    { id: 'dmc', name: 'DMC', type: 'Disk Mount', capacity: '75 lbs', material: 'Carbon Steel', image: 'assets/images/products/DMC-disk-mount.jpg', link: 'disk-mount-ball-transfer-units.html' },
    { id: 'dms', name: 'DMS', type: 'Disk Mount', capacity: '125 lbs', material: 'Stainless Steel', image: 'assets/images/products/DMC-disk-mount.jpg', link: 'disk-mount-ball-transfer-units.html' },
    { id: 'rmc', name: 'RMC', type: 'Round Mount', capacity: '75 lbs', material: 'Carbon Steel', image: 'assets/images/products/round-mount.jpg', link: 'round-mount-ball-transfer-units.html' },
    { id: 'msmc', name: 'MSMC', type: 'Machined Stud', capacity: '150 lbs', material: 'Carbon Steel', image: 'assets/images/products/12-MSMC-MSMS-machined.jpg', link: 'machined-stud-mount-ball-transfer-units.html' },
    { id: 'msms', name: 'MSMS', type: 'Machined Stud', capacity: '250 lbs', material: 'Stainless Steel', image: 'assets/images/products/12-MSMC-MSMS-machined.jpg', link: 'machined-stud-mount-ball-transfer-units.html' },
    { id: 'mpc', name: 'MPC', type: 'Machined Press', capacity: '150 lbs', material: 'Carbon Steel', image: 'assets/images/products/12-MPC-machined-press.jpg', link: 'machined-press-ball-transfer-units.html' },
    { id: 'mps', name: 'MPS', type: 'Machined Press', capacity: '250 lbs', material: 'Stainless Steel', image: 'assets/images/products/12-MPC-machined-press.jpg', link: 'machined-press-ball-transfer-units.html' },
    { id: 'pmc', name: 'PMC', type: 'Pipe Mount', capacity: '250 lbs', material: 'Carbon Steel', image: 'assets/images/products/1-12-PMC-pipe-mount.jpg', link: 'pipe-mount-ball-transfer-units.html' },
    { id: 'slc', name: 'SLC', type: 'Spring Loaded', capacity: '50 lbs', material: 'Carbon Steel', image: 'assets/images/products/SLC-spring-load.jpg', link: 'spring-loaded-ball-transfer-units.html' },
    { id: 'fslc', name: 'FSLC', type: 'Spring Loaded', capacity: '50 lbs', material: 'Carbon Steel', image: 'assets/images/products/FSLC-spring-load.jpg', link: 'spring-loaded-ball-transfer-units.html' },
    { id: 'bd-dmc', name: 'BD-DMC', type: 'Bolt Down Disk', capacity: '75 lbs', material: 'Carbon Steel', image: 'assets/images/products/BD-DMC-bolt-down.jpg', link: 'bolt-down-disk-mount-units.html' },
  ];

  // Page links for quick access
  const pages = [
    { name: 'Compare Products', link: 'compare.html', icon: 'compare' },
    { name: 'Load Calculator', link: 'calculator.html', icon: 'calculator' },
    { name: 'Request a Quote', link: 'request-a-quote.html', icon: 'quote' },
    { name: 'Contact Us', link: 'contact.html', icon: 'contact' },
    { name: 'Product Catalog', link: 'catalog.html', icon: 'catalog' },
  ];

  // DOM elements
  let overlay, modal, input, results, closeBtn;
  let currentFilter = 'all';
  let highlightedIndex = -1;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    createSearchHTML();
    cacheElements();
    bindEvents();
  }

  function createSearchHTML() {
    const html = `
      <div class="search-overlay"></div>
      <div class="search-modal" role="dialog" aria-label="Search">
        <div class="search-modal__inner">
          <form class="search-form" role="search">
            <div class="search-form__input-wrap">
              <svg class="search-form__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="search" class="search-form__input" placeholder="Search products, part numbers..." autocomplete="off" aria-label="Search">
              <button type="button" class="search-form__close" aria-label="Close search">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="search-filters">
              <button type="button" class="search-filter active" data-filter="all">All</button>
              <button type="button" class="search-filter" data-filter="stud">Stud Mount</button>
              <button type="button" class="search-filter" data-filter="flange">Flange Mount</button>
              <button type="button" class="search-filter" data-filter="disk">Disk Mount</button>
              <button type="button" class="search-filter" data-filter="machined">Machined</button>
              <button type="button" class="search-filter" data-filter="spring">Spring Loaded</button>
            </div>
          </form>
          <div class="search-results" id="search-results"></div>
          <div class="search-quick-links">
            <div class="search-quick-links__heading">Quick Links</div>
            <div class="search-quick-links__list">
              <a href="compare.html" class="search-quick-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                Compare
              </a>
              <a href="calculator.html" class="search-quick-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18z"/></svg>
                Calculator
              </a>
              <a href="request-a-quote.html" class="search-quick-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08"/></svg>
                Get Quote
              </a>
              <a href="catalog.html" class="search-quick-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
                Catalog
              </a>
            </div>
          </div>
          <div class="search-hints">
            <div class="search-hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</div>
            <div class="search-hint"><kbd>Enter</kbd> Select</div>
            <div class="search-hint"><kbd>Esc</kbd> Close</div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Add search toggle button to header if it has space
    const nav = document.querySelector('.main-nav');
    if (nav) {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'search-toggle';
      searchBtn.setAttribute('aria-label', 'Open search');
      searchBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      `;
      nav.insertBefore(searchBtn, nav.querySelector('.nav-link--cta'));
    }
  }

  function cacheElements() {
    overlay = document.querySelector('.search-overlay');
    modal = document.querySelector('.search-modal');
    input = document.querySelector('.search-form__input');
    results = document.getElementById('search-results');
    closeBtn = document.querySelector('.search-form__close');
  }

  function bindEvents() {
    // Open search
    document.querySelectorAll('.search-toggle').forEach(btn => {
      btn.addEventListener('click', openSearch);
    });

    // Close search
    overlay.addEventListener('click', closeSearch);
    closeBtn.addEventListener('click', closeSearch);

    // Input handling
    input.addEventListener('input', debounce(handleSearch, 150));
    input.addEventListener('keydown', handleKeydown);

    // Filter buttons
    document.querySelectorAll('.search-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.search-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        handleSearch();
      });
    });

    // Global keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeSearch();
      }
    });

    // Click on result
    results.addEventListener('click', (e) => {
      const result = e.target.closest('.search-result');
      if (result) {
        window.location.href = result.href;
      }
    });
  }

  function openSearch() {
    overlay.classList.add('open');
    modal.classList.add('open');
    input.focus();
    document.body.style.overflow = 'hidden';
    showDefaultResults();
  }

  function closeSearch() {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    input.value = '';
    highlightedIndex = -1;
  }

  function handleSearch() {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      showDefaultResults();
      return;
    }

    let filtered = products.filter(p => {
      const searchStr = `${p.name} ${p.type} ${p.material} ${p.capacity}`.toLowerCase();
      return searchStr.includes(query);
    });

    // Apply category filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => {
        const type = p.type.toLowerCase();
        switch (currentFilter) {
          case 'stud': return type.includes('stud') && !type.includes('machined');
          case 'flange': return type.includes('flange');
          case 'disk': return type.includes('disk');
          case 'machined': return type.includes('machined');
          case 'spring': return type.includes('spring');
          default: return true;
        }
      });
    }

    highlightedIndex = -1;
    renderResults(filtered, query);
  }

  function showDefaultResults() {
    results.innerHTML = `
      <div class="search-results__heading">Popular Products</div>
      ${products.slice(0, 6).map((p, i) => renderResultItem(p, '', i)).join('')}
    `;
  }

  function renderResults(items, query) {
    if (items.length === 0) {
      results.innerHTML = `
        <div class="search-results__empty">
          <svg class="search-results__empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <div>No products found for "${escapeHtml(query)}"</div>
          <p style="font-size: var(--font-size-sm); margin-top: var(--space-2);">Try a different search term or browse by category</p>
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div class="search-results__heading">${items.length} result${items.length !== 1 ? 's' : ''}</div>
      ${items.map((p, i) => renderResultItem(p, query, i)).join('')}
    `;
  }

  function renderResultItem(product, query, index) {
    const name = query ? highlightMatch(product.name, query) : product.name;
    const highlighted = index === highlightedIndex ? 'highlighted' : '';

    return `
      <a href="${product.link}" class="search-result ${highlighted}" data-index="${index}">
        <img src="${product.image}" alt="${product.name}" class="search-result__image">
        <div class="search-result__info">
          <div class="search-result__name">${name}</div>
          <div class="search-result__meta">
            <span class="search-result__type">${product.type}</span>
            <span>${product.capacity}</span>
            <span>${product.material}</span>
          </div>
        </div>
        <svg class="search-result__arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    `;
  }

  function handleKeydown(e) {
    const items = results.querySelectorAll('.search-result');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        updateHighlight(items);
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateHighlight(items);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          window.location.href = items[highlightedIndex].href;
        }
        break;
    }
  }

  function updateHighlight(items) {
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === highlightedIndex);
      if (i === highlightedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Expose API
  window.ProductSearch = {
    open: openSearch,
    close: closeSearch
  };

})();
