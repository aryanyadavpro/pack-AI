import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { PwaManager } from "@/components/pwa/PwaManager";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#FAF7F2",
};

export const metadata: Metadata = {
  title: "PackCraft AI — Intelligent Food Packaging Platform",
  description: "Deterministic packaging recommendation and shelf-life simulation engine for Indian agro-food commodities based on physical chemistry, FSSAI regulations 2018, and IS/ISO 17088 certified bioplastics.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PackCraft AI",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased light ${plusJakarta.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#141928] selection:bg-[#F7D25C]/40 selection:text-[#141928] font-sans pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Navbar />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <Footer />
        <MobileNav />
        <PwaManager />
      </body>
    </html>
  );
}
