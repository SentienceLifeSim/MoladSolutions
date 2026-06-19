"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
            Sentience,{" "}
            <span className="text-white font-semibold">
              crossed $5,000 in monthly revenue within just 2 months of launching
            </span>{" "}
            and continues to scale.
          </p>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl mx-auto">
            When you partner with Molad Solutions, you aren&apos;t just getting
            programmers. You are getting insights from active developers who know
            exactly what it takes to climb the App Store charts, optimize user
            retention, and drive real profit.
          </p>

          {/* Revenue dashboard screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 mx-auto rounded-2xl overflow-hidden"
            style={{
              maxWidth: 560,
              border: "1px solid rgba(139,92,246,0.4)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.15), 0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(99,102,241,0.1)",
              filter: "drop-shadow(0 8px 32px rgba(99,102,241,0.2))",
            }}
          >
            <Image
              src="/revenue-dashboard.png"
              alt="Sentience monthly revenue dashboard"
              width={1120}
              height={630}
              className="w-full h-auto block"
            />
          </motion.div>
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

        {/* ── Core Application Packages ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Pricing</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Core Application Packages</h3>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 mb-5">
          {[
            {
              tier: "Tier 1",
              name: "The 30-Day Sprint",
              use: "MVPs, simple content apps, directory apps, or basic utility tools with minimal backend complexity.",
              timeline: "15–30 Days",
              price: "$3,500 – $5,000",
              bullets: [
                "Complete UI/UX Design & Core Functional Build",
                "Native App Store & Google Play Submission",
                "3 Months of Post-Launch Co-Piloting & Framework Stability",
                "Apple Search Ads Setup + $100 Promotional Ad Credit Integration",
              ],
              accent: "rgba(99,102,241,0.35)",
              accentText: "#a78bfa",
            },
            {
              tier: "Tier 2",
              name: "The Horizon Package",
              use: "Apps requiring user accounts, simple databases, social features, or basic API integrations.",
              timeline: "2 – 3 Months",
              price: "$7,500 – $12,000",
              bullets: [
                "Advanced Database Architecture & Schema Design",
                "Secure User Authentication & Dedicated Data Storage",
                "Native App Store & Google Play Submission",
                "3 Months of Premium Post-Launch Optimization & Co-Piloting",
                "Apple Search Ads Setup + $100 Promotional Ad Credit Integration",
              ],
              accent: "rgba(139,92,246,0.4)",
              accentText: "#c4b5fd",
            },
            {
              tier: "Tier 3",
              name: "The Custom Ecosystem",
              use: "Highly complex systems, deep AI integrations, custom algorithms, or gamified mechanics.",
              timeline: "4 – 6+ Months",
              price: "$15,000 – $25,000+",
              priceSub: "or $4,000–$5,000 / month retainer during build",
              bullets: [
                "Custom Structural Architecture & Advanced API Systems",
                "Bespoke AI Logic Pathways & Immersive Interactive UI Loops",
                "Deep Database Optimization & Core Scaling Safeguards",
                "Elite Post-Launch Co-Piloting & Technical Support Priorities",
              ],
              accent: "rgba(167,139,250,0.45)",
              accentText: "#e9d5ff",
            },
          ].map((pkg, i) => (
            <motion.div
              key={pkg.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="rounded-2xl p-6 sm:p-7 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: `${pkg.accent}`, color: pkg.accentText, border: `1px solid ${pkg.accentText}40` }}
                >
                  {pkg.tier}
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                >
                  {pkg.timeline}
                </span>
              </div>

              <h4 className="text-white font-bold text-lg mb-2">{pkg.name}</h4>
              <p className="text-white/35 text-xs leading-relaxed mb-5">{pkg.use}</p>

              <div className="mb-5">
                <div className="text-white font-bold text-xl" style={{ color: pkg.accentText }}>{pkg.price}</div>
                {pkg.priceSub && (
                  <div className="text-white/30 text-xs mt-1">{pkg.priceSub}</div>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 mt-auto">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pkg.accentText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-white/50 text-xs leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Web Development & Launch Ecosystems ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 mb-8 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Web Services</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Web Development &amp; Launch Ecosystems
          </h3>
          <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Elevate your brand with high-converting web architectures designed to drive traffic, convert users, and complement your mobile app ecosystem flawlessly.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {[
            {
              label: "Web Add-On",
              name: "The App Launch Landing Page",
              use: "The ultimate conversion engine. A high-converting, single-page marketing site built specifically to drive pre-registrations, showcase app features, and capture emails before and during your launch.",
              timeline: "7–14 Days",
              price: "$500 – $1,500",
              bullets: [
                "Custom Premium Design Matching Your App's UI/UX Theme",
                "Optimized Core Web Vitals for Lightning-Fast Load Speeds",
                "Clean Lead Capture Form Integration & Email Marketing System Hookup",
                "Fully Responsive Layout (Flawless on Mobile, Desktop, & Tablet)",
              ],
              accent: "rgba(56,189,248,0.3)",
              accentText: "#7dd3fc",
            },
            {
              label: "Full Website",
              name: "The Complete Brand Ecosystem",
              use: "For companies and platforms needing a complete multi-page web presence. Perfect for SaaS platforms, comprehensive business directories, or complex corporate sites.",
              timeline: "21–30 Days",
              price: "$2,500 – $6,000",
              bullets: [
                "Multi-Page Architecture (Home, Features, Pricing, About, Contact, Blog)",
                "Custom CMS Setup for Easy Article & Product Publishing",
                "Integrated SEO Framework Setup for Fast Organic Google Rankings",
                "Full Web Analytics & Traffic Tracking Dashboard Integration",
              ],
              accent: "rgba(34,211,238,0.3)",
              accentText: "#67e8f9",
            },
          ].map((pkg, i) => (
            <motion.div
              key={pkg.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="rounded-2xl p-6 sm:p-7 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: pkg.accent, color: pkg.accentText, border: `1px solid ${pkg.accentText}40` }}
                >
                  {pkg.label}
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                >
                  {pkg.timeline}
                </span>
              </div>

              <h4 className="text-white font-bold text-lg mb-2">{pkg.name}</h4>
              <p className="text-white/35 text-xs leading-relaxed mb-5">{pkg.use}</p>

              <div className="text-xl font-bold mb-5" style={{ color: pkg.accentText }}>{pkg.price}</div>

              <ul className="flex flex-col gap-2.5 mt-auto">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pkg.accentText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-white/50 text-xs leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Ecosystem Bundle Offer Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 rounded-2xl p-7 sm:p-9"
          style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.12) 50%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 0 40px rgba(56,189,248,0.06), 0 0 80px rgba(99,102,241,0.04)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="flex-shrink-0 text-2xl w-12 h-12 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.2)" }}
            >
              🚀
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7dd3fc" }}>
                Bundle Offer
              </p>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                <span className="text-white font-bold">The Complete Founder Ecosystem Bundle:</span>{" "}
                Code your app and build your web empire at the same time. Lock in any Core Application Package alongside a Website Package and receive{" "}
                <span className="font-bold" style={{ color: "#7dd3fc" }}>15% off the total build price</span>, plus an extended{" "}
                <span className="font-bold" style={{ color: "#c4b5fd" }}>6 months of complimentary co-piloting</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Post-Launch Maintenance Retainers ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 text-center">For Existing Clients</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Post-Launch Maintenance Packages
          </h3>
          <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-center">
            Our introductory 90 days of co-piloting ensures a flawless rollout. Afterward, easily transition into a monthly retainer to keep your platform optimized, updated, and completely bug-free as operating systems evolve.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            {
              label: "Package A",
              name: "The Baseline Anchor",
              focus: "Keep the Lights On",
              price: "$299 / month",
              bullets: [
                "Monthly iOS & Android OS Compatibility Audits",
                "Critical Frame Fixes & Proactive Bug Resolution",
                "Up to 2 Hours of Dedicated Minor Design or Copy Tweaks Monthly",
              ],
              accent: "rgba(99,102,241,0.35)",
              accentText: "#a78bfa",
            },
            {
              label: "Package B",
              name: "The Growth Retainer",
              focus: "Active Iteration",
              price: "$799 – $1,200 / month",
              bullets: [
                "Priority Developer Support Response Pathways",
                "Core Framework Upgrades & Speed Optimization Monitoring",
                "Up to 8–10 Hours of New Feature Implementation & UI Expansion Monthly",
              ],
              accent: "rgba(139,92,246,0.4)",
              accentText: "#c4b5fd",
            },
          ].map((pkg, i) => (
            <motion.div
              key={pkg.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="rounded-2xl p-6 sm:p-7 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: pkg.accent, color: pkg.accentText, border: `1px solid ${pkg.accentText}40` }}
                >
                  {pkg.label}
                </span>
                <span className="text-xs text-white/30 font-medium">{pkg.focus}</span>
              </div>

              <h4 className="text-white font-bold text-lg mb-4">{pkg.name}</h4>

              <div className="text-xl font-bold mb-5" style={{ color: pkg.accentText }}>{pkg.price}</div>

              <ul className="flex flex-col gap-2.5 mt-auto">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pkg.accentText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-white/50 text-xs leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
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
