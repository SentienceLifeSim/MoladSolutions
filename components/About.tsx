"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-8"
        >
          About Us
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/50 text-lg sm:text-xl leading-relaxed"
        >
          We build apps that create meaningful, immersive experiences. At Molad
          Solutions, we believe technology should bring people closer to stories
          that matter, characters that feel real, and worlds worth exploring.
        </motion.p>
      </div>
    </section>
  );
}
