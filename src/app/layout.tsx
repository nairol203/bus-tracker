import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import PlausibleProvider from "next-plausible";

import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bus.nairol.de"),
  title: {
    default: "KVG Bus Tracker | Echtzeit Abfahrten für Kiel",
    template: "%s | KVG Bus Tracker",
  },
  description:
    "Aktuelle Abfahrtszeiten aller Buslinien der KVG Kiel. Echtzeit-Infos, alle Buslinien und Verspätungen auf einen Blick.",
  keywords: [
    "KVG",
    "Kiel",
    "Bus",
    "Tracker",
    "Fahrplan",
    "Abfahrtszeiten",
    "Live",
    "Verspätung",
    "ÖPNV",
  ],
  authors: [
    {
      name: "nairol203",
      url: "https://nairol.de",
    },
  ],
  openGraph: {
    title: "KVG Bus Tracker",
    description:
      "Aktuelle Abfahrtszeiten aller Buslinien der KVG Kiel. Echtzeit-Infos, alle Buslinien und Verspätungen auf einen Blick.",
    url: "/",
    siteName: "KVG Bus Tracker",
    locale: "de_DE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "KVG Bus Tracker Kiel",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <PlausibleProvider src="https://analytics.nairol.de/js/pa-iU2SoF4z90SshP85iUojz.js" />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
