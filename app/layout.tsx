import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import HomeCanvas from "../components/HomeCanvas";

export const metadata: Metadata = {
  title: "STATAXIS | Statistical Analysis System",
  description:
    "Simple Linear Regression and Hypothesis Testing statistical tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {"(function(){var t=localStorage.getItem('stataxis-theme')||localStorage.getItem('advstat-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;})();"}
        </Script>
        <HomeCanvas persistent />
        {children}
      </body>
    </html>
  );
}
