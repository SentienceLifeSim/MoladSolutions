import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBanner from "@/components/TopBanner";
import ViewTracker from "@/components/ViewTracker";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Molad Solutions | Crafting Real Experiences Through Technology",
  description:
    "Molad Solutions builds immersive apps that create meaningful experiences. Creators of Sentience and Sueno.",
  openGraph: {
    title: "Molad Solutions",
    description: "Crafting real experiences through technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TopBanner />
        <ViewTracker />
        {children}
      </body>
    </html>
  );
}
