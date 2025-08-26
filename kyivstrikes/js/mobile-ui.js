// Mobile UI enhancements (desktop-first: only active on small screens)
// This module adds a bottom nav and three-card layout: map | filters | info.
// It does NOT modify existing desktop behavior.

(function initMobileUI() {
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const body = document.body;
  const mobileNav = document.getElementById('mobileNav');
  const detailsPanel = document.getElementById('detailsPanel');
  const mapEl = document.getElementById('map');
  const backBtn = document.getElementById('mobileBackToMap');

  const state = {
    enabled: false,
    activeCard: null,
    leafletResizeScheduled: false,
    dateMin: null,
    dateMax: null,
  };

  function enableMobile(flag) {
    if (flag) {
      if (state.enabled) return; // already on
      state.enabled = true;
      body.classList.add('mobile-enabled');
      // Set default card only once
      if (!state.activeCard) {
        setActiveCard('map');
      } else {
        applyCardClass(state.activeCard);
        updateNavActive(state.activeCard);
      }
    } else {
      if (!state.enabled) return; // already off
      state.enabled = false;
      state.activeCard = null;
      body.classList.remove('mobile-enabled', 'mobile-card-map', 'mobile-card-filters', 'mobile-card-info');
    }
  }

  function applyCardClass(card) {
    body.classList.remove('mobile-card-map', 'mobile-card-filters', 'mobile-card-info');
    body.classList.add(`mobile-card-${card}`);
  }

  function setActiveCard(card) {
    if (state.activeCard === card) return; // no-op
    state.activeCard = card;
    applyCardClass(card);
    updateNavActive(card);
  }

  function updateNavActive(card) {
    if (!mobileNav) return;
    mobileNav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.card === card);
    });
  }

  function onNavClick(e) {
    const btn = e.target.closest('.mobile-nav-btn');
    if (!btn) return;
    const card = btn.dataset.card;
    setActiveCard(card);
  }

  function scheduleLeafletResize() {
    if (state.leafletResizeScheduled) return;
    state.leafletResizeScheduled = true;
    requestAnimationFrame(() => {
      state.leafletResizeScheduled = false;
      try {
        if (window.map && typeof window.map.invalidateSize === 'function') {
          window.map.invalidateSize();
        }
      } catch (_) {}
    });
  }

  function wireNav() {
    if (mobileNav) mobileNav.addEventListener('click', onNavClick);
    if (backBtn) backBtn.addEventListener('click', () => setActiveCard('map'));
  }

  // Auto switch to Info card when details are shown
  function observeDetails() {
    if (!detailsPanel) return;
    const obs = new MutationObserver(() => {
      const hasDetails = !!detailsPanel.querySelector('.popup-content');
      if (state.enabled && hasDetails && state.activeCard !== 'info') {
        setActiveCard('info');
      }
    });
    obs.observe(detailsPanel, { childList: true, subtree: true });
  }

  function handleResponsive() {
    const mobile = isMobile();
    if (mobile) {
      enableMobile(true);
    } else {
      enableMobile(false);
    }
  }

  function init() {
    wireNav();
    wireMobileDatePickers();
    observeDetails();
    handleResponsive();
    // Use media query change instead of window resize to avoid loops with Leaflet's internal resize
    const mql = window.matchMedia('(max-width: 767px)');
    const mqHandler = (e) => handleResponsive();
    try {
      mql.addEventListener('change', mqHandler);
    } catch (_) {
      // Safari fallback
      mql.addListener(mqHandler);
    }
  }

  function applyDateInputsFromRange(range) {
    if (!range) return;
    const startInput = document.getElementById('mobileStartDate');
    const endInput = document.getElementById('mobileEndDate');
    if (!startInput || !endInput) return;
    const toISO = (d) => d.toISOString().slice(0,10);

    state.dateMin = new Date(range.min);
    state.dateMax = new Date(range.max);

    startInput.min = toISO(state.dateMin);
    startInput.max = toISO(state.dateMax);
    endInput.min = toISO(state.dateMin);
    endInput.max = toISO(state.dateMax);

    const start = range.start ? new Date(range.start) : state.dateMin;
    const end = range.end ? new Date(range.end) : new Date();

    startInput.value = toISO(start);
    endInput.value = toISO(end);
  }

  // listen once when app announces that dateRange is ready
  window.addEventListener('date-range-ready', (e) => {
    try { applyDateInputsFromRange(e.detail.dateRange); } catch (_) {}
  }, { once: false });

  function wireMobileDatePickers() {
    const startInput = document.getElementById('mobileStartDate');
    const endInput = document.getElementById('mobileEndDate');
    if (!startInput || !endInput) return;

    const clamp = (d) => new Date(Math.min(Math.max(d.getTime(), state.dateMin?.getTime() || d.getTime()), state.dateMax?.getTime() || d.getTime()));

    startInput.addEventListener('change', () => {
      const val = startInput.value;
      if (!val) return;
      const start = clamp(new Date(val));
      const currentEnd = endInput.value ? new Date(endInput.value) : (state.dateMax || start);
      const end = clamp(currentEnd < start ? start : currentEnd);
      // Keep inputs consistent
      startInput.value = start.toISOString().slice(0,10);
      endInput.value = end.toISOString().slice(0,10);
      // Notify app
      const ev = new CustomEvent('mobile-date-change', { detail: { start, end } });
      window.dispatchEvent(ev);
    });

    endInput.addEventListener('change', () => {
      const val = endInput.value;
      if (!val) return;
      const end = clamp(new Date(val));
      const currentStart = startInput.value ? new Date(startInput.value) : (state.dateMin || end);
      const start = clamp(currentStart > end ? end : currentStart);
      // Keep inputs consistent
      startInput.value = start.toISOString().slice(0,10);
      endInput.value = end.toISOString().slice(0,10);
      // Notify app
      const ev = new CustomEvent('mobile-date-change', { detail: { start, end } });
      window.dispatchEvent(ev);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
