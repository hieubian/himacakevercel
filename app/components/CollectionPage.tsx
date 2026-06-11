'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import productsData from '../../data/products.json';
import categoriesData from '../../data/categories.json';

function CollectionContent({ categorySlug }: { categorySlug?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCat = categorySlug ? categoriesData.find((c: any) => c.slug === categorySlug) : null;
  const rootCats = categoriesData.filter((c: any) => !c.parent_id && c.status && c.slug !== 'macchi');

  const q = searchParams.get('q') || '';
  const min = searchParams.get('min') || '';
  const max = searchParams.get('max') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageStr = searchParams.get('page') || '1';
  const page = parseInt(pageStr, 10);
  const pageSize = 12;

  // Filter products
  let filtered = [...productsData].filter((p: any) => p.status);
  
  if (currentCat) {
    // If it's a root category, get subcategories too
    const subCatIds = categoriesData.filter((c: any) => c.parent_id === currentCat.id).map((c: any) => c.id);
    const targetIds = [currentCat.id, ...subCatIds];
    filtered = filtered.filter((p: any) => targetIds.includes(p.category_id));
  }

  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter((p: any) => p.name.toLowerCase().includes(term) || (p.short_description && p.short_description.toLowerCase().includes(term)));
  }

  if (min) {
    const minVal = parseInt(min, 10);
    filtered = filtered.filter((p: any) => (p.sale_price || p.price) >= minVal);
  }

  if (max) {
    const maxVal = parseInt(max, 10);
    filtered = filtered.filter((p: any) => (p.sale_price || p.price) <= maxVal);
  }

  // Sort
  if (sort === 'newest') {
    filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === 'views') {
    filtered.sort((a: any, b: any) => b.view_count - a.view_count);
  } else if (sort === 'best') {
    filtered.sort((a: any, b: any) => b.sold_count - a.sold_count);
  } else if (sort === 'price_asc') {
    filtered.sort((a: any, b: any) => (a.sale_price || a.price) - (b.sale_price || b.price));
  } else if (sort === 'price_desc') {
    filtered.sort((a: any, b: any) => (b.sale_price || b.price) - (a.sale_price || a.price));
  } else if (sort === 'name') {
    filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  // Paginate
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getCatName = (categoryId: number) => {
    const cat = categoriesData.find((c: any) => c.id === categoryId);
    return cat ? cat.name : '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    setIsWide(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNum.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className="sep">/</span>
        {currentCat ? <span>{currentCat.name}</span> : <span>Sản phẩm</span>}
      </div>

      <div className="collection-heading">
        <h1 style={{ marginBottom: '8px' }}>
          {currentCat ? currentCat.name : (q ? `Kết quả tìm kiếm: "${q}"` : 'Tất cả sản phẩm')}
        </h1>
        {currentCat && (
          <p className="collection-heading__lead text-soft" style={{ margin: '0 0 16px', fontSize: 'var(--fs-15)', lineHeight: 1.5 }}>
            Xem sản phẩm trong danh mục <strong>{currentCat.name}</strong>. Dùng bộ lọc giá và sắp xếp bên dưới để tìm nhanh.
          </p>
        )}
      </div>

      <div className="collection-layout">
        <div className="collection-main">
          <div className="toolbar">
            <div>Hiển thị <strong>{paginated.length}</strong> / {totalItems} sản phẩm</div>
            <form onSubmit={(e) => e.preventDefault()}>
              <label style={{ marginRight: '8px', fontWeight: 500, color: 'var(--color-text-soft)' }}>Sắp xếp:</label>
              <select name="sort" value={sort} onChange={handleSortChange}>
                <option value="newest">Mới nhất</option>
                <option value="views">Xem nhiều nhất</option>
                <option value="best">Bán chạy</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </form>
          </div>

          {paginated.length === 0 ? (
            <div className="alert alert--info">
              Không có sản phẩm nào phù hợp. Thử bộ lọc khác hoặc <Link href="/products">xem tất cả</Link>.
            </div>
          ) : (
            <div className="products-grid">
              {paginated.map((p: any) => (
                <article key={p.id} className="product-card">
                  <Link href={`/product/${p.slug}`} className="product-card__media">
                    <img src={p.main_image || '/assets/images/placeholder.svg'} alt={p.name} loading="lazy" />
                    <div className="product-card__tags">
                      {p.sold_count > 0 && <span className="badge badge--hot">Bán chạy</span>}
                      {p.sale_price != null && <span className="badge badge--sale">Sale</span>}
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
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Phân trang">
              <Link className={page <= 1 ? 'disabled' : ''} href={createPageUrl(page - 1)}>&laquo;</Link>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pNum = i + 1;
                return pNum === page ? (
                  <span key={pNum} className="active">{pNum}</span>
                ) : (
                  <Link key={pNum} href={createPageUrl(pNum)}>{pNum}</Link>
                );
              })}
              <Link className={page >= totalPages ? 'disabled' : ''} href={createPageUrl(page + 1)}>&raquo;</Link>
            </nav>
          )}
        </div>

        <aside className="collection-sidebar" aria-label="Bộ lọc danh mục và giá">
          <details className="collection-filter-details" open={isWide}>
            <summary className="collection-filter-details__summary">
              <span>Danh mục</span>
              <span className="collection-filter-details__chevron" aria-hidden="true"></span>
            </summary>
            <div className="collection-filter-details__body">
              <ul>
                <li><Link href="/products" className={!currentCat ? 'active' : ''}>Tất cả sản phẩm</Link></li>
                {rootCats.map((r: any) => {
                  const subs = categoriesData.filter((c: any) => c.parent_id === r.id && c.status);
                  const isRootActive = currentCat && (currentCat.id === r.id || currentCat.parent_id === r.id);
                  return (
                    <li key={r.id} style={{ marginBottom: subs.length > 0 ? '8px' : '0' }}>
                      <Link href={`/collections/${r.slug}`} className={currentCat && currentCat.id === r.id ? 'active' : (isRootActive ? 'active-parent' : '')} style={subs.length > 0 ? {fontWeight: 600, display: 'block', marginBottom: '4px'} : {}}>
                        {r.name}
                      </Link>
                      {subs.length > 0 && (
                        <ul style={{ paddingLeft: '16px', listStyle: 'none' }}>
                          {subs.map((sub: any) => (
                            <li key={sub.id} style={{ marginBottom: '4px' }}>
                              <Link href={`/collections/${sub.slug}`} className={currentCat && currentCat.id === sub.id ? 'active' : ''}>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </details>

          <details className="collection-filter-details" open={isWide}>
            <summary className="collection-filter-details__summary">
              <span>Khoảng giá</span>
              <span className="collection-filter-details__chevron" aria-hidden="true"></span>
            </summary>
            <div className="collection-filter-details__body">
              <form method="get" action={currentCat ? `/collections/${currentCat.slug}` : '/products'}>
                {q && <input type="hidden" name="q" value={q} />}
                <input type="hidden" name="sort" value={sort} />
                <div className="form-row">
                  <input className="form-control" type="number" name="min" defaultValue={min} placeholder="Tối thiểu" inputMode="decimal" />
                  <input className="form-control" type="number" name="max" defaultValue={max} placeholder="Tối đa" inputMode="decimal" />
                </div>
                <button className="btn btn--outline btn--block" type="submit" style={{ marginTop: '8px' }}>Lọc</button>
              </form>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}

export default function CollectionPage({ categorySlug }: { categorySlug?: string }) {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <CollectionContent categorySlug={categorySlug} />
    </Suspense>
  );
}
