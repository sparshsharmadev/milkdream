/**
 * Motion Intent: Verification page with smooth status indicator.
 * - Entrance: 400ms easeOut.
 * - Accessible auto-polling loop feedback.
 */

"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { pageVariants } from "@/lib/motion.config";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    const checkVerification = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(checkVerification);
          router.push("/dashboard");
        }
      }
    }, 3000);

    return () => clearInterval(checkVerification);
  }, [router]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="py-16 sm:py-24 flex flex-col items-center justify-center text-center"
    >
      <div className="w-14 h-14 rounded-xl bg-white/5 border border-[#27272a] flex items-center justify-center mb-6">
        <MailCheck className="w-7 h-7 text-white" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
        Check Your Inbox
      </h1>
      <p className="text-sm text-[#71717a] max-w-sm mb-2 leading-relaxed">
        We've sent a verification link to your email. Click it to activate your archive access.
      </p>
      <p className="text-xs text-[#71717a]/70 italic mb-8">
        If you don't see it, check your spam or promotions tab.
      </p>

      {/* Pulsing indicator */}
      <div className="flex items-center space-x-2 text-xs font-mono text-[#71717a]">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Awaiting confirmation...</span>
      </div>
    </motion.div>
  );
}
