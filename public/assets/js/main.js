/* HIMACAKE - Main client JS (vanilla, no jQuery) */
(function () {
  'use strict';

  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('.site-nav');
  const siteHeader = document.querySelector('.site-header');
  const siteHeaderSpacer = document.getElementById('site-header-spacer');

  function revealHeader() {
    if (!siteHeader) return;
    siteHeader.classList.remove('site-header--away');
  }

  function hideHeader() {
    if (!siteHeader) return;
    siteHeader.classList.add('site-header--away');
  }

  function syncHeaderSpacer() {
    if (!siteHeader || !siteHeaderSpacer) return;
    siteHeaderSpacer.style.height = Math.ceil(siteHeader.offsetHeight) + 'px';
  }

  function readViewportScrollY() {
    const w = window.scrollY;
    if (typeof w === 'number' && !Number.isNaN(w)) return Math.max(0, w);
    const rt = document.scrollingElement || document.documentElement;
    const t = rt ? rt.scrollTop : 0;
    return Math.max(0, typeof t === 'number' ? t : 0);
  }

  function isMobileMenuLayout() {
    return typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width:900px)').matches
      : window.innerWidth <= 900;
  }

  /** Burger mobile: khóa cuộn nền (body fixed) + vùng .site-nav cuộn trong max-height viewport. */
  function setMobileNavExpanded(expanded) {
    if (!nav || !burger) return;
    const on = !!expanded;
    nav.classList.toggle('open', on);
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (siteHeader) {
      siteHeader.classList.toggle('site-header--mob-nav-open', on && isMobileMenuLayout());
    }
    const body = document.body;
    if (on && isMobileMenuLayout()) {
      const y = readViewportScrollY();
      body.dataset.siteNavSavedY = String(y);
      body.style.top = '-' + y + 'px';
      body.classList.add('site-nav-lock');
      requestAnimationFrame(syncMobNavRollMax);
    } else {
      const prev = body.dataset.siteNavSavedY;
      body.classList.remove('site-nav-lock');
      body.style.removeProperty('top');
      delete body.dataset.siteNavSavedY;
      const roll = nav.querySelector(':scope > .site-header__roll-inner');
      if (roll) roll.style.maxHeight = '';
      if (prev !== undefined && prev !== '') {
        const yi = parseInt(prev, 10);
        if (Number.isFinite(yi)) window.scrollTo(0, yi);
      }
    }
    revealHeader();
    syncHeaderSpacer();
  }

  /** Chiều cao cụm menu (mega) trên mobile: theo chỗ trống còn lại của viewport để không kéo nền. */
  function syncMobNavRollMax() {
    if (!nav || !nav.classList.contains('open') || !isMobileMenuLayout()) return;
    const roll = nav.querySelector(':scope > .site-header__roll-inner');
    if (!roll) return;
    const top = nav.getBoundingClientRect().top;
    const avail = Math.max(176, Math.floor(window.innerHeight - top - 14));
    roll.style.maxHeight = avail + 'px';
  }

  /**
   * Smart header (pattern quen thuộc trên shop / Material):
   * gần đỉnh trang luôn ghim; sau đó cuộn xuống đủ xa mới ẩn,
   * cuộn nhích lên (hoặc wheel lên) là hiện — có hysteresis nhẹ đỡ giật.
   */
  if (siteHeader && siteHeaderSpacer) {
    const PINNED_SCROLL_Y = 64;
    const HIDE_DELTA_DOWN = 14;
    const REVEAL_DELTA_UP = 3;

    let yPrev = readViewportScrollY();
    let megaEngaged = false;
    const megaRoot = siteHeader.querySelector('[data-has-mega]');
    if (megaRoot) {
      const megaPanel = megaRoot.querySelector('.site-nav__mega');
      let megaCloseTimer = null;
      const MEGA_CLOSE_MS = 180;

      const openMega = () => {
        if (megaCloseTimer) {
          clearTimeout(megaCloseTimer);
          megaCloseTimer = null;
        }
        megaEngaged = true;
        if (!isMobileMenuLayout()) megaRoot.classList.add('is-mega-open');
        revealHeader();
      };
      const scheduleCloseMega = () => {
        if (megaCloseTimer) clearTimeout(megaCloseTimer);
        megaCloseTimer = setTimeout(() => {
          megaCloseTimer = null;
          megaEngaged = false;
          if (!isMobileMenuLayout()) megaRoot.classList.remove('is-mega-open');
        }, MEGA_CLOSE_MS);
      };

      megaRoot.addEventListener('mouseenter', openMega, { passive: true });
      megaRoot.addEventListener('mouseleave', scheduleCloseMega, { passive: true });
      if (megaPanel) {
        megaPanel.addEventListener('mouseenter', openMega, { passive: true });
        megaPanel.addEventListener('mouseleave', scheduleCloseMega, { passive: true });
      }
      megaRoot.addEventListener('focusin', openMega);
      megaRoot.addEventListener('focusout', function (ev) {
        if (!megaRoot.contains(ev.relatedTarget)) scheduleCloseMega();
      });
    }

    let ticking = false;
    function runScrollLogic() {
      ticking = false;
      const y = readViewportScrollY();
      const dy = y - yPrev;
      yPrev = y;

      const navOpen = !!(nav && nav.classList.contains('open'));
      if (megaEngaged || navOpen || y <= PINNED_SCROLL_Y) {
        revealHeader();
        return;
      }
      if (dy > HIDE_DELTA_DOWN) hideHeader();
      else if (dy < -REVEAL_DELTA_UP) revealHeader();
    }

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(runScrollLogic);
      }
    }

    syncHeaderSpacer();
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(syncHeaderSpacer).observe(siteHeader);
    } else {
      window.addEventListener('load', syncHeaderSpacer, { passive: true });
    }

    window.addEventListener('scroll', requestTick, { passive: true });

    window.addEventListener(
      'wheel',
      function (ev) {
        if (readViewportScrollY() <= PINNED_SCROLL_Y) return;
        if (megaEngaged || (nav && nav.classList.contains('open'))) return;
        if (typeof ev.deltaY === 'number' && ev.deltaY < 0) {
          revealHeader();
          yPrev = readViewportScrollY();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      function () {
        yPrev = readViewportScrollY();
        syncHeaderSpacer();
        if (megaRoot && isMobileMenuLayout()) megaRoot.classList.remove('is-mega-open');
        if (burger && nav && !isMobileMenuLayout() && nav.classList.contains('open')) {
          setMobileNavExpanded(false);
        } else if (burger && nav) {
          syncMobNavRollMax();
        }
      },
      { passive: true }
    );

    requestAnimationFrame(() => {
      const y = readViewportScrollY();
      yPrev = y;
      const far = y > PINNED_SCROLL_Y + 56;
      if (far && !(nav && nav.classList.contains('open'))) hideHeader();
    });
  }

  // ---------- Mobile menu burger ----------
  if (burger && nav) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      setMobileNavExpanded(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('.site-nav__list>li').forEach(function (li) {
      const sub = li.querySelector('.site-nav__sub');
      const mega = li.querySelector('.site-nav__mega');
      const panel = sub || mega;
      if (!panel) return;
      const topLink = li.querySelector(':scope > a');
      if (!topLink) return;
      topLink.addEventListener('click', e => {
        if (!isMobileMenuLayout()) return;
        e.preventDefault();
        const opening = !li.classList.contains('open');
        nav.querySelectorAll('.site-nav__list>li.open').forEach(x => {
          if (x !== li) x.classList.remove('open');
        });
        li.classList.toggle('open', opening);
      });
    });
    nav.addEventListener('click', function (e) {
      if (!isMobileMenuLayout() || !nav.classList.contains('open')) return;
      const a = e.target.closest('.site-nav a');
      if (!a || !nav.contains(a)) return;
      const li = a.closest('.site-nav__list > li');
      const isMegaToggle =
        !!(li &&
          li.classList.contains('site-nav__item--mega') &&
          a === li.querySelector(':scope > a'));
      if (!isMegaToggle) setMobileNavExpanded(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!nav.classList.contains('open') || !isMobileMenuLayout()) return;
      setMobileNavExpanded(false);
    });
    if (typeof window.visualViewport !== 'undefined' && window.visualViewport.addEventListener) {
      window.visualViewport.addEventListener('resize', syncMobNavRollMax);
    }
  }

  // ---------- Slideshow ----------
  document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
  function initSlideshow(el) {
    const track = el.querySelector('.slideshow__track');
    const slides = el.querySelectorAll('.slideshow__slide');
    const dotsBox = el.querySelector('.slideshow__dots');
    if (!track || slides.length === 0) return;
    let idx = 0, timer;
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => go(i));
      dotsBox && dotsBox.appendChild(b);
    });
    el.querySelector('.slideshow__nav--prev')?.addEventListener('click', () => go(idx - 1));
    el.querySelector('.slideshow__nav--next')?.addEventListener('click', () => go(idx + 1));
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsBox?.querySelectorAll('button').forEach((d, k) => d.classList.toggle('active', k === idx));
    }
    function play() { timer = setInterval(() => go(idx + 1), 5500); }
    el.addEventListener('mouseenter', () => clearInterval(timer));
    el.addEventListener('mouseleave', play);
    play();
  }

  // ---------- Tabs ----------
  document.querySelectorAll('[data-tabs]').forEach(tabs => {
    const navs = tabs.querySelectorAll('.tabs__nav button');
    const panels = tabs.querySelectorAll('.tabs__panel');
    navs.forEach((b, i) => b.addEventListener('click', () => {
      navs.forEach(x => x.classList.remove('active'));
      panels.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      panels[i] && panels[i].classList.add('active');
    }));
  });

  /** So khớp URL ảnh PDP (thumb vs data-image-url) dù khác absolute/relative. */
  function pdpComparableImgUrl(u) {
    const s = u == null ? '' : String(u).trim();
    if (!s) return '';
    try {
      return new URL(s, window.location.href).href.replace(/\/$/, '');
    } catch (e) {
      return s.replace(/\/$/, '');
    }
  }

  /**
   * Khi khách bấm ảnh nhỏ gallery: chọn biến thể tương ứng (trùng ảnh hoặc cùng thứ tự)
   * để giá + trạng thái “tùy chọn” đồng bộ.
   */
  function selectVariantForGalleryThumb(thumbEl) {
    const form = document.getElementById('addToCartForm');
    if (!form || !thumbEl) return;
    const radios = [...form.querySelectorAll('input[name=variantId]')];
    if (!radios.length) return;

    const gal = thumbEl.closest('[data-gallery]');
    const thumbImgs = gal ? [...gal.querySelectorAll('.thumbs img')] : [];
    const cand = pdpComparableImgUrl(thumbEl.getAttribute('data-full') || thumbEl.src);

    let pick = null;
    for (const r of radios) {
      const vu = pdpComparableImgUrl(r.getAttribute('data-image-url'));
      if (vu && cand && vu === cand) {
        pick = r;
        break;
      }
    }
    if (!pick && thumbImgs.length) {
      const ti = thumbImgs.indexOf(thumbEl);
      if (ti >= 0) {
        for (const r of radios) {
          const gidx = parseInt(String(r.getAttribute('data-gallery-idx') || '0'), 10) || 0;
          if (gidx === ti) {
            pick = r;
            break;
          }
        }
      }
    }

    if (!pick) return;

    if (!pick.checked) {
      pick.checked = true;
      pick.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      syncDetailPriceFromVariant();
      syncGalleryFromVariant();
    }
  }

  // ---------- Product gallery thumb click ----------
  document.querySelectorAll('[data-gallery]').forEach(g => {
    const main  = g.querySelector('.main img');
    g.querySelectorAll('.thumbs img').forEach(t => t.addEventListener('click', () => {
      g.querySelectorAll('.thumbs img').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      if (main) main.src = t.getAttribute('data-full') || t.src;
      selectVariantForGalleryThumb(t);
    }));
  });

  // ---------- Quantity input ----------
  document.querySelectorAll('.qty-input').forEach(q => {
    const input = q.querySelector('input');
    q.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      const step = btn.dataset.step === '+' ? 1 : -1;
      let v = parseInt(input.value || '1', 10) + step;
      if (v < 1) v = 1;
      input.value = v;
      input.dispatchEvent(new Event('change'));
    }));
  });

  function formatVnd(n) {
    const x = Number(n);
    if (Number.isNaN(x)) return '';
    return new Intl.NumberFormat('vi-VN').format(Math.round(x)) + '₫';
  }

  function syncDetailPriceFromVariant() {
    const r = document.querySelector('input[name=variantId]:checked');
    const priceEl = document.getElementById('detailPrice');
    const oldEl = document.getElementById('detailPriceOld');
    if (!r || !priceEl) return;
    const dp = r.getAttribute('data-display');
    if (dp != null && dp !== '') priceEl.textContent = formatVnd(dp);
    if (oldEl) {
      const lp = r.getAttribute('data-list');
      if (lp != null && lp !== '' && Number(lp) > 0) {
        oldEl.textContent = formatVnd(lp);
        oldEl.style.display = '';
      } else {
        oldEl.textContent = '';
        oldEl.style.display = 'none';
      }
    }
    syncDetailStockUnified();
  }

  function applyDetailStockDisplayAndQty(displayCount, selectableQty, lineSuffix) {
    const line = document.getElementById('detailStockLine');
    const form = document.getElementById('addToCartForm');
    const qtyInput = form ? form.querySelector('[data-qty]') : null;
    const buyWrap = document.querySelector('.product-detail__buy-actions');
    if (!line) {
      return;
    }

    displayCount = typeof displayCount === 'number' && !Number.isNaN(displayCount) ? displayCount : 0;
    selectableQty = typeof selectableQty === 'number' && !Number.isNaN(selectableQty) ? selectableQty : 0;
    const suffix = lineSuffix != null ? String(lineSuffix) : '';

    const dispOut = displayCount <= 0;
    line.textContent = dispOut ? 'Hết hàng' : ('Còn ' + displayCount + ' sản phẩm' + suffix);

    const selOut = selectableQty <= 0;
    const wrapQty = qtyInput ? qtyInput.closest('.qty-input') : null;
    const stepBtns = wrapQty ? wrapQty.querySelectorAll('button') : [];
    if (qtyInput) {
      if (selOut) {
        qtyInput.value = '0';
        qtyInput.min = '0';
        qtyInput.max = '0';
        qtyInput.disabled = true;
        stepBtns.forEach(function (b) { b.disabled = true; });
      } else {
        qtyInput.disabled = false;
        stepBtns.forEach(function (b) { b.disabled = false; });
        qtyInput.min = '1';
        const maxAllowed = Math.min(99, selectableQty);
        qtyInput.max = String(Math.max(1, maxAllowed));
        let v = parseInt(String(qtyInput.value || '1'), 10);
        if (Number.isNaN(v) || v < 1) v = 1;
        if (v > maxAllowed) qtyInput.value = String(maxAllowed);
      }
    }
    if (buyWrap) {
      buyWrap.querySelectorAll('button[data-add-to-cart],button[data-buy-now]').forEach(function (btn) {
        btn.disabled = selOut;
      });
    }
  }

  /** Có biến thể: chưa chọn → dòng tồn = tổng; đã chọn → tồn theo data-stock variant. SL đặt hàng chỉ khi đã chọn. */
  function syncDetailStockUnified() {
    const form = document.getElementById('addToCartForm');
    const line = document.getElementById('detailStockLine');
    if (!form || !line) return;

    const hasV = !!form.querySelector('input[name=variantId]');

    let totalUnits;
    if (hasV) {
      totalUnits = parseInt(String(form.getAttribute('data-total-display-stock') || '0'), 10);
      if (Number.isNaN(totalUnits) || totalUnits < 0) totalUnits = 0;
      const r = form.querySelector('input[name=variantId]:checked');
      if (!r) {
        const suf = totalUnits > 0 ? ' (tổng các tùy chọn)' : '';
        applyDetailStockDisplayAndQty(totalUnits, 0, suf);
        return;
      }
      const vStk = parseInt(String(r.getAttribute('data-stock') || '0'), 10);
      const sel = Number.isNaN(vStk) || vStk < 0 ? 0 : vStk;
      applyDetailStockDisplayAndQty(sel, sel, '');
      return;
    }

    if (form.getAttribute('data-product-stock') != null && form.getAttribute('data-product-stock') !== '') {
      const n = parseInt(String(form.getAttribute('data-product-stock')), 10);
      const displayCount = Number.isNaN(n) || n < 0 ? 0 : n;
      applyDetailStockDisplayAndQty(displayCount, displayCount, '');
    }
  }

  /** Khi có ảnh riêng theo biến thể, đổi ảnh lớn + highlight thumb trùng (nếu có). */
  function syncGalleryFromVariant() {
    const r = document.querySelector('input[name=variantId]:checked');
    const gal = document.querySelector('[data-gallery]');
    const main = document.getElementById('mainImg');
    if (!gal || !main) return;
    const thumbsBox = gal.querySelector('.thumbs');
    const thumbImgs = thumbsBox ? Array.from(thumbsBox.querySelectorAll('img')) : [];
    const fallback = ((gal.dataset.defaultMain || main.getAttribute('data-initial-src') || '').trim()) || '';

    /** ảnh variant: luôn đọc data-image-url (dataset.imageUrl không đồng nhất mọi trình duyệt) */
    const vu = r ? String(r.getAttribute('data-image-url') || '').trim() : '';

    let url = '';
    if (vu) {
      url = vu;
    } else if (thumbImgs.length > 1 && r) {
      /** Không có URL riêng (hoặc DB trống): xoay theo thumbs gallery để đổi ảnh khi đổi tùy chọn */
      const idx = parseInt(String(r.getAttribute('data-gallery-idx') || '0'), 10) || 0;
      const picked = thumbImgs[idx % thumbImgs.length];
      url = (picked.getAttribute('data-full') || picked.src || '').trim();
    }
    if (!url) url = fallback || main.src;

    /** Tránh không đổi gì khi variant trùng hẳn ảnh mặc định và vẫn còn thumb khác */
    if (url === fallback && thumbImgs.length > 1 && vu && r) {
      const idx = parseInt(String(r.getAttribute('data-gallery-idx') || '0'), 10) || 0;
      const picked = thumbImgs[idx % thumbImgs.length];
      const altUrl = (picked.getAttribute('data-full') || picked.src || '').trim();
      if (altUrl && altUrl !== fallback) url = altUrl;
    }

    main.src = url;
    const urlTrim = url.trim();

    thumbImgs.forEach(function (t) {
      const fu = (t.getAttribute('data-full') || t.src || '').trim();
      t.classList.toggle('active', fu === urlTrim);
    });
  }

  function attachVariantGallerySync(form) {
    if (!form) return;
    form.addEventListener('change', function (e) {
      const t = e.target;
      if (t && t.name === 'variantId') {
        syncDetailPriceFromVariant();
        syncGalleryFromVariant();
      }
    });
    form.addEventListener('input', function (e) {
      const t = e.target;
      if (t && t.name === 'variantId') {
        syncDetailPriceFromVariant();
        syncGalleryFromVariant();
      }
    });
  }

  attachVariantGallerySync(document.getElementById('addToCartForm'));

  syncDetailPriceFromVariant();
  syncDetailStockUnified();
  syncGalleryFromVariant();

  async function postAddToCart(ctx, productId, variantId, qty) {
    const res = await fetch(ctx + '/cart/add', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `productId=${encodeURIComponent(productId)}&variantId=${encodeURIComponent(variantId)}&quantity=${encodeURIComponent(qty)}`,
      redirect: 'manual'
    });
    if (res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
      window.location.href = res.headers.get('Location') || (ctx + '/auth/login');
      return null;
    }
    const ct = res.headers.get('Content-Type') || '';
    if (!ct.includes('application/json')) {
      window.location.href = ctx + '/auth/login';
      return null;
    }
    return res.json();
  }

  // ---------- AJAX add to cart ----------
  document.body.addEventListener('click', async function (e) {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId || '';
    const qty = btn.dataset.qty || (document.querySelector('[data-qty]')?.value || 1);
    const ctx = btn.dataset.context || '';
    try {
      btn.disabled = true;
      const json = await postAddToCart(ctx, productId, variantId, qty);
      if (json == null) return;
      if (json.ok) {
        toast(json.message || 'Đã thêm vào giỏ');
        const counter = document.querySelector('[data-cart-count]');
        if (counter) counter.textContent = json.totalQuantity;
      } else {
        toast(json.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (err) {
      toast('Lỗi kết nối', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  document.body.addEventListener('click', async function (e) {
    const btn = e.target.closest('[data-buy-now]');
    if (!btn) return;
    e.preventDefault();
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId || '';
    const qty = btn.dataset.qty || (document.querySelector('#addToCartForm [data-qty]')?.value || document.querySelector('[data-qty]')?.value || 1);
    const ctx = btn.dataset.context || '';
    try {
      btn.disabled = true;
      const json = await postAddToCart(ctx, productId, variantId, qty);
      if (json == null) return;
      if (json.ok) {
        const counter = document.querySelector('[data-cart-count]');
        if (counter) counter.textContent = json.totalQuantity;
        window.location.href = ctx + '/checkout';
      } else {
        toast(json.message || 'Không thể thêm vào giỏ', 'error');
      }
    } catch (err) {
      toast('Lỗi kết nối', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- Toast ----------
  function toast(msg, type) {
    let host = document.getElementById('hima-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'hima-toast-host';
      const narrow = typeof window.matchMedia === 'function' && window.matchMedia('(max-width:600px)').matches;
      host.style.cssText = narrow
        ? 'position:fixed;bottom:calc(14px + env(safe-area-inset-bottom,0px));left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));z-index:9999;display:flex;flex-direction:column;gap:8px'
        : 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `background:${type === 'error' ? '#c62828' : '#2e7d32'};color:#fff;padding:10px 16px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.2);font-size:14px;animation:fadeIn .25s ease`;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // OTP 6 ô: dùng otp-inputs.js (trang auth — auth-footer.jsp)
  // (no extra JS needed - handled by :checked selector)
})();
