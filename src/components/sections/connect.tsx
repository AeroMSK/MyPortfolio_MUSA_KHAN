"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Github, Linkedin, ArrowUpRight, Send } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// CONNECT SECTION — closing statement + contact grid + CTA
// Huge ending typography: LET'S / BUILD / SOMETHING.
// Word-by-word stagger reveal, contact info grid, social links,
// pill CTA (mailto) + simple contact form (mailto: submit).
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

// ---- Big closing statement (each line is a word) ----
// LET'S / BUILD / SOMETHING. (SOMETHING. is acid)
const CLOSING_LINES: { word: string; acid: boolean }[] = [
  { word: "LET'S", acid: false },
  { word: "BUILD", acid: false },
  { word: "SOMETHING.", acid: true },
];

// ---- Helpers for placeholder detection ----
function isPlaceholderUrl(url: string): boolean {
  return !url || url.startsWith("YOUR_");
}

// ---- Contact info card ----
function ContactCard({
  label,
  value,
  href,
  icon,
  external,
  prefersReducedMotion,
  delay,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  prefersReducedMotion: boolean;
  delay: number;
}) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      data-cursor-label="OPEN"
      className={cn(
        "group flex items-start gap-4 border border-border bg-graphite/40 p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:border-acid/50 hover:bg-graphite/70"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-ink/40 text-acid transition-all duration-300 group-hover:border-acid/50 group-hover:bg-acid/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="label-mono text-ash">{label}</p>
        <p className="mt-1 break-words font-display text-base font-semibold tracking-tight text-paper transition-colors duration-300 group-hover:text-acid md:text-lg">
          {value}
        </p>
      </div>
      <ArrowUpRight
        className="ml-auto h-4 w-4 shrink-0 text-ash opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-acid group-hover:opacity-100"
        aria-hidden="true"
      />
    </motion.a>
  );
}

// ---- Social link row ----
function SocialLink({
  label,
  href,
  icon,
  prefersReducedMotion,
  delay,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  prefersReducedMotion: boolean;
  delay: number;
}) {
  const disabled = isPlaceholderUrl(href);

  if (disabled) {
    return (
      <motion.div
        className="group flex items-center gap-4 border border-dashed border-border bg-transparent p-5 opacity-60"
        aria-disabled="true"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 0.6, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          ease: EASE.expo,
          delay: prefersReducedMotion ? 0 : delay,
        }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-ink/40 text-ash">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="label-mono text-ash">{label}</p>
          <p className="mt-1 font-display text-base font-semibold tracking-tight text-ash md:text-lg">
            Coming Soon
          </p>
        </div>
        <span className="label-mono ml-auto text-ash">TBD</span>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor-label="OPEN"
      className={cn(
        "group flex items-center gap-4 border border-border bg-graphite/40 p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:border-acid/50 hover:bg-graphite/70"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-ink/40 text-acid transition-all duration-300 group-hover:border-acid/50 group-hover:bg-acid/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="label-mono text-ash">{label}</p>
        <p className="mt-1 font-display text-base font-semibold tracking-tight text-paper transition-colors duration-300 group-hover:text-acid md:text-lg">
          Visit Profile
        </p>
      </div>
      <ArrowUpRight
        className="ml-auto h-4 w-4 shrink-0 text-ash opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-acid group-hover:opacity-100"
        aria-hidden="true"
      />
    </motion.a>
  );
}

// ---- Simple contact form (Web3Forms API) ----
function ContactForm({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    // Web3Forms configuration
    const accessKey = "2aa92960-5c06-4c1b-8bd7-e165dd30e1bf"; // <-- Web3Forms access key

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("access_key", accessKey);
      formData.append("subject", `Portfolio enquiry from ${name || "visitor"}`);
      formData.append("from_name", "Portfolio Contact Form");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setStatusMessage("Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatusMessage(`Error: ${result.message || "Failed to send message. Please try again."}`);
        console.error("Web3Forms Error:", result);
      }
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setStatusMessage(`Network Error: ${error.message || "Please check your internet connection or adblocker."}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClasses =
    "w-full rounded-sm border border-border bg-graphite/40 px-4 py-3 font-sans text-sm text-paper placeholder:text-ash/60 transition-colors duration-300 focus:border-acid/60 focus:outline-none focus:ring-1 focus:ring-acid/40 disabled:opacity-50";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 border border-border bg-graphite/30 p-5 md:p-6"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : 0.5,
      }}
    >
      <p className="label-mono flex items-center gap-2 text-ash">
        <Send className="h-3 w-3 text-acid" aria-hidden="true" />
        <span>QUICK MESSAGE</span>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="connect-name" className="label-mono text-ash">
            NAME
          </label>
          <input
            id="connect-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="name"
            placeholder="Your name"
            className={fieldClasses}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="connect-email" className="label-mono text-ash">
            EMAIL
          </label>
          <input
            id="connect-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
            placeholder="you@domain.com"
            className={fieldClasses}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="connect-message" className="label-mono text-ash">
          MESSAGE
        </label>
        <textarea
          id="connect-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={isSubmitting}
          rows={4}
          placeholder="What would you like to build together?"
          className={cn(fieldClasses, "resize-none")}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        data-cursor-label="SEND"
        className={cn(
          "group inline-flex w-full items-center justify-center gap-3 rounded-sm bg-acid px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-tight text-ink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-acid-soft hover:shadow-[0_0_30px_-8px_rgba(196,245,66,0.6)]"
        )}
      >
        <span>{isSubmitting ? "SENDING..." : "SEND MESSAGE"}</span>
        {!isSubmitting && <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />}
      </button>
      {statusMessage && (
        <p className={cn("label-mono font-bold mt-2", statusMessage.includes("success") ? "text-acid" : "text-red-400")}>
          {statusMessage}
        </p>
      )}
    </motion.form>
  );
}

// ---- Main section ----
export function ConnectSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const mailtoHref = `mailto:${siteConfig.email}`;
  const telHref = `tel:${siteConfig.phone}`;

  return (
    <section
      id="connect"
      className="relative scroll-mt-24 bg-ink px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-editorial">
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <motion.div
            className="label-mono mb-8 flex flex-wrap items-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE.expo }}
          >
            <span className="text-acid">006 / CONNECT</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">LET&apos;S TALK</span>
            <span className="ml-auto text-ash">{siteConfig.year}</span>
          </motion.div>
        </header>

        {/* Big closing typography — word-by-word stagger */}
        <div className="mb-16 md:mb-24">
          <h2 className="font-display font-bold uppercase leading-[0.85] tracking-tightest text-[clamp(4rem,14vw,12rem)]">
            {CLOSING_LINES.map((line, i) => (
              <span key={line.word} className="block overflow-hidden">
                <motion.span
                  className={cn("block", line.acid ? "text-acid" : "text-paper")}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  whileInView={
                    prefersReducedMotion ? undefined : { y: "0%" }
                  }
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.9,
                    ease: EASE.expo,
                    delay: prefersReducedMotion ? 0 : i * 0.12,
                  }}
                >
                  {line.word}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>

        {/* Contact info grid (3-col) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <ContactCard
            label="EMAIL"
            value={siteConfig.email}
            href={mailtoHref}
            external={false}
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
            prefersReducedMotion={prefersReducedMotion}
            delay={0.1}
          />
          <ContactCard
            label="PHONE"
            value={siteConfig.phoneDisplay}
            href={telHref}
            external={false}
            icon={<Phone className="h-5 w-5" aria-hidden="true" />}
            prefersReducedMotion={prefersReducedMotion}
            delay={0.15}
          />
          <ContactCard
            label="LOCATION"
            value={siteConfig.location}
            href="#connect"
            external={false}
            icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
            prefersReducedMotion={prefersReducedMotion}
            delay={0.2}
          />
        </div>

        {/* Social links (2-col) */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <SocialLink
            label="GITHUB"
            href={siteConfig.githubUrl}
            icon={<Github className="h-5 w-5" aria-hidden="true" />}
            prefersReducedMotion={prefersReducedMotion}
            delay={0.25}
          />
          <SocialLink
            label="LINKEDIN"
            href={siteConfig.linkedinUrl}
            icon={<Linkedin className="h-5 w-5" aria-hidden="true" />}
            prefersReducedMotion={prefersReducedMotion}
            delay={0.3}
          />
        </div>

        {/* CTA button + contact form, 2-col split */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
          {/* Left: CTA + supporting copy */}
          <motion.div
            className="flex flex-col justify-between gap-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: EASE.expo,
              delay: prefersReducedMotion ? 0 : 0.35,
            }}
          >
            <div>
              <p className="label-mono mb-4 text-ash">DIRECT LINE</p>
              <p className="max-w-md font-sans text-base leading-relaxed text-paper/80 md:text-lg">
                Open to software development, research collaborations, and creative
                technical projects. If it can be built, researched, or designed —
                let&apos;s talk.
              </p>
            </div>

            <motion.a
              href={mailtoHref}
              data-cursor-label="GO"
              className={cn(
                "group inline-flex items-center justify-center gap-3 self-start rounded-full bg-acid px-8 py-5 font-display text-base font-semibold uppercase tracking-tight text-ink transition-all duration-300",
                "hover:bg-acid-soft hover:shadow-[0_0_40px_-8px_rgba(196,245,66,0.7)]"
              )}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
              }
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.7,
                ease: EASE.expo,
                delay: prefersReducedMotion ? 0 : 0.45,
              }}
            >
              <span>GET IN TOUCH</span>
              <ArrowUpRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                aria-hidden="true"
              />
            </motion.a>
          </motion.div>

          {/* Right: contact form */}
          <ContactForm prefersReducedMotion={prefersReducedMotion} />
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-16 border-t border-border pt-6 md:mt-24"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / CONNECT</span>
            <span className="text-acid">006 / 006</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
