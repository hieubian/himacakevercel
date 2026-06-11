'use client';

import Link from 'next/link';
import { useState } from 'react';
import categoriesData from '../../data/categories.json';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);

  // Parse categories for mega menu
  const rootCats = categoriesData
    .filter((c: any) => c.parent_id === null && c.status && c.slug !== 'macchi')
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const getSubCats = (parentId: number) => {
    return categoriesData
      .filter((c: any) => c.parent_id === parentId && c.status)
      .sort((a: any, b: any) => a.sort_order - b.sort_order);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__top">
          <div className="site-header__roll-inner">
            <div className="container">
              <div>Hotline: <a href="tel:0392366106">0392 366 106</a> &middot; Mở cửa 7:00 - 22:00 hằng ngày</div>
              <ul>
                <li><Link href="/auth/login">Đăng nhập</Link></li>
                <li><Link href="/auth/register">Đăng ký</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="site-header__main">
          <div className="site-header__main-start">
            <button className="burger" data-burger aria-label="Menu">&#9776;</button>

            <Link className="brand" href="/">
              <span className="brand__icon-wrap" aria-hidden="true">
                <img className="brand__icon-img" src="/assets/img/himacakev2.png" width="40" height="40" alt="" decoding="async" fetchPriority="high" onError={(e) => { e.currentTarget.src = '/assets/img/himacake.png'; }} />
              </span>
              <span className="brand__text">HIMACAKE</span>
            </Link>
          </div>

          <form className="site-search" action="/products" method="get" role="search">
            <input type="text" name="q" placeholder="Tìm bánh, đồ uống, danh mục..." aria-label="Tìm kiếm" />
            <button type="submit" aria-label="Tìm kiếm">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>

          <div className="header-actions">
            <Link className="header-actions__user" href="/account" title="Tài khoản">
              <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
            <Link href="/cart" title="Giỏ hàng" className="header-actions__cart-guest">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span data-cart-count className="cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>

        <nav className="site-nav" aria-label="Menu chính">
          <div className="site-header__roll-inner">
            <ul className="site-nav__list">
              <li><Link href="/" className="active">Trang chủ</Link></li>
              <li className="site-nav__item--mega" data-has-mega>
                <Link href="/products">Sản phẩm</Link>
                <div className="site-nav__mega" role="region" aria-label="Danh mục sản phẩm">
                  <div className="site-nav__mega-inner">
                    <div className="site-nav__mega-grid">
                      {rootCats.map((rootCat: any) => {
                        const subs = getSubCats(rootCat.id);
                        return (
                          <div className="site-nav__mega-col" key={rootCat.id}>
                            <Link className="site-nav__mega-heading" href={`/collections/${rootCat.slug}`}>{rootCat.name}</Link>
                            {subs.length > 0 && (
                              <ul className="site-nav__mega-sub">
                                {subs.map((sub: any) => (
                                  <li key={sub.id}>
                                    <Link href={`/collections/${sub.slug}`}>{sub.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="site-nav__mega-foot">
                      <Link href="/products">Xem tất cả sản phẩm</Link>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/photo-booth">Photobooth</Link></li>
              <li><Link href="/news">Tin tức</Link></li>
              <li><Link href="/contact">Liên hệ</Link></li>
            </ul>
          </div>
        </nav>
      </header>
      <div className="site-header-spacer" id="site-header-spacer" aria-hidden="true" suppressHydrationWarning></div>
    </>
  );
}
