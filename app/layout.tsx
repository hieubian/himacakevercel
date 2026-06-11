import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Script from "next/script";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "HIMACAKE - Tiệm bánh tươi mỗi ngày",
  description: "HIMACAKE chuyên bánh kem, bánh tươi, bánh mì, đồ uống. Đặt online, giao tận nơi.",
  icons: {
    icon: '/assets/img/himacakev2.png',
    apple: '/assets/img/himacakev2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${quicksand.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/assets/img/himacakev2.png" />
        <link rel="apple-touch-icon" href="/assets/img/himacakev2.png" />
        <link rel="stylesheet" href="/assets/css/tokens.css?v=2" />
        <link rel="stylesheet" href="/assets/css/base.css?v=3" />
        <link rel="stylesheet" href="/assets/css/components.css?v=18" />
        <link rel="stylesheet" href="/assets/css/client.css?v=36" />
      </head>
      <body>
        <a href="#main" className="skip-link">Bỏ qua tới nội dung chính</a>
        <Header />
        <main id="main">
          {children}
        </main>
        <Footer />
        <Script src="/assets/js/form-submit-busy.js?v=1" strategy="lazyOnload" />
        <Script src="/assets/js/main.js?v=19" strategy="lazyOnload" />
      </body>
    </html>
  );
}
