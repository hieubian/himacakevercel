/* HIMACAKE - Admin JS (vanilla) */
(function () {
  'use strict';

  // ---------- Mobile sidebar (off-canvas + overlay) ----------
  (function initAdminMobileNav() {
    const body = document.body;
    const sidebar = document.getElementById('admin-sidebar-nav');
    const toggle = document.querySelector('[data-admin-menu-toggle]');
    const overlay = document.querySelector('[data-admin-sidebar-overlay]');
    if (!sidebar || !toggle) return;

    const mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;

    function isMobileLayout() {
      return !mq || mq.matches;
    }

    function setOpen(open) {
      const on = !!open;
      sidebar.classList.toggle('open', on);
      toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
      toggle.setAttribute('aria-label', on ? 'Đóng menu điều hướng' : 'Mở menu điều hướng');
      if (overlay) {
        overlay.classList.toggle('is-visible', on);
        overlay.setAttribute('aria-hidden', on ? 'false' : 'true');
      }
      body.classList.toggle('admin-menu-open', on && isMobileLayout());
    }

    function close() {
      setOpen(false);
    }

    toggle.addEventListener('click', function () {
      if (!isMobileLayout()) return;
      setOpen(!sidebar.classList.contains('open'));
    });

    if (overlay) {
      overlay.addEventListener('click', close);
    }

    sidebar.querySelectorAll('.admin-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (isMobileLayout()) close();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
    });

    window.addEventListener(
      'resize',
      function () {
        if (!isMobileLayout()) {
          sidebar.classList.remove('open');
          if (overlay) {
            overlay.classList.remove('is-visible');
            overlay.setAttribute('aria-hidden', 'true');
          }
          body.classList.remove('admin-menu-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Mở menu điều hướng');
        }
      },
      { passive: true }
    );
  })();

  // Tabs — khớp theo data-tab / data-panel (tránh lệch vì thứ tự DOM không đồng bộ giữa nav và panels)
  document.querySelectorAll('[data-admin-tabs]').forEach(box => {
    const navs = Array.from(box.querySelectorAll('.admin-tabs__nav [data-tab]'));
    const panels = Array.from(box.querySelectorAll('.admin-tabs__panel[data-panel]'));
    function showTab(name) {
      navs.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === name));
      panels.forEach(p => p.classList.toggle('active', p.getAttribute('data-panel') === name));
    }
    navs.forEach(b => {
      b.addEventListener('click', e => {
        e.preventDefault();
        if (b.disabled) return;
        const name = b.getAttribute('data-tab');
        if (!name) return;
        showTab(name);
        try { history.replaceState(null, '', '#' + name); } catch (ignore) {}
      });
    });
    let hash = (location.hash || '').replace(/^#/, '');
    if (hash && navs.some(n => n.getAttribute('data-tab') === hash)) {
      showTab(hash);
    }
  });

  // Auto-fill slug from name
  document.querySelectorAll('[data-slug-from]').forEach(input => {
    const src = document.querySelector(input.dataset.slugFrom);
    if (!src) return;
    src.addEventListener('blur', () => {
      if (input.value.trim()) return;
      input.value = src.value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-');
    });
  });

})();
