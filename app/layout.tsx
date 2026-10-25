import "./globals.css";
import type { Metadata } from "next";
import HomeCanvas from "../components/HomeCanvas";

export const metadata: Metadata = {
  title: "ADVSTAT | Statistical Analysis System",
  description:
    "Simple Linear Regression and Hypothesis Testing statistical tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HomeCanvas persistent />
        {children}
      </body>
    </html>
  );
}
