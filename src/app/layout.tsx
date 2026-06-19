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

export const metadata: Metadata = {
  title: "Local Harvest — Fresh food from farms near you",
  description:
    "Discover local farm shops, browse seasonal produce, and support growers in your community.",
  applicationName: "Local Harvest",
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