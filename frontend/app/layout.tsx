import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CargoNep - Smart Logistics Platform",
  description:
    "AI-driven route optimization, real-time fleet tracking, and predictive analytics for modern logistics operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
