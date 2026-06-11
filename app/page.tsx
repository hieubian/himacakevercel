'use client';

import Link from 'next/link';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';
import newsData from '../data/news.json';

export default function Home() {
  // Parse data
  const homeCategories = categoriesData
    .filter((c: any) => c.show_on_home && c.status && c.slug !== 'macchi')
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const slideSlots = categoriesData
    .filter((c: any) => c.home_slide_rank && c.status)
    .sort((a: any, b: any) => a.home_slide_rank - b.home_slide_rank);

  // We ensure exactly 3 slides are shown as in the original JSP
  const slides = [
    slideSlots[0] || {
      home_slide_bg_css: "linear-gradient(135deg,#fff8eb 0%,#ffe8b8 100%)",
      home_slide_title: "Bánh kem Kỳ lân kỳ diệu",
      home_slide_subline: "Giảm 10% cho khách hàng mới với mã WELCOME10.",
      home_slide_btn: "Đặt ngay",
      slug: "banh-kem",
      image: ""
    },
    slideSlots[1] || {
      home_slide_bg_css: "linear-gradient(135deg,#ffe4ec 0%,#ffc1cc 100%)",
      home_slide_title: "Bộ sưu tập Mousse mới",
      home_slide_subline: "Mousse xoài, vải hoa hồng, quả mọng - tươi mát, mềm tan.",
      home_slide_btn: "Khám phá",
      slug: "banh-kem",
      image: ""
    },
    slideSlots[2] || {
      home_slide_bg_css: "linear-gradient(135deg,#e8f5e9 0%,#c5e1a5 100%)",
      home_slide_title: "Bánh tươi mỗi sáng",
      home_slide_subline: "Đặt online, giao tận nơi khu vực Bắc Ninh.",
      home_slide_btn: "Xem ngay",
      slug: "banh-tuoi",
      image: ""
    }
  ];

  const featuredProducts = [...productsData]
    .filter((p: any) => p.status)
    .sort((a: any, b: any) => b.sold_count - a.sold_count)
    .slice(0, 8);

  const newProducts = [...productsData]
    .filter((p: any) => p.status)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const mostViewedProducts = [...productsData]
    .filter((p: any) => p.status)
    .sort((a: any, b: any) => b.view_count - a.view_count)
    .slice(0, 8);

  const latestNews = [...newsData]
    .filter((n: any) => n.status)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const getCatName = (categoryId: number) => {
    const cat = categoriesData.find((c: any) => c.id === categoryId);
    return cat ? cat.name : '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <>
      <section className="slideshow" data-slideshow aria-label="Khuyến mãi nổi bật">
        <div className="slideshow__track">
          {slides.map((s: any, idx) => (
            <div key={idx} className="slideshow__slide" style={{ background: s.home_slide_bg_css || s.homeSlideBgCss }}>
              {s.image && (
                <picture>
                  {s.home_slide_image_mobile && (
                    <source media="(max-width: 768px)" srcSet={s.home_slide_image_mobile} />
                  )}
                  <img src={s.image} alt="" decoding="async" className="slideshow__photo" onError={(e) => e.currentTarget.classList.add('slideshow__photo--broken')} />
                </picture>
              )}
              <div className="slideshow__overlay" aria-hidden="true"></div>
              <div className="slideshow__caption">
                <h2>{s.home_slide_title || s.homeSlideTitle}</h2>
                <p>{s.home_slide_subline || s.homeSlideSubline}</p>
                <Link className="btn btn--secondary btn--lg" href={`/collections/${s.slug}`}>
                  {s.home_slide_btn || s.homeSlideBtn || "Xem ngay"}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button className="slideshow__nav slideshow__nav--prev" aria-label="Slide trước">&#10094;</button>
        <button className="slideshow__nav slideshow__nav--next" aria-label="Slide sau">&#10095;</button>
        <div className="slideshow__dots" suppressHydrationWarning></div>
      </section>

      <section className="cat-icons" aria-label="Danh mục nổi bật">
        <div className="cat-icons__grid">
          {homeCategories.map((cat: any) => (
            <Link key={cat.id} className="cat-icon" href={`/collections/${cat.slug}`}>
              <span className="cat-icon__circle">
                <img src={cat.icon} alt={cat.name} />
              </span>
              <span className="cat-icon__label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <h2>Sản phẩm bán chạy</h2>
            <Link className="more" href="/products?sort=best">Xem tất cả &rarr;</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((p: any) => (
              <article key={p.id} className="product-card">
                <Link href={`/product/${p.slug}`} className="product-card__media">
                  <img src={p.main_image} alt={p.name} loading="lazy" />
                  <div className="product-card__tags">
                    {p.sold_count > 0 && <span className="badge badge--hot">Bán chạy</span>}
                    {p.sale_price != null && <span className="badge badge--sale">Sale</span>}
                  </div>
                  <div className="product-card__quick">
                    <button type="button" data-add-to-cart data-product-id={p.id} title="Thêm vào giỏ" aria-label="Thêm vào giỏ">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </Link>
                <div className="product-card__body">
                  <div className="product-card__cat">{getCatName(p.category_id)}</div>
                  <Link href={`/product/${p.slug}`} className="product-card__title">{p.name}</Link>
                  <div className="product-card__price">
                    {formatPrice(p.sale_price || p.price)}₫
                    {p.sale_price != null && (
                      <span className="product-card__price-old">{formatPrice(p.price)}₫</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Sản phẩm mới</h2>
            <Link className="more" href="/products?sort=newest">Xem tất cả &rarr;</Link>
          </div>
          <div className="products-grid">
            {newProducts.map((p: any) => (
              <article key={p.id} className="product-card">
                <Link href={`/product/${p.slug}`} className="product-card__media">
                  <img src={p.main_image} alt={p.name} loading="lazy" />
                  <div className="product-card__tags">
                    <span className="badge badge--new">Mới</span>
                  </div>
                  <div className="product-card__quick">
                    <button type="button" data-add-to-cart data-product-id={p.id} aria-label="Thêm vào giỏ">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </Link>
                <div className="product-card__body">
                  <div className="product-card__cat">{getCatName(p.category_id)}</div>
                  <Link href={`/product/${p.slug}`} className="product-card__title">{p.name}</Link>
                  <div className="product-card__price">
                    {formatPrice(p.sale_price || p.price)}₫
                    {p.sale_price != null && (
                      <span className="product-card__price-old">{formatPrice(p.price)}₫</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <h2>Sản phẩm xem nhiều</h2>
            <Link className="more" href="/products?sort=views">Xem tất cả &rarr;</Link>
          </div>
          <div className="products-grid">
            {mostViewedProducts.map((p: any) => (
              <article key={p.id} className="product-card">
                <Link href={`/product/${p.slug}`} className="product-card__media">
                  <img src={p.main_image} alt={p.name} loading="lazy" />
                  {p.sale_price != null && (
                    <div className="product-card__tags">
                      <span className="badge badge--sale">Sale</span>
                    </div>
                  )}
                  <div className="product-card__quick">
                    <button type="button" data-add-to-cart data-product-id={p.id} title="Thêm vào giỏ" aria-label="Thêm vào giỏ">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </Link>
                <div className="product-card__body">
                  <div className="product-card__cat">{getCatName(p.category_id)}</div>
                  <Link href={`/product/${p.slug}`} className="product-card__title">{p.name}</Link>
                  <div className="product-card__price">
                    {formatPrice(p.sale_price || p.price)}₫
                    {p.sale_price != null && (
                      <span className="product-card__price-old">{formatPrice(p.price)}₫</span>
                    )}
                  </div>
                  <div className="product-card__views-muted">
                    {formatPrice(p.view_count)} lượt xem
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <h2>Tin mới nhất</h2>
            <Link className="more" href="/news">Xem tất cả &rarr;</Link>
          </div>
          <div className="news-grid news-grid--home" aria-label="Tin mới">
            {latestNews.map((n: any) => (
              <article key={n.id} className="news-card news-card--titlescreen">
                <Link href={`/news/${n.slug}`} className="news-card__media">
                  <img src={n.image || '/assets/icons/categories/groupbuy_2.jpg'} alt="" loading="lazy" />
                  <span className="news-card__overlay" aria-hidden="true"></span>
                  <span className="news-card__overlay-title">{n.title}</span>
                </Link>
                <div className="news-card__body">
                  <Link href={`/news/${n.slug}`} className="news-card__title">{n.title}</Link>
                  <div className="news-card__date">{new Date(n.created_at).toLocaleDateString('vi-VN')}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
