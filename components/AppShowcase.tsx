"use client";

import { motion } from "framer-motion";
import AppCard from "./AppCard";

const apps = [
  {
    name: "Sentience",
    description:
      "Live a thousand lives. A deeply immersive life simulation where every choice shapes your story.",
    icon: "/sentience-icon.png",
    appStoreUrl: "https://apps.apple.com/us/app/sentience-life-sim/id6759975000",
    gradient: "purple-500",
  },
  {
    name: "Sueno",
    description:
      "Your AI companions, your stories. Chat with characters that remember, evolve, and surprise you.",
    icon: "/sueno-icon.png",
    appStoreUrl: "https://apps.apple.com/us/app/sueno/id6760856713",
    gradient: "cyan-500",
  },
];

export default function AppShowcase() {
  return (
    <section id="apps" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-4"
        >
          Our Apps
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/40 text-center mb-16 text-lg"
        >
          Experiences that stay with you
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {apps.map((app) => (
            <AppCard key={app.name} {...app} />
          ))}
        </div>
      </div>
    </section>
  );
}
