import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cols">
        <div className="site-footer__about">
          <h4>HIMACAKE</h4>
          <p>Tiệm bánh tươi mỗi ngày – mang đến những ổ bánh thơm ngon, an toàn cho gia đình bạn từ năm 2026.</p>
          <p><strong>Trụ sở:</strong> Số 1 phố Trạm Trai, phường Ninh Xá, tỉnh Bắc Ninh —
            <a href="https://maps.app.goo.gl/9BSKrtYLwtbvMeZCA" target="_blank" rel="noopener noreferrer">Xem bản đồ</a></p>
          <p><strong>Hotline:</strong> <a href="tel:0392366106">0392 366 106</a></p>
          <p><strong>Email:</strong> himacake06@gmail.com</p>
        </div>

        <div>
          <h4>Mua sắm</h4>
          <ul>
            <li><Link href="/collections/banh-kem">Bánh kem</Link></li>
            <li><Link href="/collections/banh-mi">Bánh mì</Link></li>
            <li><Link href="/collections/banh-ngot">Bánh ngọt</Link></li>
            <li><Link href="/collections/banh-kho">Bánh khô</Link></li>
            <li><Link href="/collections/do-uong">Đồ uống</Link></li>
          </ul>
        </div>

        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li><Link href="/news/lich-hoat-dong-le-30-4">Chính sách giao hàng</Link></li>
            <li><Link href="/news/kham-pha-bst-banh-tuoi-thang-4-2026">Hướng dẫn đặt bánh</Link></li>
            <li><Link href="/account/orders">Tra cứu đơn hàng</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <h4>Kết nối</h4>
          <p>Theo dõi HIMACAKE để nhận ưu đãi & công thức mới mỗi tuần.</p>
          <ul className="site-footer__social">
            <li>
              <a href="https://www.facebook.com/p.dwgdwg.12" target="_blank" rel="noopener noreferrer" aria-label="Facebook HIMACAKE">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/p.dwgdwg_12/" target="_blank" rel="noopener noreferrer" aria-label="Instagram HIMACAKE">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1-2.881 0 1.44 1.44 0 0 1 2.881 0z"/></svg>
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok HIMACAKE">
                <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube HIMACAKE">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        &copy; 2026 HIMACAKE.
      </div>
    </footer>
  );
}
