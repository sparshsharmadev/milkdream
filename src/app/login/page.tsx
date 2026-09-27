/**
 * Motion Intent: Focused authentication pages with clean field micro-interactions.
 * - Form entrance: 400ms easeOut.
 * - Button spring feedback (hover: 1.05, tap: 0.97).
 * - Accessible input outlines and error states.
 */

"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { getFirebaseErrorMessage } from "@/lib/errorUtils";
import { pageVariants, buttonMotion } from "@/lib/motion.config";
import DreamMark from "@/components/DreamMark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email first.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setError("");
    setMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Password reset email sent.");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
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
            <span className="auth-overline">RETURN TO YOUR NOTES</span>
            <p>Some things are worth<br />remembering <em>exactly.</em></p>
            <div className="auth-mark" aria-hidden="true">
              <span className="auth-mark-line" />
              <span className="auth-mark-label">PRIVATE / BY DESIGN</span>
            </div>
          </div>
          <span className="auth-edition">FIELD RECORD 01&nbsp;&nbsp;·&nbsp;&nbsp;MILKDREAM</span>
        </aside>

        <section className="auth-form-panel" aria-labelledby="login-title">
          <Link href="/" className="auth-back"><ArrowLeft size={15} /> Home</Link>
          <div className="auth-form-heading">
            <span className="auth-overline">YOUR ARCHIVE IS HERE</span>
            <h1 id="login-title">Welcome<br /><em>back.</em></h1>
            <p>Sign in to pick up where you left off.</p>
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
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="auth-feedback auth-feedback-success"
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} className="auth-form">
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
            <div className="auth-label-row">
              <label htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="auth-text-button"
              >
                Reset
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>

        {/* Google OAuth */}
        <div className="auth-divider"><span>OR</span></div>
        <div className="auth-google-wrap">
          <motion.button
            {...buttonMotion}
            type="button"
            onClick={handleGoogleLogin}
            className="auth-google"
          >
            Continue with Google
          </motion.button>
        </div>

        {/* Footer */}
        <div className="auth-switch">
          New to Milkdream?{" "}
          <Link href="/register">
            Create an archive <ArrowRight size={14} />
          </Link>
        </div>
        <div className="auth-privacy"><LockKeyhole size={14} /> Your reflections stay yours.</div>
        </section>
      </div>
    </motion.div>
  );
}
