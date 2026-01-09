/**
 * Ball Transfer Systems - Quick Quote Sidebar
 * Persistent quote builder that saves to localStorage
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'bts_quote_items';

  // Quote state
  let quoteItems = [];

  // DOM elements (initialized after DOM ready)
  let sidebar, backdrop, toggle, toggleCount, content, footer, toast;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // Create sidebar HTML structure
    createSidebarHTML();

    // Cache DOM elements
    sidebar = document.querySelector('.quote-sidebar');
    backdrop = document.querySelector('.quote-backdrop');
    toggle = document.querySelector('.quote-toggle');
    toggleCount = document.querySelector('.quote-toggle__count');
    content = document.querySelector('.quote-sidebar__content');
    footer = document.querySelector('.quote-sidebar__footer');
    toast = document.querySelector('.quote-toast');

    // Load saved items
    loadFromStorage();

    // Bind events
    bindEvents();

    // Initial render
    render();

    // Set up add-to-quote buttons on the page
    setupAddButtons();
  }

  function createSidebarHTML() {
    const html = `
      <button class="quote-toggle" aria-label="Open quote builder">
        <svg class="quote-toggle__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <span>Quote</span>
        <span class="quote-toggle__count"></span>
      </button>

      <div class="quote-backdrop"></div>

      <aside class="quote-sidebar" aria-label="Quote builder">
        <div class="quote-sidebar__header">
          <h2 class="quote-sidebar__title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            Quick Quote
          </h2>
          <button class="quote-sidebar__close" aria-label="Close quote builder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="quote-sidebar__content"></div>
        <div class="quote-sidebar__footer"></div>
      </aside>

      <div class="quote-toast">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span class="quote-toast__message">Added to quote</span>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  function bindEvents() {
    // Toggle sidebar
    toggle.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelector('.quote-sidebar__close').addEventListener('click', closeSidebar);

    // Escape key closes sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    // Delegate events for dynamic content
    content.addEventListener('click', handleContentClick);
    footer.addEventListener('click', handleFooterClick);
  }

  function handleContentClick(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const item = target.closest('.quote-item');
    if (!item) return;

    const id = item.dataset.id;

    if (target.classList.contains('quote-item__remove')) {
      removeItem(id);
    } else if (target.classList.contains('quote-item__qty-btn')) {
      const delta = target.dataset.delta === '+' ? 1 : -1;
      updateQuantity(id, delta);
    }
  }

  function handleFooterClick(e) {
    if (e.target.classList.contains('quote-sidebar__clear')) {
      clearAll();
    } else if (e.target.classList.contains('quote-sidebar__submit') || e.target.closest('.quote-sidebar__submit')) {
      submitQuote();
    }
  }

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        quoteItems = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading quote from storage:', e);
      quoteItems = [];
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quoteItems));
    } catch (e) {
      console.error('Error saving quote to storage:', e);
    }
  }

  function render() {
    renderContent();
    renderFooter();
    renderToggleCount();
    updateAddButtons();
  }

  function renderContent() {
    if (quoteItems.length === 0) {
      content.innerHTML = `
        <div class="quote-empty">
          <svg class="quote-empty__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <div class="quote-empty__title">Your quote is empty</div>
          <div class="quote-empty__text">Browse our products and click "Add to Quote" to build your quote request.</div>
          <a href="index.html#products" class="btn btn--primary btn--sm">Browse Products</a>
        </div>
      `;
    } else {
      content.innerHTML = quoteItems.map(item => `
        <div class="quote-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="quote-item__image">
          <div class="quote-item__info">
            <div class="quote-item__name">${item.name}</div>
            <div class="quote-item__details">${item.details || ''}</div>
            <div class="quote-item__quantity">
              <button class="quote-item__qty-btn" data-delta="-" aria-label="Decrease quantity">-</button>
              <span class="quote-item__qty-value">${item.quantity}</span>
              <button class="quote-item__qty-btn" data-delta="+" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="quote-item__remove" aria-label="Remove item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `).join('');
    }
  }

  function renderFooter() {
    if (quoteItems.length === 0) {
      footer.innerHTML = '';
      footer.style.display = 'none';
    } else {
      footer.style.display = 'block';
      const totalItems = quoteItems.reduce((sum, item) => sum + item.quantity, 0);
      footer.innerHTML = `
        <div class="quote-summary">
          <span class="quote-summary__label">Total Items</span>
          <span class="quote-summary__value">${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
        </div>
        <div class="quote-sidebar__actions">
          <button class="quote-sidebar__submit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Submit Quote Request
          </button>
          <button class="quote-sidebar__clear">Clear All</button>
        </div>
      `;
    }
  }

  function renderToggleCount() {
    const count = quoteItems.reduce((sum, item) => sum + item.quantity, 0);
    toggleCount.textContent = count > 0 ? count : '';
  }

  function addItem(product) {
    const existing = quoteItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      quoteItems.push({
        ...product,
        quantity: 1
      });
    }
    saveToStorage();
    render();
    showToast('Added to quote');
  }

  function removeItem(id) {
    quoteItems = quoteItems.filter(item => item.id !== id);
    saveToStorage();
    render();
  }

  function updateQuantity(id, delta) {
    const item = quoteItems.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      saveToStorage();
      render();
    }
  }

  function clearAll() {
    if (confirm('Are you sure you want to clear all items from your quote?')) {
      quoteItems = [];
      saveToStorage();
      render();
    }
  }

  function submitQuote() {
    // Build the quote details string
    const quoteDetails = quoteItems.map(item =>
      `${item.name} (Qty: ${item.quantity})`
    ).join(', ');

    // Redirect to quote form with items pre-populated
    const url = new URL('request-a-quote.html', window.location.origin + window.location.pathname);
    url.searchParams.set('products', quoteDetails);
    window.location.href = url.toString();
  }

  function showToast(message) {
    toast.querySelector('.quote-toast__message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  function setupAddButtons() {
    document.querySelectorAll('[data-add-quote]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const product = {
          id: this.dataset.id || this.dataset.name,
          name: this.dataset.name,
          image: this.dataset.image || 'assets/images/products/stud-mount-1-1.jpg',
          details: this.dataset.details || ''
        };
        addItem(product);
      });
    });
  }

  function updateAddButtons() {
    document.querySelectorAll('[data-add-quote]').forEach(btn => {
      const id = btn.dataset.id || btn.dataset.name;
      const inQuote = quoteItems.some(item => item.id === id);
      btn.classList.toggle('added', inQuote);
      if (inQuote) {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          In Quote
        `;
      } else {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add to Quote
        `;
      }
    });
  }

  // Expose API for external use
  window.QuickQuote = {
    add: addItem,
    open: openSidebar,
    close: closeSidebar,
    getItems: () => [...quoteItems]
  };

})();
