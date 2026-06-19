import Services from "@/components/Services";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Molad Solutions",
  description:
    "Turn your app idea into a profitable digital product. Custom UI/UX design, App Store deployment, 90 days of post-launch support, and ASO growth strategy.",
};

export default function ServicesPage() {
  return (
    <main>
      {/* Back nav */}
      <div className="px-6 pt-8 pb-0 max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors text-sm"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Molad Solutions
        </Link>
      </div>

      <Services />
      <Footer />
    </main>
  );
}
