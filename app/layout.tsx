import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/offline/app-shell";
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
  title: {
    default: "TMC",
    template: "%s · TMC",
  },
  description: "Cell group and member management",
  applicationName: "TMC",
  appleWebApp: {
    capable: true,
    title: "TMC",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0E14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-[100dvh] overflow-hidden overscroll-none antialiased`}
    >
      <body className="flex h-full min-h-[100dvh] flex-col overflow-hidden overscroll-none bg-[#0B0E14] font-sans text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
