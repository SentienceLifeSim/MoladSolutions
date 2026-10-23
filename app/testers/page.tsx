import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import Hub from "./_parts/Hub";
import "./testers.css";

const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Sentience Tester Hub | Sublime Labs",
  description: "Report bugs, see what's been found, and follow every Sentience build.",
  robots: { index: false, follow: false },
};

export default function TestersPage() {
  return <div className={instrument.variable}><Hub /></div>;
}
