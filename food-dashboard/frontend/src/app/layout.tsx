import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Partner Dashboard | Digital Book of India",
  description: "Modern Food Business Dashboard for managing orders, menu, and payments.",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-50">Loding...</div>}>
            <AppShell>{children}</AppShell>
          </Suspense>
      </body>
    </html>
  );
}
