"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const SCROLL_THRESHOLD = 40;

/**
 * Navbar — fixed editorial top navigation.
 *
 * - Transparent + tall (h-20) at top of page.
 * - On scroll > 40px: bg-ink/80 backdrop blur, h-16, hairline border.
 * - Desktop nav links: editorial index (001 …) + label, acid dot on active.
 * - Active section auto-detected via IntersectionObserver on nav section IDs.
 * - CV button: outline button with acid border.
 * - Mobile (<768px): hamburger reveals fullscreen MobileMenu.
 * - All interactive elements emit `data-cursor-label` for the custom cursor.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpenRef = useRef(false);

  /* ── Restore focus to hamburger when menu closes (a11y) ───────── */
  useEffect(() => {
    if (menuOpen) {
      wasMenuOpenRef.current = true;
    } else if (wasMenuOpenRef.current) {
      wasMenuOpenRef.current = false;
      const t = window.setTimeout(() => hamburgerRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
  }, [menuOpen]);

  /* ── Scroll state ─────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active section detection (IntersectionObserver) ─────────── */
  // Also detects footer to set "connect" as active when scrolled to bottom.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sectionIds = siteConfig.nav
      .map((n) => n.href.replace(/^#/, ""))
      .filter(Boolean);
    if (sectionIds.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let lastActive = "";

    // Wait one tick so sections are mounted before observing.
    const t = window.setTimeout(() => {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (sections.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visible[0]) {
            const id = visible[0].target.id;
            if (id && id !== lastActive) {
              lastActive = id;
              setActiveSection(id);
            }
          }
        },
        {
          // Trigger when the section crosses the middle of the viewport.
          rootMargin: "-30% 0px -55% 0px",
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        },
      );

      sections.forEach((s) => observer!.observe(s));

      // Also observe the footer — when it's visible, set "connect" as active
      const footer = document.querySelector("footer");
      if (footer) {
        const footerObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                lastActive = "connect";
                setActiveSection("connect");
              }
            }
          },
          { rootMargin: "0px 0px -50% 0px", threshold: [0, 0.1, 0.3] },
        );
        footerObserver.observe(footer);
        // Store for cleanup (custom property on observer)
        (observer as unknown as { _footerObserver?: IntersectionObserver })._footerObserver = footerObserver;
      }
    }, 200);

    return () => {
      window.clearTimeout(t);
      observer?.disconnect();
      (observer as unknown as { _footerObserver?: IntersectionObserver })._footerObserver?.disconnect();
    };
  }, []);

  /* ── Lock body scroll while mobile menu open ──────────────────── */
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  /* ── Escape closes mobile menu ────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleNavClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          initial={false}
          animate={{
            height: scrolled ? 64 : 80,
          }}
          transition={{ duration: 0.45, ease: EASE_EXPO }}
          className={cn(
            "w-full transition-colors duration-500",
            scrolled
              ? "bg-ink/80 backdrop-blur-md border-b border-border"
              : "bg-transparent border-b border-transparent",
          )}
        >
          <div className="mx-auto max-w-editorial h-full flex items-center justify-between px-6 md:px-10 lg:px-16">
            {/* ── Wordmark ───────────────────────────────────── */}
            <Link
              href="#hero"
              data-cursor-label="GO"
              aria-label="Musa Khan — back to top"
              className="group relative flex items-center gap-2 font-display font-bold tracking-tightest text-paper hover:text-acid transition-colors duration-300"
            >
              <span className="text-[15px] md:text-[17px] uppercase leading-none">
                Musa Khan
              </span>
              <span
                aria-hidden
                className="block w-1.5 h-1.5 rounded-full bg-acid opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>

            {/* ── Desktop nav links ─────────────────────────── */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-0.5 lg:gap-1"
            >
              {siteConfig.nav.map((item) => {
                const id = item.href.replace(/^#/, "");
                const isActive = activeSection === id;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-cursor-label="GO"
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2 px-3 lg:px-3.5 py-2 rounded-md transition-colors duration-300",
                      isActive
                        ? "text-paper"
                        : "text-ash hover:text-paper",
                    )}
                  >
                    {/* Acid dot — visible when active, ghost on hover */}
                    <span
                      aria-hidden
                      className="relative flex items-center justify-center w-1.5 h-1.5"
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full bg-acid"
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.3, ease: EASE_EXPO }}
                      />
                      <span className="absolute inset-0 rounded-full bg-acid opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                    </span>

                    <span className="flex flex-col items-start leading-none">
                      <span
                        className={cn(
                          "font-mono text-[9px] tracking-[0.18em] uppercase transition-colors duration-300",
                          isActive
                            ? "text-acid"
                            : "text-ash/50 group-hover:text-acid",
                        )}
                      >
                        {item.index}
                      </span>
                      <span className="mt-1 font-display text-[12px] lg:text-[13px] font-medium tracking-tight uppercase">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Right cluster: hamburger ──────── */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Hamburger — mobile only */}
              <button
                ref={hamburgerRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                data-cursor-label="OPEN"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-paper hover:text-acid transition-colors duration-300"
              >
                <span className="relative flex flex-col gap-[5px]">
                  <span className="block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out" />
                  <span className="block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out" />
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={handleNavClick}
        activeSection={activeSection}
      />
    </>
  );
}
