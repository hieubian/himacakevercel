/**
 * Bước 2 · content_sections JSON — văn bản thường (plain*) + bảng + khối mở rộng.
 * Không còn chỉnh / lưu body.data.html (đã loại khỏi admin và không ghi vào DB khi Lưu).
 */
(function () {
  var ctx = typeof window.__HIMC_SB_CTX__ === 'string' ? window.__HIMC_SB_CTX__ : '';

  function toEmbedVideoUrl(u) {
    if (!u) return '';
    u = String(u).trim();
    if (u.indexOf('embed') >= 0) return u;
    var m =
      u.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
      u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
      u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/) ||
      u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    var m2 = u.match(/^([a-zA-Z0-9_-]{11})$/);
    if (m2) return 'https://www.youtube.com/embed/' + m2[1];
    return u;
  }

  function sectionImgUrl(img) {
    if (!img) return '';
    var s = String(img);
    if (s.indexOf('data:') === 0) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return ctx.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
  }

  var bodyCore = null;
  var specsCore = null;
  var extras = [];
  var collapsed = {};

  function escAttr(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }
  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function trimStr(s) {
    return s == null ? '' : String(s).trim();
  }

  /** Chuẩn hoá legacy / migration: chỉ còn data.html trong DB → đưa sang plainIntro để PDP + lưu không mất nội dung. */
  function htmlToPlain(html) {
    if (html == null) return '';
    var s = String(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '');
    s = s
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return s.replace(/\n{3,}/g, '\n\n').trim();
  }

  function migrateLegacyHtmlToPlainFields(d) {
    if (!d) return;
    var hasPlain =
      trimStr(d.plainIntro) || trimStr(d.plainHighlights) || trimStr(d.plainCare);
    var h = trimStr(d.html);
    if (!hasPlain && h) {
      var t = htmlToPlain(h);
      if (!t)
        t = trimStr(String(h).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
      if (t) d.plainIntro = t;
    }
  }

  function ensureBodyShape(b) {
    if (!b.data) b.data = {};
    var d = b.data;
    if (d.plainIntro == null) d.plainIntro = '';
    if (d.plainHighlights == null) d.plainHighlights = '';
    if (d.plainCare == null) d.plainCare = '';
    migrateLegacyHtmlToPlainFields(d);
    delete d.html;
    return b;
  }

  function ensureSpecsShape(s) {
    if (!Array.isArray(s.data) || !s.data.length) {
      s.data = [{ key: '', keyVi: '', valueEn: '', valueVi: '' }];
    }
    return s;
  }

  function partitionFromArray(arr) {
    var bi = arr.findIndex(function (x) {
      return x.type === 'body';
    });
    var si = arr.findIndex(function (x) {
      return x.type === 'specs';
    });
    var b =
      bi >= 0
        ? ensureBodyShape(JSON.parse(JSON.stringify(arr[bi])))
        : {
            type: 'body',
            titleVi: '',
            titleEn: '',
            data: { plainIntro: '', plainHighlights: '', plainCare: '' }
          };
    var spec =
      si >= 0
        ? ensureSpecsShape(JSON.parse(JSON.stringify(arr[si])))
        : {
            type: 'specs',
            titleVi: '',
            titleEn: '',
            data: [{ key: '', keyVi: '', valueEn: '', valueVi: '' }]
          };
    var ex = arr.filter(function (_, i) {
      return i !== bi && i !== si;
    });
    return { body: b, specs: spec, extras: ex };
  }

  function bodyEffective() {
    if (!bodyCore) return false;
    var d = bodyCore.data || {};
    return (
      trimStr(d.plainIntro) ||
      trimStr(d.plainHighlights) ||
      trimStr(d.plainCare) ||
      trimStr(bodyCore.titleVi)
    );
  }

  function specsEffective() {
    if (!specsCore) return false;
    if (trimStr(specsCore.titleVi)) return true;
    var rows = specsCore.data || [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (trimStr(r.keyVi || r.key) || trimStr(r.valueVi || r.valueEn)) return true;
    }
    return false;
  }

  function sanitizeBodyForSave(sec) {
    if (sec.type !== 'body') return sec;
    var o = JSON.parse(JSON.stringify(sec));
    if (o.data) {
      migrateLegacyHtmlToPlainFields(o.data);
      delete o.data.html;
    }
    return o;
  }

  function bodySectionUseful(sec) {
    if (sec.type !== 'body') return true;
    var d = sec.data || {};
    return !!(
      trimStr(sec.titleVi) ||
      trimStr(d.plainIntro) ||
      trimStr(d.plainHighlights) ||
      trimStr(d.plainCare) ||
      trimStr(d.html)
    );
  }

  function rebuildOutputArray() {
    var out = [];
    if (bodyEffective()) out.push(sanitizeBodyForSave(bodyCore));
    if (specsEffective()) out.push(specsCore);
    for (var i = 0; i < extras.length; i++) {
      var ex = extras[i];
      if (ex.type === 'body') {
        var sb = sanitizeBodyForSave(ex);
        if (!bodySectionUseful(sb)) continue;
        out.push(sb);
      } else {
        out.push(ex);
      }
    }
    return out;
  }

  function hiddenEl() {
    return document.getElementById('productSectionsInput');
  }
  function containerEl() {
    return document.getElementById('sectionsContainer');
  }
  function simpleHostEl() {
    return document.getElementById('himacakeSimpleDescHost');
  }
  function emptyEl() {
    return document.getElementById('sectionsEmpty');
  }

  function sync() {
    var h = hiddenEl();
    if (h) {
      try {
        h.value = JSON.stringify(rebuildOutputArray());
      } catch (e) {
        h.value = '[]';
      }
    }
    var emsg = emptyEl();
    if (emsg) {
      var has = bodyEffective() || specsEffective() || extras.length > 0;
      emsg.style.display = has ? 'none' : 'block';
    }
  }

  function buildSpecsTableHTML(isCore) {
    var prefix = isCore ? 'himsb-core' : 'himsb-ex';
    var rows = isCore ? specsCore.data : [];
    var h =
      '<table class="himacake-sb-specs" id="' +
      prefix +
      '-specs"><thead><tr><th>Nhãn</th><th>Giá trị</th><th style="width:48px"></th></tr></thead><tbody id="' +
      prefix +
      '-specs-tbody">';
    rows.forEach(function (row, r) {
      var labelVal = row.keyVi || row.key || '';
      var textVal = row.valueVi || row.valueEn || '';
      h += '<tr>';
      h +=
        '<td><input type="text" value="' +
        escAttr(labelVal) +
        '" class="form-input" onchange="window._HIMC_SB.coreSpecRow(' +
        r +
        ",'label',this.value)\"></td>";
      h +=
        '<td><input type="text" value="' +
        escAttr(textVal) +
        '" class="form-input" onchange="window._HIMC_SB.coreSpecRow(' +
        r +
        ",'value',this.value)\"></td>";
      h +=
        '<td><button type="button" class="sb-ctrl-btn sb-ctrl-btn--danger" onclick="window._HIMC_SB.removeCoreSpec(' +
        r +
        ')">\u2715</button></td></tr>';
    });
    h += '</tbody></table>';
    h +=
      '<button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.addCoreSpec()">+ Dòng mới</button>';
    return h;
  }

  function buildSimpleCoreHTML() {
    var d = bodyCore.data || {};
    return (
      '<div class="himacake-simple-core">' +
      '<p class="text-soft" style="font-size:13px;line-height:1.55;margin:0 0 14px;">' +
      'Viết bằng chữ thường — xuống dòng thoải mái (hai dòng trống = đoạn mới). ' +
      '<strong>Lưu cùng bước 1:</strong> bấm <em>Lưu bước 1 · 2</em> dưới cùng.</p>' +
      '<div class="form-row"><label>Tiêu đề nhóm chi tiết (tùy chọn)</label>' +
      '<input type="text" class="form-input" id="himsb_body_title" value="' +
      escAttr(bodyCore.titleVi || '') +
      '" onchange="window._HIMC_SB.coreBodyTitle(this.value)" ' +
      'placeholder="Để trống nếu không cần"></div>' +
      '<div class="form-row"><label>Giới thiệu sản phẩm</label>' +
      '<textarea id="himsb_plain_intro" class="form-input" rows="5" style="font-family:inherit" ' +
      'onchange="window._HIMC_SB.corePlain(\'intro\',this.value)">' +
      escHtml(d.plainIntro || '') +
      '</textarea></div>' +
      '<div class="form-row"><label>Thành phần &amp; đặc điểm</label>' +
      '<textarea id="himsb_plain_highlights" class="form-input" rows="5" style="font-family:inherit" ' +
      'onchange="window._HIMC_SB.corePlain(\'highlights\',this.value)">' +
      escHtml(d.plainHighlights || '') +
      '</textarea></div>' +
      '<div class="form-row"><label>Bảo quản / hướng dẫn / lưu ý</label>' +
      '<textarea id="himsb_plain_care" class="form-input" rows="5" style="font-family:inherit" ' +
      'onchange="window._HIMC_SB.corePlain(\'care\',this.value)">' +
      escHtml(d.plainCare || '') +
      '</textarea></div>' +
      '<div class="ap-card" style="margin-top:14px;background:#fafafa;border-style:dashed">' +
      '<div class="ap-card-head" style="border:none;background:transparent;padding-bottom:0">Thông số nhanh (bảng)</div>' +
      '<div class="form-row"><label>Tiêu đề bảng</label>' +
      '<input type="text" class="form-input" id="himsb_specs_title" value="' +
      escAttr(specsCore.titleVi || '') +
      '" onchange="window._HIMC_SB.coreSpecsTitle(this.value)" ' +
      'placeholder="vd. Giá catalogue, SKU…"></div>' +
      '<div style="overflow-x:auto">' +
      buildSpecsTableHTML(true) +
      '</div></div></div>'
    );
  }

  function buildSectionHTML(sec, i) {
    var icons = {
      body: '\ud83d\udcdd',
      specs: '\ud83d\udccb',
      feature: '\ud83d\uddbc\ufe0f',
      gallery: '\ud83c\udfa8',
      video: '\ud83c\udfac'
    };
    var labels = {
      body: 'M\u00f4 t\u1ea3 (ph\u1ee5)',
      specs: 'B\u1ea3ng (ph\u1ee5)',
      feature: '\u0110i\u1ec3m n\u1ed5i b\u1eadt',
      gallery: 'Album \u1ea3nh',
      video: 'Video'
    };
    var isCollapsed = collapsed[i];
    var headPart = escHtml(sec.titleVi || sec.titleEn || '');
    var h = '<div class="sb-section" data-ex-idx="' + i + '">';
    h += '<div class="sb-section__header" draggable="true"';
    h +=
      ' ondragstart="window._HIMC_SB.dragStart(event,' +
      i +
      ')" ondragover="window._HIMC_SB.dragOver(event)" ondrop="window._HIMC_SB.drop(event,' +
      i +
      ')">';
    h += '<span class="sb-section__type"><span class="sb-section__type-icon">' + (icons[sec.type] || '') + '</span>' + (labels[sec.type] || sec.type);
    if (headPart) h += ' <span style="color:#6b7280;font-weight:400">\u2014 ' + headPart + '</span>';
    h += '</span><div class="sb-section__controls">';
    h += '<button type="button" class="sb-ctrl-btn" onclick="window._HIMC_SB.toggle(' + i + ')">' + (isCollapsed ? '\u25bc' : '\u25b2') + '</button>';
    if (i > 0) h += '<button type="button" class="sb-ctrl-btn" onclick="window._HIMC_SB.move(' + i + ',-1)">\u2191</button>';
    if (i < extras.length - 1) h += '<button type="button" class="sb-ctrl-btn" onclick="window._HIMC_SB.move(' + i + ',1)">\u2193</button>';
    h +=
      '<button type="button" class="sb-ctrl-btn sb-ctrl-btn--danger" onclick="window._HIMC_SB.remove(' + i + ')">&#10005;</button>';
    h += '</div></div>';
    h += '<div class="sb-section__body' + (isCollapsed ? ' sb-section__body--collapsed' : '') + '">';
    h +=
      '<div class="himacake-sb-titles">' +
      '<div class="form-row"><label>Ti\u00eau \u0111\u1ec1 kh\u1ed1i</label>' +
      '<input type="text" class="form-input" value="' +
      escAttr(sec.titleVi || sec.titleEn || '') +
      '" onchange="window._HIMC_SB.setTitleVi(' +
      i +
      ',this.value)"></div>' +
      '</div>';

    if (sec.type === 'specs') h += buildSpecsExtraUI(sec, i);
    else if (sec.type === 'feature') h += buildFeatureUI(sec, i);
    else if (sec.type === 'gallery') h += buildGalleryUI(sec, i);
    else if (sec.type === 'video') h += buildVideoUI(sec, i);

    h += '</div></div>';
    return h;
  }

  function buildSpecsExtraUI(sec, i) {
    var h =
      '<table class="himacake-sb-specs"><thead><tr><th>Nhãn</th><th>Giá trị</th><th style="width:48px"></th></tr></thead><tbody>';
    (sec.data || []).forEach(function (row, r) {
      var labelVal = row.keyVi || row.key || '';
      var textVal = row.valueVi || row.valueEn || '';
      h += '<tr>';
      h +=
        '<td><input type="text" value="' +
        escAttr(labelVal) +
        '" class="form-input" onchange="window._HIMC_SB.updateSpecExtra(' +
        i +
        ',' +
        r +
        ",'label',this.value)\"></td>";
      h +=
        '<td><input type="text" value="' +
        escAttr(textVal) +
        '" class="form-input" onchange="window._HIMC_SB.updateSpecExtra(' +
        i +
        ',' +
        r +
        ",'value',this.value)\"></td>";
      h +=
        '<td><button type="button" class="sb-ctrl-btn sb-ctrl-btn--danger" onclick="window._HIMC_SB.removeSpecExtra(' +
        i +
        ',' +
        r +
        ')">\u2715</button></td></tr>';
    });
    h += '</tbody></table>';
    h +=
      '<button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.addSpecExtra(' +
      i +
      ')">+ Dòng mới</button>';
    return h;
  }

  function buildFeatureUI(sec, i) {
    var d = sec.data || {};
    var bodyHtml = d.textVi || d.textEn || '';
    var h =
      '<div class="himacake-sb-feature-texts">' +
      '<div class="form-row"><label>N\u1ed9i dung (cho ph\u00e9p HTML \u0111\u01a1n gi\u1ea3n)</label>' +
      '<textarea class="form-input" rows="4" onchange="window._HIMC_SB.setFeatureBody(' +
      i +
      ',this.value)">' +
      escHtml(bodyHtml) +
      '</textarea></div></div>';
    h +=
      '<div class="himacake-sb-feature-tools"><label>B\u1ed1 c\u1ee5c \u1ea3nh</label><select class="form-input" style="max-width:280px" onchange="window._HIMC_SB.updateFeature(' +
      i +
      ",'layout',this.value)\">";
    var layoutLabels = { left: '\u1ea2nh b\u00ean tr\u00e1i', right: '\u1ea2nh b\u00ean ph\u1ea3i', full: '\u1ea2nh to\u00e0n khung' };
    ['left', 'right', 'full'].forEach(function (v) {
      h +=
        '<option value="' +
        v +
        '"' +
        ((d.layout || 'left') === v ? ' selected' : '') +
        '>' +
        (layoutLabels[v] || v) +
        '</option>';
    });
    h += '</select></div>';

    if (d.image) {
      h +=
        '<div class="himacake-sb-imgrow"><img src="' +
        escAttr(sectionImgUrl(d.image)) +
        '" alt=""><button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.pickFeatureImage(' +
        i +
        ')">\u0110\u1ed5i \u1ea3nh</button>' +
        '<button type="button" class="sb-ctrl-btn sb-ctrl-btn--danger" onclick="window._HIMC_SB.updateFeature(' +
        i +
        ",'image','');window._HIMC_SB.render();\">\u2715</button></div>";
    } else {
      h +=
        '<div class="himacake-sb-imgrow">' +
        '<button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.pickFeatureImage(' +
        i +
        ')">+ Ch\u1ecdn file</button>' +
        '<span class="text-soft" style="font-size:12px;margin-left:8px"> ho\u1eb7c d\u00e1n \/uploads\/...</span>' +
        '</div>';
      h +=
        '<div class="form-row"><label style="font-size:12px">\u0110\u01b0\u1eddng d\u1eabn \u1ea3nh</label>' +
        '<input type="text" class="form-input" value="' +
        escAttr(d.image || '') +
        '" onchange="window._HIMC_SB.updateFeature(' +
        i +
        ",'image',this.value);window._HIMC_SB.render();\"></div>";
    }
    return h;
  }

  function buildGalleryUI(sec, i) {
    var imgs = sec.data || [];
    var h = '<div class="himacake-sb-gallery">';
    imgs.forEach(function (img, g) {
      h +=
        '<div class="himacake-sb-gitem"><span class="himacake-sb-gitem__x" onclick="window._HIMC_SB.removeGalleryImg(' +
        i +
        ',' +
        g +
        ')">\u2715</span><img src="' +
        escAttr(sectionImgUrl(img)) +
        '" alt=""></div>';
    });
    h += '</div>';
    h +=
      '<button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.pickGalleryImages(' +
      i +
      ')">+ Th\u00eam \u1ea3nh</button>' +
      '<p class="text-soft" style="font-size:12px;margin:8px 0 0">Ho\u1eb7c copy \u0111\u01b0\u1eddng d\u1eabn \u0111\u00e3 upload \u1edf tab \u1ea2nh.</p>';
    return h;
  }

  function buildVideoUI(sec, i) {
    var d = sec.data || {};
    var h =
      '<div class="form-row"><label>Li\u00ean k\u1ebft YouTube</label>' +
      '<input type="text" class="form-input" value="' +
      escAttr(d.url || '') +
      '" onchange="window._HIMC_SB.updateVideoUrl(' +
      i +
      ',this.value)" placeholder="Link watch, youtu.be ho\u1eb7c ID">';
    if (d.url) {
      var embed = escAttr(toEmbedVideoUrl(d.url));
      h +=
        '<div class="himacake-sb-video-preview"><iframe title="Xem tr\u01b0\u1edbc" src="' +
        embed +
        '" allowfullscreen></iframe></div>';
    }
    h +=
      '</div><div class="form-row"><label>\u1ea2nh b\u00eca (t\u00f9y ch\u1ecdn)</label>' +
      '<input type="text" class="form-input" value="' +
      escAttr(typeof d.poster === 'string' && d.poster.indexOf('data:') !== 0 ? d.poster : '') +
      '" onchange="window._HIMC_SB.updateVideoPosterStr(' +
      i +
      ',this.value)"></div>';

    if (d.poster) {
      h +=
        '<div class="himacake-sb-imgrow"><img src="' +
        escAttr(sectionImgUrl(d.poster)) +
        '" alt="" style="max-width:260px">';
      if (String(d.poster).indexOf('data:') === 0) {
        h +=
          '<button type="button" class="sb-ctrl-btn sb-ctrl-btn--danger" onclick="window._HIMC_SB.updatePoster(' +
          i +
          ",'');window._HIMC_SB.render();\">\u2715</button>";
      }
    } else {
      h +=
        '<button type="button" class="btn btn-outline btn-small" onclick="window._HIMC_SB.pickVideoPoster(' +
        i +
        ')">T\u1ea3i \u1ea3nh b\u00eca</button>';
    }
    return h;
  }

  var pendingCb = null;
  var galIdx = null;
  var vidPosterIdx = null;
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.documentElement.appendChild(fileInput);

  fileInput.addEventListener('change', function () {
    if (!this.files[0]) return;
    if (pendingCb) {
      var r = new FileReader();
      r.onload = function (e) {
        pendingCb(e.target.result);
        pendingCb = null;
      };
      r.readAsDataURL(this.files[0]);
      this.value = '';
      return;
    }
    if (vidPosterIdx !== null) {
      var rr = new FileReader();
      var idx = vidPosterIdx;
      vidPosterIdx = null;
      rr.onload = function (e) {
        extras[idx].data.poster = e.target.result;
        render();
      };
      rr.readAsDataURL(this.files[0]);
      this.value = '';
      return;
    }
    this.value = '';
  });

  var multiInput = document.createElement('input');
  multiInput.type = 'file';
  multiInput.accept = 'image/*';
  multiInput.multiple = true;
  multiInput.style.display = 'none';
  document.documentElement.appendChild(multiInput);
  multiInput.addEventListener('change', function () {
    if (galIdx === null) return;
    var si = galIdx;
    galIdx = null;
    var files = Array.from(this.files || []);
    this.value = '';
    if (!files.length) return;
    if (!extras[si].data) extras[si].data = [];
    var todo = files.length;

    files.forEach(function (f) {
      var reader = new FileReader();
      reader.onload = function (e) {
        extras[si].data.push(e.target.result);
        todo--;
        if (todo <= 0) render();
      };
      reader.readAsDataURL(f);
    });
  });

  function render() {
    var host = simpleHostEl();
    if (host) host.innerHTML = buildSimpleCoreHTML();

    var c = containerEl();
    if (!c) {
      sync();
      return;
    }
    if (!extras.length) {
      c.innerHTML =
        '<p class="text-soft" style="font-size:13px;margin:0">Kh\u00f4ng c\u00f3 kh\u1ed1i m\u1edf r\u1ed9ng. D\u00f9ng c\u00e1c n\u00fat b\u00ean d\u01b0\u1edbi khi c\u1ea7n \u0111\u00fan \u0111\u1eb7ng th\u00eam hay video trong m\u00f4 t\u1ea3.</p>';
      sync();
      return;
    }
    c.innerHTML = '';
    extras.forEach(function (sec, i) {
      var el = document.createElement('div');
      el.innerHTML = buildSectionHTML(sec, i);
      while (el.firstChild) c.appendChild(el.firstChild);
    });
    sync();
  }

  window._HIMC_SB = {
    dragIdx: null,

    coreBodyTitle: function (val) {
      bodyCore.titleVi = val != null ? String(val) : '';
      bodyCore.titleEn = '';
      sync();
    },
    corePlain: function (k, val) {
      if (!bodyCore.data) bodyCore.data = {};
      var key = k === 'intro' ? 'plainIntro' : k === 'highlights' ? 'plainHighlights' : 'plainCare';
      bodyCore.data[key] = val == null ? '' : String(val);
      sync();
    },
    coreSpecsTitle: function (val) {
      specsCore.titleVi = val != null ? String(val) : '';
      specsCore.titleEn = '';
      sync();
    },
    coreSpecRow: function (r, kind, val) {
      var row = specsCore.data[r];
      if (!row) return;
      if (kind === 'label') {
        row.keyVi = val;
        row.key = val;
      } else {
        row.valueVi = val;
        row.valueEn = val;
      }
      sync();
    },
    addCoreSpec: function () {
      specsCore.data.push({ key: '', keyVi: '', valueEn: '', valueVi: '' });
      render();
    },
    removeCoreSpec: function (r) {
      if (specsCore.data.length <= 1) {
        specsCore.data[r] = { key: '', keyVi: '', valueEn: '', valueVi: '' };
        render();
        return;
      }
      specsCore.data.splice(r, 1);
      render();
    },

    remove: function (i) {
      if (!confirm('X\u00f3a kh\u1ed1i n\u00e0y?')) return;
      extras.splice(i, 1);
      render();
    },
    toggle: function (i) {
      collapsed[i] = !collapsed[i];
      render();
    },
    move: function (i, dir) {
      var j = i + dir;
      if (j < 0 || j >= extras.length) return;
      var t = extras[i];
      extras[i] = extras[j];
      extras[j] = t;
      render();
    },
    setTitleVi: function (i, val) {
      extras[i].titleVi = val;
      extras[i].titleEn = '';
      sync();
    },
    addSpecExtra: function (i) {
      extras[i].data.push({ key: '', keyVi: '', valueEn: '', valueVi: '' });
      render();
    },
    removeSpecExtra: function (i, r) {
      extras[i].data.splice(r, 1);
      render();
    },
    updateSpecExtra: function (i, r, kind, val) {
      var row = extras[i].data[r];
      if (!row) return;
      if (kind === 'label') {
        row.keyVi = val;
        row.key = val;
      } else {
        row.valueVi = val;
        row.valueEn = val;
      }
      sync();
    },

    updateSpecVi: function (i, r, key, val) {
      extras[i].data[r][key] = val;
      sync();
    },
    addSpec: function () {
      /* legacy no-op stub */
      sync();
    },

    add: function (type) {
      var sec = { type: type, titleEn: '', titleVi: '', data: null };
      if (type === 'specs') sec.data = [{ key: '', keyVi: '', valueEn: '', valueVi: '' }];
      else if (type === 'feature') sec.data = { textEn: '', textVi: '', image: '', layout: 'left' };
      else if (type === 'gallery') sec.data = [];
      else if (type === 'video') sec.data = { url: '', poster: '' };
      extras.push(sec);
      render();
    },

    setFeatureBody: function (i, val) {
      if (!extras[i].data) extras[i].data = {};
      extras[i].data.textVi = val;
      extras[i].data.textEn = '';
      sync();
    },
    updateFeature: function (i, key, val) {
      extras[i].data[key] = val;
      sync();
    },
    pickFeatureImage: function (i) {
      vidPosterIdx = null;
      galIdx = null;
      pendingCb = function (dataUrl) {
        extras[i].data.image = dataUrl;
        render();
      };
      fileInput.click();
    },
    pickGalleryImages: function (i) {
      pendingCb = null;
      vidPosterIdx = null;
      galIdx = i;
      multiInput.click();
    },
    removeGalleryImg: function (i, g) {
      extras[i].data.splice(g, 1);
      render();
    },
    updateVideoUrl: function (i, val) {
      extras[i].data.url = String(val || '').trim();
      sync();
      render();
    },
    updatePoster: function (i, v) {
      extras[i].data.poster = v;
      sync();
      render();
    },
    updateVideoPosterStr: function (i, s) {
      extras[i].data.poster = String(s || '').trim();
      sync();
      render();
    },
    pickVideoPoster: function (i) {
      pendingCb = null;
      vidPosterIdx = i;
      fileInput.click();
    },

    flushDomToModel: function () {
      var ti = document.getElementById('himsb_body_title');
      if (ti && bodyCore) bodyCore.titleVi = ti.value;
      var specsTi = document.getElementById('himsb_specs_title');
      if (specsTi && specsCore) specsCore.titleVi = specsTi.value;

      var map = [
        ['himsb_plain_intro', 'plainIntro'],
        ['himsb_plain_highlights', 'plainHighlights'],
        ['himsb_plain_care', 'plainCare']
      ];
      if (!bodyCore.data) bodyCore.data = {};
      map.forEach(function (p) {
        var el = document.getElementById(p[0]);
        if (el) bodyCore.data[p[1]] = el.value != null ? String(el.value) : '';
      });
      delete bodyCore.data.html;

      var tbody = document.getElementById('himsb-core-specs-tbody');
      if (tbody && specsCore.data) {
        var inputs = tbody.querySelectorAll('input[type=text]');
        specsCore.data.forEach(function (row, r) {
          var i0 = inputs[r * 2];
          var i1 = inputs[r * 2 + 1];
          if (i0) {
            row.keyVi = i0.value;
            row.key = i0.value;
          }
          if (i1) {
            row.valueVi = i1.value;
            row.valueEn = i1.value;
          }
        });
      }
    },

    dragStart: function (e, i) {
      this.dragIdx = i;
      e.dataTransfer.effectAllowed = 'move';
    },
    dragOver: function (e) {
      e.preventDefault();
    },
    drop: function (e, i) {
      e.preventDefault();
      var fi = this.dragIdx;
      this.dragIdx = null;
      if (fi === null || fi === i) return;
      var item = extras.splice(fi, 1)[0];
      extras.splice(i, 0, item);
      render();
    },
    render: render,
    load: function (data) {
      var arr = [];
      try {
        arr = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        arr = [];
      }
      if (!Array.isArray(arr)) arr = [];

      var part = partitionFromArray(arr);
      bodyCore = part.body;
      specsCore = part.specs;
      extras = part.extras.filter(function (sec) {
        if (sec.type !== 'body') return true;
        if (!sec.data) sec.data = {};
        migrateLegacyHtmlToPlainFields(sec.data);
        delete sec.data.html;
        return bodySectionUseful(sec);
      });

      collapsed = {};
      render();
    },
    sync: sync,
    getSections: function () {
      return rebuildOutputArray();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSB);
  else initSB();

  function initSB() {
    var inp = hiddenEl();
    if (!inp || inp.__himacSbInitDone) return;
    inp.__himacSbInitDone = true;

    window._HIMC_SB.load(inp.value || '[]');
    var fm = document.getElementById('formMain');
    if (fm) {
      var syncSectionsOnSave = function () {
        window._HIMC_SB.flushDomToModel();
        sync();
      };
      fm.addEventListener('submit', syncSectionsOnSave, true);
      fm.addEventListener('formdata', syncSectionsOnSave, true);
    }
  }
})();
