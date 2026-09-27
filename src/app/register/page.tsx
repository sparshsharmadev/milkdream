/**
 * Motion Intent: Registration with focused micro-interactions and accessible feedback.
 * - Form entrance: 400ms easeOut.
 * - Interactive spring buttons.
 */

"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { getFirebaseErrorMessage } from "@/lib/errorUtils";
import { pageVariants, buttonMotion } from "@/lib/motion.config";
import DreamMark from "@/components/DreamMark";

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
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="auth-page"
    >
      <div className="auth-shell">
        <aside className="auth-editorial">
          <Link href="/" className="auth-brand">
            <DreamMark className="dream-mark auth-brand-mark" />
            <span>Milkdream <small>PERSONAL MEMORY ARCHIVE</small></span>
          </Link>
          <div className="auth-editorial-copy">
            <span className="auth-overline">A PLACE TO KEEP THE MOMENT</span>
            <p>Start with what<br />you <em>remember.</em></p>
            <div className="auth-mark" aria-hidden="true">
              <span className="auth-mark-line" />
              <span className="auth-mark-label">PRIVATE / BY DESIGN</span>
            </div>
          </div>
          <span className="auth-edition">FIELD RECORD 01&nbsp;&nbsp;·&nbsp;&nbsp;MILKDREAM</span>
        </aside>

        <section className="auth-form-panel" aria-labelledby="register-title">
          <Link href="/" className="auth-back"><ArrowLeft size={15} /> Home</Link>
          <div className="auth-form-heading">
            <span className="auth-overline">YOUR FIRST PAGE</span>
            <h1 id="register-title">Make room<br /><em>for memory.</em></h1>
            <p>Create a private account to begin your archive.</p>
          </div>

        {/* Feedback Banners */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="auth-feedback auth-feedback-error"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input auth-password-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="auth-eye-button"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="auth-submit-wrap">
            <motion.button
              {...buttonMotion}
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              <span>{loading ? "Registering..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-switch">
          Already have an archive?{" "}
          <Link href="/login">
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
        <div className="auth-privacy"><LockKeyhole size={14} /> Your reflections stay yours.</div>
        </section>
      </div>
    </motion.div>
  );
}
