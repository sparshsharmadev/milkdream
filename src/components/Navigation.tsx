/**
 * Motion Intent: Navigation with purposeful micro-interactions.
 * - Underline hover animation on nav links (scaleX: 0 -> 1, 250ms easeOut).
 * - Button scale spring feedback on sound toggle and actions.
 * - Sticky header with subtle backdrop blur.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Plus, LogOut } from "lucide-react";
import { buttonMotion } from "@/lib/motion.config";
import DreamMark from "@/components/DreamMark";

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const handleLogout = async () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      setIsPlayingSound(false);
    }
    await logout();
    router.push("/");
  };

  const toggleAmbientSound = () => {
    try {
      if (isPlayingSound) {
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.suspend();
        }
        setIsPlayingSound(false);
      } else {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
          const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!AudioContextClass) return;
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.03;
            b6 = white * 0.115926;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 260;

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
          gainNodeRef.current = gainNode;

          whiteNoise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          whiteNoise.start(0);
        } else {
          audioCtxRef.current.resume();
        }
        setIsPlayingSound(true);
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!user || pathname === "/editor") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="nav-dream-mark">
            <DreamMark className="dream-mark" />
          </div>
          <span className="font-semibold tracking-tight text-white text-base">
            Milkdream
          </span>
        </Link>

        {/* Action Items */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Ambient Sound Toggle */}
          <motion.button
            {...buttonMotion}
            onClick={toggleAmbientSound}
            aria-label={isPlayingSound ? "Mute ambient sound" : "Play ambient sound"}
            className={`p-2 rounded-md border text-xs font-mono flex items-center space-x-1.5 transition-colors ${
              isPlayingSound 
                ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300" 
                : "border-[#27272a] bg-[#121215] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
            }`}
          >
            {isPlayingSound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{isPlayingSound ? "Ambiance" : "Muted"}</span>
          </motion.button>

          {/* Nav Links with animated underline */}
          <Link href="/dashboard" className="relative text-sm text-[#fafafa] font-medium py-1 group">
            <span>Archive</span>
            <motion.span 
              className={`absolute bottom-0 left-0 right-0 h-[2px] bg-white origin-left ${
                pathname === "/dashboard" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              } transition-transform duration-250 ease-out`}
            />
          </Link>

          {/* New Capsule CTA */}
          <Link href="/editor">
            <motion.button
              {...buttonMotion}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white text-black font-semibold text-xs rounded-md shadow hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Capsule</span>
            </motion.button>
          </Link>

          {/* Logout */}
          <motion.button
            {...buttonMotion}
            onClick={handleLogout}
            aria-label="Sign out"
            className="p-2 text-[#71717a] hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
