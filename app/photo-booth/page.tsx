import Link from 'next/link';

export default function PhotoBoothPage() {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/photo-booth.css?v=44" />
      <section className="page-photo-booth" id="pb-page" 
        data-pb-template="/assets/img/IMG_4361.png" 
        data-pb-logo="/assets/img/himacakev2.png" 
        data-pb-logo-fallback="/assets/img/himacake.png"
        data-pb-layout-thumb-r1000x3000="/assets/img/11111.png"
        data-pb-layout-thumb-r1400x2000="/assets/img/3333.png"
        data-pb-layout-thumb-r1500x2260="/assets/img/2222.png">
        <div className="pb-wrap">
          <header className="pb-intro">
            <div className="pb-brand">
              <h1 className="pb-brand__title">
                <Link className="pb-brand__home" href="/" title="Về trang chủ" aria-label="Về trang chủ HIMACAKE">
                  <img className="pb-brand__logo" src="/assets/img/himacakev2.png" width="52" height="52" alt=""
                       decoding="async" fetchPriority="high" />
                  <span className="pb-brand__name">HIMACAKE</span>
                </Link>
                <span className="pb-brand__product">Photobooth</span>
              </h1>
            </div>
          </header>

          <div id="pb-capture-phase">
            <div className="pb-shell">
              <div className="pb-top">
                <div className="pb-timers" role="group" aria-label="Hẹn giờ chụp">
                  <button type="button" className="pb-chip" data-timer="3" aria-pressed="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3.5 2"/></svg>
                    3s
                  </button>
                  <button type="button" className="pb-chip" data-timer="5" aria-pressed="false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3.5 2"/></svg>
                    5s
                  </button>
                  <button type="button" className="pb-chip" data-timer="10" aria-pressed="false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3.5 2"/></svg>
                    10s
                  </button>
                </div>
                <div className="pb-top-actions">
                  <button type="button" className="pb-resume-cam" id="pb-resume-camera" hidden>Bật camera</button>
                </div>
              </div>

              <div className="pb-stage">
                <div className="pb-rail" role="toolbar" aria-label="Công cụ" aria-live="polite">
                  <div className="pb-rail-col">
                    <button type="button" className="pb-tool" data-open-tool="grid" aria-pressed="false" title="Khung lưới">
                      <svg className="pb-tool__ico" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="16" rx="1"/><rect x="14" y="4" width="6" height="5" rx="1"/><rect x="14" y="11" width="6" height="5" rx="1"/><rect x="14" y="18" width="6" height="2" rx="0.5"/></svg>
                      Khung lưới
                    </button>
                    <p className="pb-rail-note" id="pb-sum-grid">1000×3000</p>
                  </div>
                  <div className="pb-rail-col">
                    <button type="button" className="pb-tool" data-open-tool="filter" aria-pressed="false" title="Bộ lọc">
                      <svg className="pb-tool__ico" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><circle cx="7" cy="17" r="4"/><circle cx="17" cy="17" r="4"/></svg>
                      Bộ lọc
                    </button>
                    <p className="pb-rail-note" id="pb-sum-filter">Tự nhiên</p>
                  </div>
                  <div className="pb-rail-col">
                    <button type="button" className="pb-tool" data-open-tool="light" aria-pressed="false" title="Phát sáng">
                      <svg className="pb-tool__ico" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 1.5v2.5M12 20v2.5M3.5 12h2.5M18 12h2.5M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/></svg>
                      Phát sáng
                    </button>
                    <p className="pb-rail-note" id="pb-sum-light">Trắng</p>
                  </div>
                </div>

                <div className="pb-capture-main">
                  <div className="pb-preview-row">
                    <div className="pb-preview">
                      <button type="button" className="pb-flip" id="pb-flip-camera" aria-label="Đổi camera trước và sau">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 3h4l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5L10 3z"/>
                          <circle cx="12" cy="13" r="3"/>
                          <path d="M17 9.5 19 7.5V11h-3.5"/>
                          <path d="M7 14.5 5 16.5V13h3.5"/>
                        </svg>
                        <span className="pb-flip__label">Đổi cam</span>
                      </button>
                      <div className="pb-preview__inner">
                        <video id="pb-video" playsInline autoPlay muted></video>
                        <img id="pb-static" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Ảnh tải lên" />
                      </div>
                      <div id="pb-msg" className="pb-msg" hidden></div>
                      <div id="pb-countdown" className="pb-countdown" hidden>3</div>
                      <div id="pb-progress" className="pb-progress" hidden>Đang chụp…</div>
                    </div>
                    <div id="pb-filmstrip" className="pb-filmstrip" hidden role="list" aria-label="Ảnh đã chụp trong phiên"></div>
                    <div className="pb-action">
                      <button type="button" className="pb-capture">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Bắt đầu chụp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="pb-editor-phase" className="pb-editor-phase" hidden>
            <div className="pb-editor-shell">
              <div className="pb-editor-layout">
                <div className="pb-editor-preview">
                  <canvas id="pb-editor-canvas" className="pb-editor-canvas" width="400" height="600" aria-label="Xem trước ảnh ghép"></canvas>
                </div>
                <div className="pb-editor-side">
                  <h2 className="pb-editor-side__title">Hoàn thiện ảnh</h2>
                  <p className="text-soft pb-editor-hint">Chọn màu khung (nền khi tắt HIMA), hoặc bật nền HIMA. Logo và chữ HIMACAKE luôn hiển thị ở dưới ảnh.</p>

                  <div className="pb-editor-block">
                    <h3 className="pb-editor-label">Màu khung</h3>
                    <div id="pb-frame-swatches" className="pb-frame-swatches"></div>
                  </div>

                  <div className="pb-editor-block">
                    <h3 className="pb-editor-label">Nền sticker</h3>
                    <button type="button" className="pb-sticker-btn" id="pb-bg-pattern-toggle" aria-pressed="false"
                            title="Bật nền HIMA (họa tiết). Tắt = chỉ dùng màu khung">
                      <img className="pb-bg-pattern-thumb" src="/assets/img/IMG_4361.png" width="44" height="44" alt=""
                           loading="lazy" decoding="async" />
                      <span>HIMA</span>
                    </button>
                  </div>

                  <div className="pb-editor-actions">
                    <button type="button" className="pb-download" id="pb-download-btn">Tải xuống</button>
                    <button type="button" className="pb-retake" id="pb-retake-btn">Chụp lại</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="pb-modal" className="pb-modal" hidden aria-modal="true" role="dialog" aria-label="Tuỳ chỉnh HIMACAKE Photobooth">
          <div className="pb-modal__backdrop"></div>
          <div className="pb-modal__dialog">
            <div className="pb-modal__side" role="tablist">
              <button type="button" className="pb-modal__tab" data-tab="grid" aria-selected="true">
                <svg className="pb-modal__ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="13" y="3" width="6" height="5" rx="1"/><rect x="13" y="10" width="6" height="5" rx="1"/><rect x="13" y="17" width="6" height="4" rx="0.5"/></svg>
                Khung lưới
              </button>
              <button type="button" className="pb-modal__tab" data-tab="filter" aria-selected="false">
                <svg className="pb-modal__ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/></svg>
                Bộ lọc
              </button>
              <button type="button" className="pb-modal__tab" data-tab="light" aria-selected="false">
                <svg className="pb-modal__ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 1.5v2.5M12 20v2.5M3.5 12h2.5M18 12h2.5M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/></svg>
                Phát sáng
              </button>
            </div>
            <div className="pb-modal__main">
              <div className="pb-modal__head">
                <h2 id="pb-modal-title">Khung lưới</h2>
                <button type="button" className="pb-modal__close" aria-label="Đóng">×</button>
              </div>
              <div className="pb-modal__body">
                <div data-panel="grid">
                  <p className="text-soft" style={{marginTop:0, marginBottom:'var(--sp-4)', fontSize:'var(--fs-14)'}}>Chọn cách ghép ảnh (mỗi ô sẽ chụp một lần theo hẹn giờ).</p>
                  <div id="pb-layout-grid" className="pb-layout-grid"></div>
                </div>
                <div data-panel="filter" hidden>
                  <p className="text-soft" style={{marginTop:0, marginBottom:'var(--sp-4)', fontSize:'var(--fs-14)'}}>Bộ lọc dịu, ấm — hợp chụp chân dung / selfie. Áp dụng lên khung xem trước và ảnh tải về. Kéo thanh cường độ để tăng/giảm mạnh hiệu ứng (100% = mặc định, tối đa 300%).</p>
                  <div id="pb-filter-grid" className="pb-filter-grid"></div>
                  <div id="pb-filter-strength-wrap" className="pb-filter-strength" hidden>
                    <label className="pb-filter-strength__label" htmlFor="pb-filter-range">Cường độ bộ lọc</label>
                    <div className="pb-light-row pb-filter-strength__row">
                      <input type="range" id="pb-filter-range" min="0" max="300" defaultValue="100" step="5" aria-valuemin={0} aria-valuemax={300} aria-label="Cường độ bộ lọc" />
                      <output id="pb-filter-out" htmlFor="pb-filter-range">100%</output>
                    </div>
                  </div>
                </div>
                <div data-panel="light" hidden>
                  <div className="pb-light-panel">
                    <p className="text-soft" style={{marginTop:0, marginBottom:'var(--sp-3)', fontSize:'var(--fs-14)'}}>Chọn sắc nền quanh khung chụp. Ô sáng mịn = nền studio mặc định; ô cầu vồng mở bảng màu tuỳ chỉnh. Kéo thanh để tăng / giảm độ mạnh.</p>
                    <div id="pb-swatches" className="pb-swatches"></div>
                    <div className="pb-light-row">
                      <input type="range" id="pb-light-range" min="0" max="100" defaultValue="100" />
                      <output id="pb-light-out" htmlFor="pb-light-range">100%</output>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <script src="/assets/js/photo-booth.js?v=32" defer data-cfasync="false"></script>
    </>
  );
}
