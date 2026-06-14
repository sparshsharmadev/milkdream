"use client";

"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mx-auto mb-8 border border-white/20">
          <MailCheck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-medium mb-4 tracking-normal text-white font-serif italic">Check Your Inbox.</h1>
        <p className="text-white/50 mb-4 font-light text-lg">
          We've sent a verification link to your email. Click it to enter the void.
        </p>
        <p className="text-white/30 mb-12 font-light text-sm italic">
          If you don't see it, please check your spam folder.
        </p>

        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-xs text-white/40 uppercase tracking-widest font-mono">Awaiting Verification</p>
      </motion.div>
    </div>
  );
}
