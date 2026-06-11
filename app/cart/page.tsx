import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="container" style={{ padding: '40px 0', minHeight: '60vh' }}>
      <h1>Giỏ hàng</h1>
      <div className="alert alert--info">
        Tính năng giỏ hàng và thanh toán đang được phát triển cho phiên bản Next.js tĩnh. Vui lòng quay lại sau!
      </div>
      <Link href="/" className="btn btn--primary">Tiếp tục mua sắm</Link>
    </div>
  );
}
