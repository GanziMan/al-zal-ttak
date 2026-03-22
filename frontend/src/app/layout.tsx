import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "알잘딱 | AI 공시 분석",
  description: "AI 기반 한국 주식시장 공시 분석 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}}catch(e){}})()`}</Script>
        <Nav />
        <Toaster position="bottom-right" />
        <main className="flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="hidden sm:block border-t border-border py-4 text-center">
          <p className="text-[11px] text-muted-foreground/50">
            알잘딱 &middot; AI 공시 분석 &middot; DART 기반
          </p>
        </footer>
      </body>
    </html>
  );
}
