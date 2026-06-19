"use client";

import { motion } from "framer-motion";

const services = [
  {
    icon: "✦",
    title: "Custom UI/UX Design & Development",
    desc: "Built specifically for your audience, blending high quality aesthetics with seamless performance.",
  },
  {
    icon: "⬆",
    title: "App Store Deployment",
    desc: "We handle the complex Apple App Store & Google Play approval processes for you from start to finish.",
  },
  {
    icon: "🛡",
    title: "3 Months of Post-Launch Co-Piloting",
    desc: "We don't just build it and leave. We stay by your side for 90 days post-launch to ensure smooth performance and stability.",
  },
  {
    icon: "📈",
    title: "ASO & Growth Marketing Strategy",
    desc: "Tailored App Store Optimization and conversion benchmarks designed to drive organic downloads and visibility from day one. Plus, we will set up your Apple Search Ads account with a $100 promotional credit to jumpstart your early momentum.",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-32 px-6 overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/70 mb-4">
            For Entrepreneurs & Visionaries
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Turn Your Vision Into a{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #a78bfa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Profitable App Asset
            </span>
          </h2>
          <p className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Have a brilliant app idea but don&apos;t know how to write a single
            line of code? We handle the heavy lifting so you can own a scalable
            digital product.
          </p>
        </motion.div>

        {/* Revenue callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="my-14 rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            boxShadow: "0 0 40px rgba(99,102,241,0.08)",
          }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            We Don&apos;t Just Build Apps.{" "}
            <span style={{ color: "#a78bfa" }}>We Scale Them.</span>
          </h3>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            We practice exactly what we preach. Our flagship life-simulation app,
            Sentience, generates{" "}
            <span className="text-white font-semibold">
              $5,000+ in monthly revenue
            </span>{" "}
            and continues to grow.
          </p>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl mx-auto">
            When you partner with Molad Solutions, you aren&apos;t just getting
            programmers. You are getting insights from active developers who know
            exactly what it takes to climb the App Store charts, optimize user
            retention, and drive real profit.
          </p>
        </motion.div>

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-widest text-white/30 mb-8"
        >
          Our Complete Launchpad Package Includes
        </motion.p>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-xl"
                style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}
              >
                {svc.icon}
              </div>
              <h4 className="text-white font-semibold text-base mb-2">
                {svc.title}
              </h4>
              <p className="text-white/45 text-sm leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-white/40 text-base mb-8 max-w-xl mx-auto">
            Ready to build your digital ecosystem? Reach out to us today for
            details, custom packaging, and pricing. Let&apos;s turn your concept
            into a live product.
          </p>
          <a
            href="mailto:Support@moladsolutions.com?subject=App Strategy Session Request"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#c4b5fd",
              boxShadow: "0 0 24px rgba(99,102,241,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 40px rgba(99,102,241,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(139,92,246,0.8)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 24px rgba(99,102,241,0.2)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(139,92,246,0.5)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
            </svg>
            Book Your Free App Strategy Session
          </a>
        </motion.div>
      </div>
    </section>
  );
}
