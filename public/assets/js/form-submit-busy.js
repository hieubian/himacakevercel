/* HIMACAKE — disable submit + spinner for forms marked .hc-busy-on-submit */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.hc-busy-on-submit').forEach(function (form) {
      form.addEventListener('submit', function () {
        var btn = form.querySelector('button[type="submit"]:not([data-no-busy]), input[type="submit"]:not([data-no-busy])');
        if (!btn || btn.disabled || btn.classList.contains('is-submit-busy')) return;
        btn.classList.add('is-submit-busy');
        btn.setAttribute('disabled', 'disabled');
        btn.setAttribute('aria-busy', 'true');
      });
    });
  });
})();
