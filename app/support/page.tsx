import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Sublime Labs",
  description:
    "Get help with Sentience, Sueno, and other Sublime Labs apps. Contact support, restore purchases, and find answers to common questions.",
};

const faqs = [
  {
    q: "How do I restore my purchases?",
    a: "Open Sentience → tap the menu icon → Store → Restore Purchases.",
  },
  {
    q: "My game progress disappeared. What do I do?",
    a: "Make sure iCloud is enabled on your device. Go to Settings → Apple ID → iCloud and ensure Sentience is toggled on.",
  },
  {
    q: "Can I get a refund?",
    a: "All purchases are final and non-refundable. We do not issue refunds for any in-app purchases, Sentience Store purchases, or subscriptions. If you believe there was an unauthorized charge, contact your payment provider directly.",
  },
  {
    q: "I found a bug. How do I report it?",
    a: "Email us at support@sublimelabs.tech with your device model, iOS version, and a description of the issue.",
  },
];

export default function SupportPage() {
  return (
    <main>
      {/* Back nav */}
      <div className="px-6 pt-8 pb-0 max-w-2xl mx-auto">
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
          Back to Sublime Labs
        </Link>
      </div>

      <section className="px-6 py-16 max-w-2xl mx-auto space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text pb-1">
            Support
          </h1>
          <p className="text-white/50 text-lg">
            Get help with Sentience, Sueno, and other Sublime Labs apps.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-lg">Contact Us</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Have a question, bug report, or feedback? We&apos;d love to hear
            from you.
          </p>
          <a
            href="mailto:support@sublimelabs.tech"
            className="glass-card flex items-center gap-3 rounded-xl px-5 py-4 transition-opacity hover:opacity-80"
          >
            <span className="text-xl">✉</span>
            <div>
              <p className="text-white text-sm font-medium">
                support@sublimelabs.tech
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                We typically respond within 1–2 business days
              </p>
            </div>
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-card rounded-xl px-5 py-4 space-y-1">
                <p className="text-white text-sm font-medium">{q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
