/* HIMACAKE — Admin Slideshow: ảnh desktop 1280×420 + ảnh mobile 800×500 (16:10) */
(function () {
  'use strict';

  var CROP_DESK = { aspect: 1280 / 420, outW: 1280, outH: 420, title: 'Cắt ảnh banner desktop', desc: 'Tỉ lệ 1280 × 420 (JPEG).' };
  var CROP_MOB = { aspect: 800 / 500, outW: 800, outH: 500, title: 'Cắt ảnh banner mobile', desc: 'Tỉ lệ 800 × 500, 16:10 — khớp slideshow điện thoại.' };
  var MIME = 'image/jpeg';
  var QUALITY = 0.92;

  var modal = null;
  var cropImg = null;
  var cropTitleEl = null;
  var cropDescEl = null;
  var cropper = null;
  var activeEditor = null;
  var activeCrop = CROP_DESK;
  var activeWhich = 'desk';
  var pendingObjectUrl = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    if (pendingObjectUrl) {
      URL.revokeObjectURL(pendingObjectUrl);
      pendingObjectUrl = null;
    }
    cropImg.removeAttribute('src');
    activeEditor = null;
    activeWhich = 'desk';
    activeCrop = CROP_DESK;
  }

  function initCropper() {
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropImg, {
      aspectRatio: activeCrop.aspect,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.92,
      responsive: true,
      background: false,
    });
  }

  function setModalCopy() {
    if (cropTitleEl) cropTitleEl.textContent = activeCrop.title;
    if (cropDescEl)
      cropDescEl.innerHTML =
        'Khung cố định <strong>' +
        Math.round(activeCrop.outW) +
        ' : ' +
        Math.round(activeCrop.outH) +
        '</strong>. Kéo ảnh, &plus;/&minus; để zoom; nhấn <strong>Dùng ảnh đã cắt</strong> để áp vào ô ' +
        (activeWhich === 'mob' ? 'mobile' : 'desktop') +
        ' (server chỉ nhận khi bạn bấm <strong>Lưu</strong>). ' +
        activeCrop.desc;
  }

  function applyCrop() {
    if (!cropper || !activeEditor) return;
    var canvas = cropper.getCroppedCanvas({
      width: activeCrop.outW,
      height: activeCrop.outH,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    if (!canvas) return;

    canvas.toBlob(
      function (blob) {
        if (!blob) return;
        var ed = activeEditor;
        var rank = ed.getAttribute('data-rank');
        var isMob = activeWhich === 'mob';
        var file = new File([blob], 'slide-' + rank + (isMob ? '-m' : '') + '.jpg', { type: MIME });
        var submitInput = ed.querySelector(isMob ? '.js-submit-file-mobile' : '.js-submit-file');
        var dt = new DataTransfer();
        dt.items.add(file);
        submitInput.files = dt.files;

        var preview = ed.querySelector(isMob ? '.js-preview-img-mobile' : '.js-preview-img');
        var placeholder = ed.querySelector(isMob ? '.js-preview-placeholder-mob' : '.js-preview-placeholder-desk');
        var url = URL.createObjectURL(blob);
        var dk = isMob ? 'previewMobBlobUrl' : 'previewBlobUrl';
        if (preview.dataset[dk]) URL.revokeObjectURL(preview.dataset[dk]);
        preview.dataset[dk] = url;
        preview.src = url;
        preview.style.display = '';
        if (placeholder) placeholder.hidden = true;

        var clearBtn = ed.querySelector(isMob ? '.js-clear-new-mobile' : '.js-clear-new');
        if (clearBtn) clearBtn.hidden = false;

        updateRatioBg(ed);
        closeModal();
      },
      MIME,
      QUALITY
    );
  }

  function onPickFile(editor, file, which) {
    if (!file || !/^image\/(jpeg|png|webp)/i.test(file.type)) {
      alert('Chọn file ảnh JPG, PNG hoặc WebP.');
      return;
    }
    activeEditor = editor;
    activeWhich = which;
    activeCrop = which === 'mob' ? CROP_MOB : CROP_DESK;
    setModalCopy();
    if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);
    pendingObjectUrl = URL.createObjectURL(file);
    cropImg.src = pendingObjectUrl;
    openModal();

    if (cropImg.complete) initCropper();
    else
      cropImg.onload = function () {
        cropImg.onload = null;
        initCropper();
      };
  }

  function updateRatioBg(editor) {
    var sel = editor.querySelector('.js-slide-bg-select');
    if (!sel) return;
    $all('.slide-editor__banner-col', editor).forEach(function (col) {
      var ratio = col.querySelector('.slide-editor__ratio');
      if (!ratio) return;
      var preview = col.querySelector('img.js-preview-img, img.js-preview-img-mobile');
      var ph = col.querySelector('.js-preview-placeholder-desk, .js-preview-placeholder-mob');
      var hasImg = preview && preview.getAttribute('src') && preview.style.display !== 'none';
      var showGrad = (ph && !ph.hidden && !hasImg) || !hasImg;
      ratio.style.background = showGrad ? sel.value || '' : '';
    });
  }

  function restoreOriginalPreview(editor, which) {
    var isMob = which === 'mob';
    var preview = editor.querySelector(isMob ? '.js-preview-img-mobile' : '.js-preview-img');
    var placeholder = editor.querySelector(isMob ? '.js-preview-placeholder-mob' : '.js-preview-placeholder-desk');
    var submitInput = editor.querySelector(isMob ? '.js-submit-file-mobile' : '.js-submit-file');
    var clearBtn = editor.querySelector(isMob ? '.js-clear-new-mobile' : '.js-clear-new');
    var orig = isMob
      ? editor.getAttribute('data-original-mobile-src') || ''
      : editor.getAttribute('data-original-src') || '';

    var dt = new DataTransfer();
    submitInput.files = dt.files;

    var dk = isMob ? 'previewMobBlobUrl' : 'previewBlobUrl';
    if (preview.dataset[dk]) {
      URL.revokeObjectURL(preview.dataset[dk]);
      delete preview.dataset[dk];
    }

    if (orig) {
      preview.src = orig;
      preview.style.display = '';
      if (placeholder) placeholder.hidden = true;
    } else {
      preview.removeAttribute('src');
      preview.style.display = 'none';
      if (placeholder) placeholder.hidden = false;
    }
    if (clearBtn) clearBtn.hidden = true;
    updateRatioBg(editor);
  }

  function bindBannerCol(editor, col, which) {
    var pick = col.querySelector('.js-pick-file');
    var btnOpen = col.querySelector('.js-open-crop');
    var btnClear = which === 'mob' ? col.querySelector('.js-clear-new-mobile') : col.querySelector('.js-clear-new');

    btnOpen.addEventListener('click', function () {
      pick.click();
    });
    pick.addEventListener('change', function () {
      var f = pick.files && pick.files[0];
      pick.value = '';
      if (f) onPickFile(editor, f, which);
    });
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        restoreOriginalPreview(editor, which);
      });
    }
  }

  function bindEditor(editor) {
    var deskCol = editor.querySelector('.slide-editor__banner-col--desk');
    var mobCol = editor.querySelector('.slide-editor__banner-col--mob');
    if (deskCol) bindBannerCol(editor, deskCol, 'desk');
    if (mobCol) bindBannerCol(editor, mobCol, 'mob');
    var bgSel = editor.querySelector('.js-slide-bg-select');
    if (bgSel) {
      bgSel.addEventListener('change', function () {
        updateRatioBg(editor);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    modal = document.getElementById('slideCropModal');
    cropImg = document.getElementById('slideCropImg');
    cropTitleEl = document.getElementById('slideCropTitle');
    cropDescEl = document.getElementById('slideCropDesc');
    if (!modal || !cropImg) return;

    $all('.slide-editor').forEach(bindEditor);
    $all('.slide-editor').forEach(updateRatioBg);

    modal.querySelector('.js-crop-cancel').addEventListener('click', closeModal);
    modal.querySelector('.js-crop-apply').addEventListener('click', applyCrop);
    modal.querySelector('.slide-crop-modal__backdrop').addEventListener('click', closeModal);

    modal.querySelector('[data-zoom="in"]').addEventListener('click', function () {
      if (cropper) cropper.zoom(0.08);
    });
    modal.querySelector('[data-zoom="out"]').addEventListener('click', function () {
      if (cropper) cropper.zoom(-0.08);
    });
    modal.querySelector('[data-rotate="left"]').addEventListener('click', function () {
      if (cropper) cropper.rotate(-90);
    });
    modal.querySelector('[data-rotate="right"]').addEventListener('click', function () {
      if (cropper) cropper.rotate(90);
    });
    modal.querySelector('[data-reset]').addEventListener('click', function () {
      if (cropper) cropper.reset();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  });
})();
