"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  ArrowUpRight,
  Send,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// FOOTER — Vertical-inspired closing section
//
// Layout (per vertical.framer.media):
//   TOP SECTION (3 columns):
//     LEFT:   "I'AM" (massive white) + "MUSA KHAN" (acid green)
//             + tagline + signature + role
//     CENTER: Portrait image (with glitch effect)
//     RIGHT:  Bio paragraph
//
//   BOTTOM SECTION (3 columns):
//     LEFT:   Manifesto quote
//     CENTER: "I MAKE WORK ACROSS..." + socials
//     RIGHT:  "THINGS I DO" list + "VIEW THE WORK" CTA
//
//   VERY BOTTOM: Huge "MUSA KHAN" wordmark + copyright
// ============================================================

const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
};

// ---- Reduced motion (SSR-safe via useSyncExternalStore) ----
function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// ---- Helpers ----
function isPlaceholderUrl(url: string): boolean {
  return !url || url.startsWith("YOUR_");
}

// ---- Signature font (Rock Salt) ----
const SIG_FONT = {
  fontFamily: "var(--font-rock-salt), cursive",
};

// ---- Glitch portrait component ----
// Subtle, professional glitch effect.
// Uses a single RGB-split layer that briefly offsets and fades,
// triggered at a slow, natural interval. No jarring slices or scan lines.
function GlitchPortrait() {
  const [glitching, setGlitching] = React.useState(false);

  React.useEffect(() => {
    const triggerGlitch = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 180);
    };

    const interval = setInterval(triggerGlitch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden">
      {/* Base image */}
      <img
        src="/images/me/me2.png"
        alt="Portrait of Musa Khan"
        className="h-full w-full object-cover"
        style={{ filter: "grayscale(0.15) contrast(1.1) brightness(0.85)" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Subtle RGB-split layer — brief, smooth, professional */}
      {glitching && (
        <>
          <img
            src="/images/me/me2.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              filter: "grayscale(0.15) contrast(1.1) brightness(0.85) hue-rotate(-15deg) saturate(1.5)",
              transform: "translateX(4px)",
              opacity: 0.35,
              mixBlendMode: "screen",
            }}
          />
          <img
            src="/images/me/me2.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              filter: "grayscale(0.15) contrast(1.1) brightness(0.85) hue-rotate(150deg) saturate(1.5)",
              transform: "translateX(-4px)",
              opacity: 0.35,
              mixBlendMode: "screen",
            }}
          />
        </>
      )}

      {/* Placeholder if image doesn't exist */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-graphite">
        <div className="text-center">
          <p className="label-mono text-ash">PORTRAIT</p>
          <p className="font-sans text-4xl text-ash/30">MK</p>
        </div>
      </div>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}

// ---- Social link config ----
type SocialDef = {
  label: string;
  href: string;
  icon: React.ReactNode;
};
function buildSocials(): SocialDef[] {
  return [
    {
      label: "Email",
      href: `mailto:${siteConfig.email}`,
      icon: <Mail className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "GitHub",
      href: siteConfig.githubUrl,
      icon: <Github className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "LinkedIn",
      href: siteConfig.linkedinUrl,
      icon: <Linkedin className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Instagram",
      href: siteConfig.instagramUrl,
      icon: <Instagram className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Facebook",
      href: siteConfig.facebookUrl,
      icon: <Facebook className="h-5 w-5" aria-hidden="true" />,
    },
  ];
}

// ---- Data ----
const QUOTE_LINES = [
  "Perfection is achieved,",
  "not when there is nothing",
  "more to add, but when",
  "there is nothing left to",
  "take away.",
];
const QUOTE_ATTR = "— Antoine de Saint-Exupéry";

const STATEMENT_WORDS: Array<{ word: string; muted: boolean }> = [
  { word: "I", muted: false },
  { word: "MAKE", muted: false },
  { word: "WORK", muted: false },
  { word: "ACROSS", muted: true },
  { word: "CODE,", muted: false },
  { word: "RESEARCH,", muted: false },
  { word: "MOTION,", muted: false },
  { word: "AND", muted: true },
  { word: "SOUND.", muted: false },
];
const STATEMENT_SUB = "Most projects start with a question. Research shapes the next step.";

const THINGS_I_DO = [
  "SOFTWARE & SYSTEMS",
  "RESEARCH & XAI",
  "VISUAL & MOTION",
  "SOUND & RHYTHM",
  "DESIGN & FORM",
  "DIGITAL EXPLORATION",
];

const TAGLINE = "DEVELOPING WORK ACROSS DIGITAL AND PHYSICAL FORMATS.";

// ---- ContactForm — sends message directly to musakhan5572@gmail.com ----
function ContactForm({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-graphite/60 px-4 py-3 font-sans text-sm text-paper placeholder:text-ash/50 focus:border-acid focus:outline-none transition-colors duration-300";

  return (
    <div className="flex flex-col gap-4">
      <p className="label-mono text-ash">
        <span className="text-acid">/</span> SEND A MESSAGE
      </p>

      {status === "success" && (
        <div className="rounded-lg border border-acid/40 bg-acid/10 px-4 py-3">
          <p className="label-mono text-acid">MESSAGE SENT ✓</p>
          <p className="font-sans text-xs text-ash mt-1">I'll get back to you soon.</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <p className="label-mono text-red-400">ERROR SENDING MESSAGE</p>
          <p className="font-sans text-xs text-ash mt-1">Please try again or email directly.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className={cn(inputClass, "resize-none")}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          data-cursor-label="SEND"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-acid px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-acid-soft disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Send Message"}
          <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </form>
    </div>
  );
}

// ---- Footer ----
export function Footer() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const socials = buildSocials();
  const mailtoHref = `mailto:${siteConfig.email}`;

  return (
    <footer
      id="connect"
      className="relative scroll-mt-24 bg-ink px-6 pt-16 md:px-10 md:pt-20 lg:px-16 lg:pt-24"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-editorial">
        {/* === TOP SECTION: I'AM + Portrait + Bio === */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
          {/* LEFT: I'AM + Name + Tagline + Signature */}
          <motion.div
            className="md:col-span-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.05 }}
          >
            {/* "I'AM" — HUGE, white, dominant */}
            <h2 className="font-display text-[clamp(6rem,16vw,13rem)] uppercase leading-[0.8] tracking-[0.01em] text-paper whitespace-nowrap">
              I&apos;AM
            </h2>
            {/* Name — smaller, acid green, directly below */}
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[1] tracking-[0.06em] text-acid whitespace-nowrap mt-1">
              MUSA KHAN
            </h2>
            {/* Thin separator line */}
            <div className="mt-4 h-px w-full bg-border" />
            {/* Tagline — small, wide tracking */}
            <p className="font-sans text-sm md:text-base font-medium uppercase tracking-[0.1em] text-ash mt-4">
              {TAGLINE}
            </p>
            {/* Signature — script, below tagline */}
            <p className="mt-10 text-3xl md:text-4xl text-paper" style={SIG_FONT}>
              Musa Khan
            </p>
            {/* Role — small, below signature */}
            <p className="font-sans text-base md:text-lg text-ash/60 mt-1">
              Developer · Researcher · Creative Technologist
            </p>
          </motion.div>

          {/* CENTER: Portrait with glitch */}
          <motion.div
            className="flex md:col-span-4 md:justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.15 }}
          >
            <GlitchPortrait />
          </motion.div>

          {/* RIGHT: Contact form */}
          <motion.div
            className="md:col-span-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.25 }}
          >
            <ContactForm prefersReducedMotion={prefersReducedMotion} />
          </motion.div>
        </div>

        {/* === BOTTOM SECTION: Quote + Statement/Socials + Things I Do === */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8 lg:mt-16">
          {/* LEFT: Manifesto quote */}
          <motion.div
            className="md:col-span-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.05 }}
          >
            <p className="label-mono mb-6 text-ash">
              <span className="text-acid">/</span> MANIFESTO
            </p>
            <blockquote>
              <p className="font-sans text-[clamp(1.5rem,2.5vw,2rem)] font-medium leading-[1.3] tracking-tight text-paper">
                {QUOTE_LINES.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <footer className="mt-6">
                <cite className="label-mono not-italic text-ash">
                  {QUOTE_ATTR}
                </cite>
              </footer>
            </blockquote>
          </motion.div>

          {/* CENTER: Big statement + socials */}
          <motion.div
            className="md:col-span-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.15 }}
          >
            {/* Big statement */}
            <h2 className="font-sans text-[clamp(1.375rem,3vw,2.25rem)] font-bold uppercase leading-[1.05] tracking-tight">
              {STATEMENT_WORDS.map((entry, i) => (
                <React.Fragment key={`${entry.word}-${i}`}>
                  <motion.span
                    className={cn(
                      "inline-block",
                      entry.muted ? "text-ash" : "text-paper",
                    )}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, ease: EASE.expo, delay: 0.2 + i * 0.06 }}
                  >
                    {entry.word}
                  </motion.span>
                  {i < STATEMENT_WORDS.length - 1 ? " " : ""}
                </React.Fragment>
              ))}
            </h2>
            <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ash md:text-base">
              {STATEMENT_SUB}
            </p>
            <div className="mt-6 h-px w-full bg-border" aria-hidden="true" />
            {/* Socials */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="label-mono text-ash">SOCIALS</p>
              <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
                {socials.map((s, i) => {
                  const disabled = isPlaceholderUrl(s.href);
                  return (
                    <motion.li
                      key={s.label}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.4, ease: EASE.expo, delay: 0.3 + i * 0.05 }}
                    >
                      {disabled ? (
                        <span
                          aria-disabled="true"
                          aria-label={`${s.label} — coming soon`}
                          title={`${s.label} — coming soon`}
                          className="flex h-12 w-12 items-center justify-center border border-dashed border-border text-ash/40"
                        >
                          {s.icon}
                        </span>
                      ) : (
                        <a
                          href={s.href}
                          target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                          rel={s.href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
                          aria-label={s.label}
                          data-cursor-label="OPEN"
                          className="group flex h-12 w-12 items-center justify-center border border-border text-ash transition-all duration-300 hover:border-acid hover:bg-acid hover:text-ink"
                        >
                          {s.icon}
                        </a>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          {/* RIGHT: Things I Do + CTA */}
          <motion.div
            className="md:col-span-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.25 }}
          >
            <p className="label-mono mb-6 text-ash">
              <span className="text-acid">/</span> THINGS I DO
            </p>
            <div className="relative border-l-2 border-iron pl-5">
              <ul className="space-y-2.5">
                {THINGS_I_DO.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.45, ease: EASE.expo, delay: 0.3 + i * 0.05 }}
                    className="font-sans text-sm font-bold uppercase tracking-tight text-paper transition-colors duration-300 hover:text-acid md:text-[0.95rem]"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            {/* CTA */}
            <motion.a
              href="#work"
              data-cursor-label="GO"
              className="group mt-6 inline-flex items-center gap-2 bg-acid px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-acid-soft"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE.expo, delay: 0.55 }}
            >
              View The Work
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </motion.a>
            {/* Secondary CTAs */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={mailtoHref}
                data-cursor-label="MAIL"
                className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 hover:text-acid"
              >
                <Send className="h-3 w-3" />
                Email
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
