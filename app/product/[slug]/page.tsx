'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import productsData from '../../../data/products.json';
import categoriesData from '../../../data/categories.json';
import productVariantsData from '../../../data/product_variants.json';
import productAttributesData from '../../../data/product_attributes.json';
import attributesData from '../../../data/attributes.json';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const productRaw = productsData.find((p: any) => p.slug === slug);
  if (!productRaw) return notFound();

  const category = categoriesData.find((c: any) => c.id === productRaw.category_id);
  
  const variants = productVariantsData
    .filter((v: any) => v.product_id === productRaw.id && v.status)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
    
  const hasVariants = variants.length > 0;
  
  const attributesLinks = productAttributesData.filter((pa: any) => pa.product_id === productRaw.id);
  const productAttributes = attributesLinks.map((pa: any) => {
    const attr = attributesData.find((a: any) => a.id === pa.attribute_id);
    return { ...pa, attributeName: attr ? attr.name : '' };
  });

  const product = {
    ...productRaw,
    hasVariants,
    variants,
    attributes: productAttributes,
    displayPrice: hasVariants ? variants[0].sale_price || variants[0].price : productRaw.sale_price || productRaw.price,
    totalDisplayStockUnits: hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.stock > 0 ? v.stock : 0), 0) : productRaw.stock,
    // assuming images was a separate table, but we don't have product_images in our extract right now.
    // we use main_image.
    images: [] as any[]
  };

  const heroImg = (hasVariants && variants[0].image_url) ? variants[0].image_url : product.main_image;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  useEffect(() => {
    // This script replaces the vanilla script from the original JSP to render content_sections.
    const sectionsRawEl = document.getElementById('himacakeSectionsJsonRaw') as HTMLTextAreaElement;
    const anchor = document.getElementById('himacakeContentSectionsAnchor');
    const emptyNote = document.getElementById('himacakeDescEmptyNote');

    if (!anchor || !anchor.parentNode) return;

    // To prevent duplicate rendering on fast refresh
    if (anchor.parentNode.querySelector('.himacake-pcs')) {
      const existing = anchor.parentNode.querySelectorAll('.himacake-pcs');
      existing.forEach(e => e.remove());
    }

    const tc = (s: any) => s == null ? '' : String(s).trim();
    const showEmptyIfNeeded = (show: boolean) => { if (emptyNote) emptyNote.style.display = show ? 'block' : 'none'; };

    const toEmbed = (url: string) => {
      if (!url) return '';
      const u = String(url).trim();
      if (u.indexOf('embed') >= 0) return u.split('&')[0];
      let m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) || u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/) || u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
      if (m) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
      m = /^([a-zA-Z0-9_-]{11})$/.exec(u);
      if (m) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
      return u;
    };

    const resolveImg = (img: string) => {
      if (!img) return '';
      const s = String(img);
      if (s.indexOf('data:') === 0 || s.indexOf('http://') === 0 || s.indexOf('https://') === 0) return s;
      let ns = String(s).trim();
      while (ns.charAt(0) === '/') ns = ns.substring(1);
      return '/' + ns;
    };

    const escText = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const plainToHtmlBody = (s: string) => {
      const t = String(s || '').trim();
      if (!t) return '';
      return t.split(/\\n\\n+/).filter(p => p.trim().length).map(p => '<p>' + escText(p).replace(/\\n/g, '<br>') + '</p>').join('');
    };

    const specsRowsMeaningful = (data: any) => {
      if (!data || !data.length) return false;
      for (let i = 0; i < data.length; i++) {
        if (tc(data[i].keyVi || data[i].key) || tc(data[i].valueVi || data[i].valueEn)) return true;
      }
      return false;
    };

    const sectionRenderable = (sec: any) => {
      if (!sec || !sec.type) return false;
      const t0 = tc(sec.titleVi || sec.titleEn);
      if (sec.type === 'body') {
        const d = sec.data || {};
        return !!(tc(d.plainIntro) || tc(d.plainHighlights) || tc(d.plainCare) || tc(d.html) || t0);
      }
      if (sec.type === 'specs') return !!(t0 || specsRowsMeaningful(sec.data));
      if (sec.type === 'feature') {
        const fd = sec.data || {};
        return !!(t0 || tc(fd.textVi || fd.textEn) || fd.image);
      }
      if (sec.type === 'gallery') return !!(sec.data && sec.data.length && sec.data.some(Boolean));
      if (sec.type === 'video') {
        const vd = sec.data || {};
        return !!(t0 || tc(vd.url) || vd.poster);
      }
      return false;
    };

    try {
      let arr = [];
      if (sectionsRawEl) {
        const blob = tc(sectionsRawEl.value || sectionsRawEl.textContent || '');
        if (blob) {
          try { arr = JSON.parse(blob); } catch(e) {}
          if (!Array.isArray(arr)) arr = [];
        }
      }

      const host = document.createElement('section');
      host.className = 'himacake-pcs';

      if (arr.length) {
        arr.forEach((sec: any) => {
          if (!sectionRenderable(sec)) return;
          const blk = document.createElement('article');
          blk.className = 'himacake-pcs-block';
          
          const t = sec.titleVi || sec.titleEn || '';
          if (t) {
            const hh = document.createElement('div');
            hh.className = 'himacake-pcs-head';
            hh.textContent = t;
            blk.appendChild(hh);
          }

          if (sec.type === 'specs' && sec.data && specsRowsMeaningful(sec.data)) {
            const tb = document.createElement('table');
            tb.className = 'himacake-pcs-specs';
            sec.data.forEach((row: any) => {
              const lk = tc(row.keyVi || row.key), lv = tc(row.valueVi || row.valueEn);
              if (!lk && !lv) return;
              const tr = document.createElement('tr');
              const th = document.createElement('th'), td = document.createElement('td');
              th.textContent = lk || '\u2014'; td.textContent = lv || '\u2014';
              tr.appendChild(th); tr.appendChild(td); tb.appendChild(tr);
            });
            blk.appendChild(tb);
          } else if (sec.type === 'feature' && sec.data) {
            const fd = sec.data || {}, fv = fd.textVi || fd.textEn || '', lt = fd.layout || 'left';
            const wrap = document.createElement('div');
            wrap.className = 'himacake-pcs-feature himacake-pcs-feature--' + lt + (lt === 'full' ? ' himacake-pcs-feature--full' : lt === 'right' ? ' himacake-pcs-feature--right' : ' himacake-pcs-feature--left');
            if (fd.image) {
              const fig = document.createElement('div');
              fig.className = 'himacake-pcs-fimg' + (lt === 'full' ? '' : ' himacake-pcs-fimg--side');
              const im = document.createElement('img'); im.loading = 'lazy'; im.src = resolveImg(fd.image);
              fig.appendChild(im); wrap.appendChild(fig);
            }
            const prose = document.createElement('div');
            prose.className = 'himacake-pcs-fbody richtext'; prose.innerHTML = fv || '';
            wrap.appendChild(prose); blk.appendChild(wrap);
          } else if (sec.type === 'body' && sec.data) {
            const bd = sec.data, plainIntro = tc(bd.plainIntro), plainHigh = tc(bd.plainHighlights), plainCare = tc(bd.plainCare);
            const hasPlain = plainIntro.length || plainHigh.length || plainCare.length;
            if (hasPlain) {
              [[plainIntro, 'Giới thiệu'], [plainHigh, 'Thành phần và đặc điểm'], [plainCare, 'Bảo quản và lưu ý']].forEach((pair: any) => {
                if (!pair[0].length) return;
                const sh = document.createElement('div'); sh.className = 'himacake-pcs-head'; sh.style.fontSize = '1.05rem'; sh.textContent = pair[1];
                const dv = document.createElement('div'); dv.className = 'himacake-pcs-body richtext'; dv.innerHTML = plainToHtmlBody(pair[0]);
                blk.appendChild(sh); blk.appendChild(dv);
              });
            }
            const rawHtml = tc(bd.html);
            if (rawHtml.length) {
              const bodyEl = document.createElement('div'); bodyEl.className = 'himacake-pcs-body richtext' + (hasPlain ? ' himacake-pcs-body--addon' : '');
              bodyEl.innerHTML = rawHtml; blk.appendChild(bodyEl);
            }
          } else if (sec.type === 'gallery' && sec.data && sec.data.length) {
            const gd = document.createElement('div'); gd.className = 'himacake-pcs-galGrid';
            sec.data.forEach((im: any) => {
              if (!im) return;
              const iw = document.createElement('img'); iw.loading = 'lazy'; iw.src = resolveImg(im);
              gd.appendChild(iw);
            });
            blk.appendChild(gd);
          } else if (sec.type === 'video' && sec.data) {
            const vd = sec.data || {};
            if (vd.url) {
              const ew = document.createElement('div'); ew.className = 'himacake-pcs-videoWrap';
              const ifrm = document.createElement('iframe'); ifrm.setAttribute('allowfullscreen', ''); ifrm.setAttribute('loading', 'lazy');
              ifrm.src = toEmbed(vd.url); ew.appendChild(ifrm); blk.appendChild(ew);
            }
          }
          host.appendChild(blk);
        });
      }

      anchor.parentNode.insertBefore(host, anchor);

      const hasRenderedBlocks = host.childElementCount > 0;
      const fb = tc(anchor.getAttribute('data-fallback-desc'));
      showEmptyIfNeeded(!hasRenderedBlocks && fb.length === 0);
    } catch (e) {
      showEmptyIfNeeded(true);
    }
    
    // trigger tabs logic from main.js if needed by dispatching DOMContentLoaded or just letting it run.
  }, [product.content_sections]);

  return (
    <div className="container">
      <style dangerouslySetInnerHTML={{__html: `
        .himacake-pcs { margin-top: 28px; }
        .himacake-pcs-head { margin: 22px 0 12px; font-size: 1.125rem; font-weight: 700; color: var(--color-text-main,#1a1a1f); letter-spacing:.02em; }
        .himacake-pcs-block { margin-bottom: 28px; }
        .himacake-pcs-specs { width:100%;border-collapse:collapse;font-size:14px;margin:.5rem 0 0;border:1px solid rgba(26,26,31,.08);border-radius:10px;overflow:hidden; }
        .himacake-pcs-specs th, .himacake-pcs-specs td { border-bottom: 1px solid rgba(26,26,31,.06); padding: 10px 12px; text-align:left; vertical-align: top; }
        .himacake-pcs-specs tr:last-child th, .himacake-pcs-specs tr:last-child td { border-bottom: none; }
        .himacake-pcs-specs th { background: #faf9f8; width: min(240px, 38%); color: var(--color-text-soft,#5c5f69); font-weight: 600; }
        .himacake-pcs-feature { display:flex;gap:clamp(14px,2.5vw,28px);align-items:flex-start;margin-top:14px;}
        .himacake-pcs-feature--left { flex-direction:row; }
        .himacake-pcs-feature--right { flex-direction: row-reverse; }
        .himacake-pcs-feature--full { flex-direction: column; align-items: stretch; }
        .himacake-pcs-feature--full .himacake-pcs-fimg{margin-bottom:12px;width:100%;}
        .himacake-pcs-fimg img { border-radius: 12px; border: 1px solid rgba(26,26,31,.06); background:#fafafa;display:block;margin:0 auto; max-width: 100%; }
        .himacake-pcs-fimg--side { flex: none; width: min(340px, 46%); max-width: 100%; }
        .himacake-pcs-fbody.richtext { line-height: 1.75; flex: 1; min-width: 0; }
        .himacake-pcs-body.richtext { line-height: 1.75; margin-top: 8px; }
        .himacake-pcs-body.richtext p:first-child { margin-top: 0; }
        .himacake-pcs-body--addon { margin-top: 1.15rem; padding-top: 1rem; border-top: 1px solid rgba(26,26,31,.06); }
        .himacake-pdt-attrsbelow { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(26,26,31,.08); }
        @media (max-width: 640px) {
          .himacake-pcs-feature--left, .himacake-pcs-feature--right { flex-direction:column; }
          .himacake-pcs-fimg--side { width:100%; }
        }
        .himacake-pcs-galGrid { display:grid; gap:12px; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); margin-top: 12px; }
        .himacake-pcs-galGrid img { width:100%; height: 148px; object-fit:cover; border-radius: 10px; border: 1px solid rgba(26,26,31,.06); background: #fafafa; }
        .himacake-pcs-videoWrap { aspect-ratio:16/9; max-width: 920px; border-radius: 12px; overflow: hidden; background: #111; margin-top: 12px; }
        .himacake-pcs-videoWrap iframe { width:100%; height:100%; border: none; display:block;}
        .himacake-pcs-posterBelow { margin-top:12px;display:block;text-align:center; }
        .himacake-pcs-posterBelow img { max-width: 100%; border-radius: 12px;}
      `}} />

      <div className="breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className="sep">/</span>
        {category ? <Link href={`/collections/${category.slug}`}>{category.name}</Link> : <Link href="/products">Sản phẩm</Link>}
        <span className="sep">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-gallery" data-gallery="" data-default-main={heroImg}>
          <div className="main">
            <img src={heroImg || '/assets/images/placeholder.svg'} alt={product.name} id="mainImg" data-initial-src={heroImg} />
          </div>
        </div>

        <div className="product-info">
          <div className="product-card__cat">{category ? category.name : ''}</div>
          <h1>{product.name}</h1>

          <div className="price" id="detailPriceWrap">
            <span id="detailPrice">{formatPrice(product.displayPrice)}₫</span>
            {product.sale_price != null && (
              <span id="detailPriceOld" className="old">{formatPrice(product.price)}₫</span>
            )}
          </div>

          {product.short_description && (
            <p style={{fontSize:'var(--fs-15)', color:'var(--color-text-soft)', lineHeight:1.7}}>{product.short_description}</p>
          )}

          <div className="product-meta">
            <div><strong>SKU:</strong> {product.sku}</div>
            <div><strong>Lượt xem:</strong> {formatPrice(product.view_count)}</div>
          </div>

          <form id="addToCartForm" method="post" action="/cart/add" onSubmit={(e) => e.preventDefault()}
                data-product-stock={product.stock}
                data-total-display-stock={product.totalDisplayStockUnits}>
            <input type="hidden" name="productId" value={product.id}/>

            {hasVariants && (
              <div>
                <strong style={{display:'block', marginBottom:'8px'}}>Chọn tùy chọn:</strong>
                <div className="variant-list" role="radiogroup" aria-label="Biến thể sản phẩm">
                  {variants.map((v: any, vs: number) => {
                    const effStk = (product.stock <= 0 || v.stock <= 0) ? 0 : (product.stock < v.stock ? product.stock : v.stock);
                    return (
                      <div key={v.id} style={{display:'inline-block'}}>
                        <input type="radio" id={`v${v.id}`} name="variantId" value={v.id} defaultChecked={vs === 0}
                          data-display={v.sale_price || v.price} data-list={v.sale_price ? v.price : ''}
                          data-image-url={v.image_url || ''} data-gallery-idx={vs} data-stock={effStk} />
                        <label htmlFor={`v${v.id}`} className="variant-pill">
                          <span className="variant-pill__media" aria-hidden="true">
                            {v.image_url ? (
                              <img src={v.image_url} alt="" width="120" height="120" decoding="async" loading="lazy" />
                            ) : (
                              <span className="variant-pill__placeholder">Ảnh</span>
                            )}
                          </span>
                          <span className="variant-pill__body">
                            <span className="variant-pill__name">{v.variant_name}</span>
                            <span className="variant-pill__price">{formatPrice(v.sale_price || v.price)}₫</span>
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:'16px', alignItems:'center', margin:'16px 0'}}>
              <strong>Số lượng:</strong>
              <div className="qty-input">
                <button type="button" data-step="-">−</button>
                <input type="number" name="quantity" defaultValue="1" min="1" max="99" data-qty />
                <button type="button" data-step="+">+</button>
              </div>
              <span className="muted" id="detailStockLine">
                {product.totalDisplayStockUnits <= 0 ? 'Hết hàng' : (hasVariants ? `Còn ${product.totalDisplayStockUnits} sản phẩm (tổng các tùy chọn)` : `Còn ${product.stock} sản phẩm`)}
              </span>
            </div>

            <div className="product-detail__buy-actions">
              <button type="button" className="btn btn--primary btn--lg" data-add-to-cart data-product-id={product.id}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Thêm vào giỏ
              </button>
              <button type="button" className="btn btn--secondary btn--lg" data-buy-now data-product-id={product.id}>
                Mua ngay
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="tabs" data-tabs>
        <div className="tabs__nav">
          <button type="button" className="active">Chi tiết</button>
          <button type="button">Thuộc tính</button>
        </div>

        <div className="tabs__panel active">
          <p id="himacakeDescEmptyNote" className="muted" style={{display:'none', marginBottom:'1rem'}}>
            Chưa có mô tả chi tiết.
          </p>
          {product.youtube_video_id && (
            <div className="product-video-embed" style={{marginBottom:'28px'}}>
              <h4 style={{marginBottom:'12px', fontSize:'1.05rem'}}>Video minh họa</h4>
              <div style={{position:'relative', paddingBottom:'56.25%', height:0, overflow:'hidden', borderRadius:'12px', background:'#111', maxWidth:'920px'}}>
                <iframe title={`YouTube: ${product.name}`} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0}}
                  src={`https://www.youtube.com/embed/${product.youtube_video_id}?rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen></iframe>
              </div>
            </div>
          )}
          <div id="himacakeContentSectionsAnchor" role="presentation" data-has-ytube={product.youtube_video_id ? '1' : ''} data-fallback-desc={product.short_description}></div>
          <textarea id="himacakeSectionsJsonRaw" hidden readOnly value={product.content_sections || ''}></textarea>

          {product.attributes.length > 0 && (
            <section className="himacake-pdt-attrsbelow" aria-label="Thông tin thêm">
              <h3 className="himacake-pcs-head" style={{marginTop:'8px', fontSize:'1.08rem'}}>Thông tin sản phẩm</h3>
              <table className="himacake-pcs-specs" role="presentation" style={{marginTop:'12px'}}>
                <tbody>
                  {product.attributes.map((pa: any, idx: number) => (
                    <tr key={idx}>
                      <th>{pa.attributeName}</th>
                      <td>{pa.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        <div className="tabs__panel">
          <div className="table-responsive">
            <table className="table table--bordered">
              <tbody>
                {product.attributes.map((a: any, idx: number) => (
                  <tr key={idx}>
                    <th style={{width:'200px'}}>{a.attributeName}</th>
                    <td>{a.value}</td>
                  </tr>
                ))}
                {product.attributes.length === 0 && (
                  <tr><td colSpan={2} className="muted">Chưa cập nhật thông số.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
