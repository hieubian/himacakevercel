export default function ContactPage() {
  return (
    <section className="page-contact">
      <div className="container">
        <h1>Liên hệ với HIMACAKE</h1>
        <p className="text-soft">Quý khách vui lòng để lại thông tin – HIMACAKE sẽ liên hệ trong thời gian sớm nhất.</p>

        <div className="contact-grid">
          <form action="#" method="post" className="contact-form hc-busy-on-submit">
            <div className="form-row two-col">
              <div>
                <label>Họ và tên <span className="req">*</span></label>
                <input type="text" name="fullName" required maxLength={120} />
              </div>
              <div>
                <label>Email <span className="req">*</span></label>
                <input type="email" name="email" required maxLength={120} />
              </div>
            </div>
            <div className="form-row two-col">
              <div>
                <label>Số điện thoại</label>
                <input type="tel" name="phone" maxLength={20} />
              </div>
              <div>
                <label>Chủ đề</label>
                <input type="text" name="subject" maxLength={160} />
              </div>
            </div>
            <div className="form-row">
              <label>Nội dung <span className="req">*</span></label>
              <textarea name="message" rows={6} required maxLength={2000}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Gửi liên hệ</button>
          </form>

          <aside className="contact-info">
            <h3>Thông-tin cửa hàng</h3>
            <p><b>HIMACAKE</b></p>
            <p>Số 1 phố Trạm Trai, phường Ninh Xá, Bắc Ninh · <a href="https://maps.app.goo.gl/9BSKrtYLwtbvMeZCA" target="_blank" rel="noopener noreferrer">Bản đồ</a></p>
            <p>Hotline: <a href="tel:0392366106">0392 366 106</a></p>
            <p>Email: <a href="mailto:himacake06@gmail.com">himacake06@gmail.com</a></p>
            <p>Mở cửa: 7:00 - 22:00 hằng ngày</p>

            <iframe className="contact-map" src="https://www.google.com/maps?q=Ninh+X%C3%A1+B%E1%BA%AFc+Ninh&output=embed"
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Bản đồ HIMACAKE"></iframe>
          </aside>
        </div>
      </div>
    </section>
  );
}
