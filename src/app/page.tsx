"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 50, damping: 20 } 
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-6 md:px-20 relative z-10">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-7xl mx-auto"
      >
        <motion.div variants={item} className="mb-12">
          <div className="flex items-center space-x-6">
            <div className="h-[1px] w-12 md:w-24 bg-white/30"></div>
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-medium text-white/50">
              Capture the moment
            </span>
          </div>
        </motion.div>

        <motion.h1 variants={item} className="text-6xl sm:text-7xl md:text-[10rem] font-medium tracking-normal mb-8 leading-[0.9] text-white mix-blend-difference font-serif italic">
          Milkdream.
        </motion.h1>
        
        <motion.p variants={item} className="text-xl md:text-3xl text-white/50 mb-16 max-w-3xl leading-snug font-light">
          Capture exact moments. Speak to the void. Leave notes for your future self. Pure, unadulterated time.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 sm:gap-6">
          <Link 
            href="/register" 
            className="group relative px-10 py-5 bg-white text-black font-semibold flex items-center justify-center space-x-3 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 text-lg tracking-wide">Enter the cluster</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link 
            href="/login" 
            className="px-10 py-5 bg-transparent border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors text-lg tracking-wide"
          >
            Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
