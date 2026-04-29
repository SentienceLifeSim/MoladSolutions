"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AppCardProps {
  name: string;
  description: string;
  icon: string;
  appStoreUrl: string;
  gradient: string;
}

export default function AppCard({
  name,
  description,
  icon,
  appStoreUrl,
  gradient,
}: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]"
    >
      <div
        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] overflow-hidden shadow-lg shadow-${gradient}/20 mb-6`}
      >
        <Image
          src={icon}
          alt={`${name} icon`}
          width={112}
          height={112}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        {name}
      </h3>

      <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 max-w-sm">
        {description}
      </p>

      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all text-white text-sm font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 21.99C7.78997 22.03 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
        </svg>
        Download on the App Store
      </a>
    </motion.div>
  );
}
