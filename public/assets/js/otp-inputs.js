/* HIMACAKE — OTP 6 ô: dán mã, iOS/Android SMS, bàn phím số, desktop. Dùng trang auth. */
(function () {
  'use strict';

  function digitsOnly(s) {
    return String(s == null ? '' : s).replace(/\D/g, '');
  }

  function initOtpBox(box) {
    var form = box.closest('form');
    var hidden = form ? form.querySelector('input[name="code"]') : null;
    var inputs = box.querySelectorAll('input:not([type="hidden"])');
    var n = inputs.length;
    if (!n) return;

    function mergedDigits() {
      return digitsOnly(
        Array.prototype.map.call(inputs, function (x) {
          return x.value;
        }).join('')
      );
    }

    function sync() {
      if (hidden) hidden.value = mergedDigits().slice(0, n);
    }

    function focusAt(idx) {
      var i = Math.max(0, Math.min(n - 1, idx));
      var el = inputs[i];
      el.focus();
      try {
        el.select();
      } catch (e) {}
    }

    /** Điền d chữ số bắt đầu từ ô startIdx; trả về chỉ số ô tiếp theo trống hoặc n. */
    function spreadFrom(startIdx, digitStr) {
      var d = digitsOnly(digitStr);
      if (!d) return startIdx;
      var pos = startIdx;
      for (var k = 0; k < d.length && pos < n; k++, pos++) {
        inputs[pos].value = d.charAt(k);
      }
      sync();
      if (pos < n) focusAt(pos);
      else focusAt(n - 1);
      return pos;
    }

    function allFilled() {
      for (var i = 0; i < n; i++) {
        if (!inputs[i].value || inputs[i].value.length !== 1) return false;
      }
      return mergedDigits().length === n;
    }

    var autoTimer = null;
    function scheduleAutoSubmit() {
      if (!form || !allFilled()) return;
      sync();
      if (form.getAttribute('data-otp-autosubmit') === '0') return;
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(function () {
        autoTimer = null;
        if (!allFilled() || !form) return;
        sync();
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.submit();
      }, 120);
    }

    Array.prototype.forEach.call(inputs, function (inp, i) {
      inp.setAttribute('inputmode', 'numeric');
      inp.setAttribute('pattern', '[0-9]*');
      inp.setAttribute('maxlength', '1');
      inp.setAttribute('autocorrect', 'off');
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('spellcheck', 'false');
      if (i === 0) inp.setAttribute('autocomplete', 'one-time-code');
      else inp.setAttribute('autocomplete', 'off');

      inp.addEventListener('beforeinput', function (e) {
        if (e.inputType === 'insertText' && e.data && !/^\d$/.test(e.data)) {
          e.preventDefault();
        }
      });

      inp.addEventListener('input', function () {
        var v = digitsOnly(inp.value);
        if (v.length > 1) {
          inp.value = '';
          spreadFrom(i, v);
          scheduleAutoSubmit();
          return;
        }
        inp.value = v.slice(-1);
        sync();
        if (inp.value && i < n - 1) focusAt(i + 1);
        scheduleAutoSubmit();
      });

      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') {
          if (inp.value) {
            inp.value = '';
            sync();
            e.preventDefault();
            return;
          }
          if (i > 0) {
            inputs[i - 1].value = '';
            sync();
            focusAt(i - 1);
            e.preventDefault();
          }
          return;
        }
        if (e.key === 'ArrowLeft' && i > 0) {
          e.preventDefault();
          focusAt(i - 1);
        } else if (e.key === 'ArrowRight' && i < n - 1) {
          e.preventDefault();
          focusAt(i + 1);
        } else if (e.key === 'Enter' && form && allFilled()) {
          e.preventDefault();
          sync();
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
          else form.submit();
        }
      });

      inp.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData && e.clipboardData.getData('text')) || '';
        var d = digitsOnly(text);
        if (!d) return;
        spreadFrom(i, d);
        scheduleAutoSubmit();
      });

      inp.addEventListener('focus', function () {
        if (inp.value) {
          try {
            inp.select();
          } catch (err) {}
        }
      });
    });

    if (form) {
      form.addEventListener('submit', function () {
        sync();
      });
    }

    sync();
  }

  function run() {
    document.querySelectorAll('.otp-input').forEach(initOtpBox);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
