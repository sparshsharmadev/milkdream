"use client";

"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { getFirebaseErrorMessage } from "@/lib/errorUtils";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      router.push("/verify");
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative z-10 pt-20">
      
      <Link href="/" className="absolute top-8 left-6 md:left-20 flex items-center space-x-2 text-white/50 hover:text-white transition-colors z-50">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium tracking-wide">Home</span>
      </Link>
      
      {/* Left side: Typography */}
      <div className="w-full md:w-1/2 p-6 md:p-20 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl md:text-8xl font-medium tracking-normal mb-6 text-white leading-none font-serif italic">
            Join.
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light max-w-md">
            Create an anchor in the continuum.
          </p>
        </motion.div>
      </div>

      {/* Right side: Editorial Form */}
      <div className="w-full md:w-1/2 p-6 md:p-20 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          
          {error && (
            <div className="mb-8 p-4 border-l-2 border-white text-white text-sm bg-white/5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-12">
            
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/20 py-4 text-2xl md:text-3xl text-white placeholder-transparent focus:outline-none focus:border-white transition-colors"
                placeholder="Email"
                required
                id="email"
              />
              <label htmlFor="email" className="absolute left-0 -top-6 text-sm font-medium text-white/50 transition-all peer-placeholder-shown:text-2xl peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-white pointer-events-none">
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/20 py-4 pr-12 text-2xl md:text-3xl text-white placeholder-transparent focus:outline-none focus:border-white transition-colors"
                placeholder="Password"
                required
                id="password"
                minLength={6}
              />
              <label htmlFor="password" className="absolute left-0 -top-6 text-sm font-medium text-white/50 transition-all peer-placeholder-shown:text-2xl peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-white pointer-events-none">
                Password
              </label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-4 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-6 flex items-center justify-between border-b border-white/20 hover:border-white transition-colors disabled:opacity-50"
            >
              <span className="text-2xl font-light">{loading ? "Registering..." : "Create Capsule"}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <div className="mt-16">
            <p className="text-white/40 text-sm">
              Already have an anchor? <Link href="/login" className="text-white hover:underline transition-all">Sign In</Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
