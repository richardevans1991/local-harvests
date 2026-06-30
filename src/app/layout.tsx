import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.APP_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://www.local-harvests.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Local Harvest — Fresh food from farms near you",
    template: "%s — Local Harvest",
  },
  description:
    "Discover local farm shops near you, browse seasonal produce, and order from UK growers in your community.",
  keywords: [
    "local farm shop",
    "farm shop near me",
    "local produce UK",
    "click and collect farm",
    "local harvest",
  ],
  applicationName: "Local Harvest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Local Harvest",
    title: "Local Harvest — Fresh food from farms near you",
    description:
      "Discover local farm shops near you, browse seasonal produce, and support growers in your community.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Harvest — Fresh food from farms near you",
    description:
      "Discover local farm shops near you and order fresh produce from UK growers.",
  },
  appleWebApp: {
    capable: true,
    title: "Local Harvest",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logos/logo-icon.svg",
    apple: "/logos/logo-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b9a6b",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <InstallAppPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}