import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import Hub from "./_parts/Hub";
import "./testers.css";

const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: "Sentience Tester Hub | Sublime Labs",
  description: "Report bugs, see what's been found, and follow every Sentience build.",
  robots: { index: false, follow: false },
};

export default function TestersPage() {
  return <div className={orbitron.variable}><Hub /></div>;
}
