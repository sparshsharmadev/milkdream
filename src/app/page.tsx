/**
 * Motion Intent: Landing page with choreographed hierarchy.
 * - Staggered entrance (staggerChildren: 60ms, duration: 400ms, ease: [0.25, 0.1, 0.25, 1])
 * - Spring micro-interactions on CTA buttons (scale: 1.05 hover, scale: 0.97 tap)
 * - Accessible contrast and typography.
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Clock3, LockKeyhole, MapPin, Plus } from "lucide-react";
import { pageVariants } from "@/lib/motion.config";
import DreamMark from "@/components/DreamMark";

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="archive-home"
    >
      <header className="home-masthead">
        <Link href="/" className="home-brand" aria-label="Milkdream home">
          <DreamMark className="dream-mark home-brand-mark" />
          <span className="home-brand-name">Milkdream<small>PERSONAL MEMORY ARCHIVE</small></span>
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#how-it-works">The archive</a>
          <Link href="/login" className="home-signin">Sign in <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <div className="home-kicker"><span>FIELD NOTES FOR THE FUTURE</span><span>NO. 001 / OPEN</span></div>
          <h1 id="home-title">Keep a little<br />of <em>now.</em></h1>
          <p className="home-hero-deck">A personal archive for the moments you want to remember as they really were.</p>
          <div className="home-hero-actions">
            <Link href="/register" className="home-primary-action">Create your archive <ArrowRight size={17} /></Link>
            <Link href="/login" className="home-secondary-action">I already have an account</Link>
          </div>
          <span className="home-action-note">Private by design · Free to begin</span>
        </div>

        <aside className="home-specimen" aria-label="Example saved reflection">
          <div className="specimen-topline"><span>EXAMPLE REFLECTION</span><span>MD—001</span></div>
          <div className="specimen-date"><span>TUESDAY</span><strong>14</strong><span>OCTOBER · 2025</span></div>
          <div className="specimen-content">
            <span className="specimen-tag">SMALL THINGS</span>
            <h2>The light in the kitchen</h2>
            <p>It was late afternoon, and the whole room turned the color of honey. I stopped what I was doing just long enough to notice.</p>
            <span className="specimen-label">A made-up example of a saved note</span>
          </div>
          <div className="specimen-footer">
            <span><MapPin size={13} /> Home, near the window</span>
            <span><Clock3 size={13} /> 4:42 pm</span>
          </div>
        </aside>
        <div className="home-orbit-note"><ArrowDownRight size={17} /><span>ONE MOMENT<br />AT A TIME</span></div>
      </section>

      <section className="home-reading" id="how-it-works" aria-label="About your archive">
        <div className="home-reading-label">
          <span>THE PRACTICE</span>
          <span className="home-rule" />
          <span>01 / 03</span>
        </div>
        <div className="home-reading-copy">
          <p className="home-dropcap">Write down what happened while the details are still close: the conversation, the route home, the exact feeling you nearly forgot. Add a place and time when they help tell the story. Your reflection stays in your archive, and later edits become earlier versions instead of replacing what you first wrote. Come back to read the original, follow how your thinking changed, or export a note to keep elsewhere. Milkdream is built for remembering in your own words, without turning private moments into a public feed.</p>
        </div>
        <div className="home-actions">
          <span className="home-action-caption">A SMALL START</span>
          <span className="home-action-detail"><Plus size={15} /> One entry is enough.</span>
        </div>
      </section>

      <section className="home-index-list" aria-label="Archive details">
        <article className="home-index-item">
          <span className="home-item-number">A</span>
          <MapPin size={18} strokeWidth={1.5} aria-hidden="true" />
          <div><h2>Place & time</h2><p>Keep the context around the thought.</p></div>
        </article>
        <article className="home-index-item">
          <span className="home-item-number">B</span>
          <Clock3 size={18} strokeWidth={1.5} aria-hidden="true" />
          <div><h2>Every version</h2><p>Follow an idea as it shifts.</p></div>
        </article>
        <article className="home-index-item">
          <span className="home-item-number">C</span>
          <LockKeyhole size={18} strokeWidth={1.5} aria-hidden="true" />
          <div><h2>Yours alone</h2><p>A quiet archive, made for you.</p></div>
        </article>
      </section>

      <footer className="home-bottom-note">
        <span>YOUR WORDS. YOUR TIMELINE. YOURS TO KEEP.</span>
        <Link href="/register">Begin with one reflection <ArrowRight size={15} /></Link>
      </footer>
    </motion.div>
  );
}
