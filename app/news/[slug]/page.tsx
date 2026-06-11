import Link from 'next/link';
import { notFound } from 'next/navigation';
import newsData from '../../../data/news.json';

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const news: any = newsData.find((n: any) => n.slug === slug && n.status);
  if (!news) return notFound();

  const latest = [...newsData]
    .filter((n: any) => n.status && n.id !== news.id)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <section className="page-news-detail">
      <div className="container">
        <div className="news-layout">
          <article className="news-article">
            <nav className="breadcrumb">
              <Link href="/">Trang chủ</Link> /
              <Link href="/news">Tin tức</Link> /
              <span>{news.title}</span>
            </nav>

            <div className="news-meta-bar">
              {news.news_category_name && (
                <span className="news-cat">{news.news_category_name}</span>
              )}
              <span>{new Date(news.created_at).toLocaleDateString('vi-VN')}</span>
              {news.author_name && (
                <span>by {news.author_name}</span>
              )}
            </div>

            {news.image ? (
              <figure className="news-cover">
                <div className="news-cover__inner">
                  <img src={news.image} alt="" />
                  <figcaption>
                    <h1 className="news-cover__title">{news.title}</h1>
                  </figcaption>
                </div>
              </figure>
            ) : (
              <h1 className="news-title-fallback">{news.title}</h1>
            )}

            {news.summary && (
              <blockquote className="news-summary-quote">{news.summary}</blockquote>
            )}

            <div className="news-content" dangerouslySetInnerHTML={{ __html: news.content || '' }}></div>
          </article>

          <aside className="news-sidebar">
            <h3>Bài đọc nhiều</h3>
            <ul className="latest-news">
              {latest.map((n: any) => (
                <li key={n.id}>
                  <Link href={`/news/${n.slug}`}>
                    <img src={n.image || '/assets/images/placeholder.svg'} alt={n.title} />
                    <div>
                      <strong>{n.title}</strong>
                      <small>{new Date(n.created_at).toLocaleDateString('vi-VN')}</small>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
