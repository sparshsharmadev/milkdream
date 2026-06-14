"use client";

import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: ["0%", "20%", "-10%", "0%"],
          y: ["0%", "-20%", "10%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-cyan-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-60"
      />
      <motion.div
        animate={{
          x: ["0%", "-30%", "20%", "0%"],
          y: ["0%", "30%", "-10%", "0%"],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] bg-rose-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50"
      />
      <motion.div
        animate={{
          x: ["0%", "15%", "-25%", "0%"],
          y: ["0%", "-15%", "20%", "0%"],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[10%] left-[30%] w-[45vw] h-[45vw] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40"
      />
    </div>
  );
}
