'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import newsData from '../../data/news.json';

function NewsContent() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const pageStr = searchParams.get('page') || '1';
  const page = parseInt(pageStr, 10);
  const pageSize = 12;

  let filtered: any[] = [...newsData].filter((n: any) => n.status);
  
  // Extract unique categories
  const categoriesMap = new Map();
  filtered.forEach((n: any) => {
    if (n.news_category_id) {
      categoriesMap.set(n.news_category_id, { slug: n.news_category_id.toString(), name: n.news_category_name || 'Khác' });
    }
  });
  const categories = Array.from(categoriesMap.values());

  if (currentCategory) {
    filtered = filtered.filter((n: any) => n.news_category_id && n.news_category_id.toString() === currentCategory);
  }

  filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNum.toString());
    return `?${params.toString()}`;
  };

  const getCatName = () => {
    const cat = categories.find((c: any) => c.slug === currentCategory);
    return cat ? cat.name : '';
  };

  return (
    <section className="page-news">
      <div className="container">
        <div className="news-layout">
          <div className="news-list">
            <h1>Tin tức &amp; cập nhật</h1>
            {currentCategory && (
              <p className="text-soft">Chuyên mục: <b>{getCatName()}</b> &middot; <Link href="/news" className="btn-link">Xem tất cả</Link></p>
            )}

            {paginated.length === 0 ? (
              <p>Chưa có bài viết nào.</p>
            ) : (
              <>
                <div className="news-grid">
                  {paginated.map((n: any) => (
                    <article key={n.id} className="news-card news-card--titlescreen">
                      <Link href={`/news/${n.slug}`} className="news-thumb">
                        <img src={n.image || '/assets/images/placeholder.svg'} alt="" loading="lazy" />
                        <span className="news-card__overlay" aria-hidden="true"></span>
                        <span className="news-card__overlay-title">{n.title}</span>
                      </Link>
                      <div className="news-body">
                        {n.news_category_name && (
                          <span className="news-cat">{n.news_category_name}</span>
                        )}
                        <h3><Link href={`/news/${n.slug}`}>{n.title}</Link></h3>
                        <p className="news-summary">{n.summary}</p>
                        <small className="news-meta">{new Date(n.created_at).toLocaleDateString('vi-VN')}</small>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="pagination">
                    {page > 1 && (
                      <Link href={createPageUrl(page - 1)}>&laquo; Trước</Link>
                    )}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pNum = i + 1;
                      return pNum === page ? (
                        <a key={pNum} className="active">{pNum}</a>
                      ) : (
                        <Link key={pNum} href={createPageUrl(pNum)}>{pNum}</Link>
                      );
                    })}
                    {page < totalPages && (
                      <Link href={createPageUrl(page + 1)}>Sau &raquo;</Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          <aside className="news-sidebar">
            <h3>Chuyên mục</h3>
            <ul>
              <li><Link href="/news" className={!currentCategory ? 'active' : ''}>Tất cả</Link></li>
              {categories.map((cat: any) => (
                <li key={cat.slug}>
                  <Link href={`/news?category=${cat.slug}`} className={cat.slug === currentCategory ? 'active' : ''}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <NewsContent />
    </Suspense>
  );
}
