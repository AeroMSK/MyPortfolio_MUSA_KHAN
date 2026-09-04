# Musa Khan Portfolio — Design System & Agent Brief

> **ALL SUB-AGENTS MUST READ THIS FILE COMPLETELY BEFORE WRITING ANY CODE.**

## Project Overview

Premium personal portfolio for **Mohammed Musa Khan** — Software Developer & Creative Technologist.
Built with Next.js 16 (App Router) · TypeScript · Tailwind 4 · GSAP · Framer Motion · Lenis.

References: amplytic.dev, vertical.framer.media, axistro.dev.
Reference implementation (do NOT copy, just learn patterns from): `/home/z/my-project/upload/amplytic_zip/Amplytic-main/` — especially `components/AnimatedComponants/` and `components/landingPage/`.

## Design Tokens (already in `src/app/globals.css`)

### Color Palette — Editorial Dark
| Token | Hex | Usage |
|-------|-----|-------|
| ink | `#070707` | Deepest background (hero, contact) |
| charcoal | `#0B0B0D` | Popover, mobile menu |
| graphite | `#111214` | Card surfaces (default) |
| slate-deep | `#161719` | Secondary surface, projects |
| iron | `#1D1F22` | Muted background, borders |
| steel | `#26282C` | Tertiary surface, experience |
| paper | `#EAEAEA` | Primary foreground text |
| ash | `#A7A7A7` | Muted text |
| **acid** | `#C4F542` | Accent — buttons, links, markers, hover |
| acid-soft | `#9DC932` | Accent hover/active |

Available as Tailwind classes: `bg-ink`, `bg-charcoal`, `bg-graphite`, `bg-slate-deep`, `bg-iron`, `bg-steel`, `text-paper`, `text-ash`, `text-acid`, `bg-acid`, `border-acid`, etc.

CSS variables: `--background`, `--foreground`, `--card`, `--accent`, `--border`, etc. (standard shadcn tokens mapped to the dark palette).

### Typography
- **Display**: `font-display` → Space Grotesk (loaded via next/font/google in layout.tsx as `--font-space-grotesk`)
- **Body**: `font-sans` → Inter (`--font-inter`)
- **Mono**: `font-mono` → JetBrains Mono (`--font-jetbrains-mono`)

#### Type Scale (use Tailwind arbitrary values or the `text-display-*` presets)
| Role | Class | Notes |
|------|-------|-------|
| Mega display (hero name) | `text-[clamp(4rem,14vw,12rem)]` | `font-display font-bold uppercase tracking-tightest leading-[0.85]` |
| Section heading | `text-[clamp(2.5rem,7vw,5.5rem)]` | `font-display font-semibold tracking-tight leading-[0.95]` |
| Sub heading | `text-[clamp(1.5rem,3vw,2.5rem)]` | `font-display font-medium tracking-tight` |
| Body | `text-base md:text-lg` | `font-sans text-paper/80 leading-relaxed` |
| Label / metadata | `label-mono` (custom utility) | `font-mono text-[10px] tracking-[0.18em] uppercase text-ash` |
| Tag | `font-mono text-[11px] tracking-[0.15em] uppercase` | Used for tech badges, year markers |

### Spacing
- Max content width: `max-w-editorial` (1440px) for full-bleed sections
- Prose width: `max-w-prose` (780px) for body copy
- Standard section padding: `px-6 md:px-10 lg:px-16` + `py-24 md:py-32 lg:py-40`
- Use `gap-2`, `gap-4`, `gap-8`, `gap-12` consistently

### Borders
- Subtle hairline: `border border-border` (rgba(234,234,234,0.08))
- Accent border: `border-acid/30`
- Section dividers: `border-t border-border` between sections

## Animation Patterns

### Easing (use these EXACT easings for premium feel)
```ts
const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,        // expo-out
  power: [0.19, 1, 0.22, 1] as const,     // power4-out variant
  smooth: [0.85, 0, 0.15, 1] as const,    // circ inOut
  quick: [0.23, 1, 0.32, 1] as const,     // material standard
  spring: { stiffness: 120, damping: 14, mass: 0.5 },
};
```

### Framer Motion Variants (reusable)
```ts
// Stagger container
export const staggerContainer = (stagger = 0.12, delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

// Fade up item
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// Character/word reveal
export const wordReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
```

### IntersectionObserver / whileInView
- Always use `whileInView` with `viewport={{ once: true, amount: 0.2 }}` for scroll reveals
- Don't re-trigger animations on every scroll (jarring)

### Reduced Motion
```ts
const prefersReducedMotion = typeof window !== "undefined" && 
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// If true → render content without animations (just opacity:1, no transforms)
```

## Custom Cursor Support
The custom cursor is already implemented at `src/components/motion/custom-cursor.tsx`.
It auto-detects hover on `a, button, [data-cursor], [role="button"], input, textarea, select, summary, [data-cursor-label]`.

To show a custom label on hover (VIEW, OPEN, GO, DRAG, EXPLORE), add the attribute:
```tsx
<a href="..." data-cursor-label="VIEW">View Project</a>
<button data-cursor-label="GO">Start</button>
```

## Smooth Scroll
Lenis is already set up in `src/components/motion/smooth-scroll.tsx`. Anchor links (`<a href="#section">`) are auto-wired to smooth-scroll to the target.

## Page Loader
Already implemented at `src/components/motion/page-loader.tsx` — 1.4s cinematic loader that covers name reveal + progress bar. Other sections should NOT block on loader completion — they just render normally underneath.

## Data Files (already created — IMPORT FROM THESE)
- `@/data/projects` → `projects: Project[]` (5 projects)
- `@/data/publications` → `publications: Publication[]` (1 paper)
- `@/data/experience` → `experiences: Experience[]`, `education: Education[]`, `activities: Activity[]`
- `@/data/technologies` → `techGroups: TechGroup[]`, `creativeCategories`, `curiosityItems`
- `@/lib/config` → `siteConfig` (name, nav, contact, links)

**DO NOT duplicate data inside component files.** Always import from the data files.

## Site Config (from `src/lib/config.ts`)
- `name`: "Mohammed Musa Khan"
- `shortName`: "Musa Khan"
- `initials`: "MK"
- `email`: "musakhan5572@gmail.com"
- `phone`: "+8801823601506"
- `location`: "Chittagong, Bangladesh"
- `githubUsername`: "YOUR_GITHUB_USERNAME" (placeholder — TODO)
- `githubUrl`: "YOUR_GITHUB_URL" (placeholder)
- `linkedinUrl`: "YOUR_LINKEDIN_URL" (placeholder)
- `cvPath`: "/pdf/Mohammed-Musa-Khan-CV.pdf"
- `nav`: WORK, RESEARCH, EXPERIENCE, STACK, ABOUT, CONNECT (each with index 001-006)

## Image Handling
Project images: `/public/images/projects/<slug>-1.png` (use next/image with proper alt)
Research images: `/public/images/research/diaxai-1.png` etc.
Portrait: `/public/images/me/portrait.png` (placeholder will be created)
CV: `/public/pdf/Mohammed-Musa-Khan-CV.pdf` (placeholder will be created)

**Always use next/image for raster images** (with `placeholder="empty"` to avoid blur).
For SVGs, just use `<img>` or inline SVG.

If image is missing, fall back to a styled placeholder div (graphite bg + label).

## Component Conventions
1. Every interactive component must start with `"use client";`
2. Use `cn()` from `@/lib/utils` for conditional classes
3. Use semantic HTML: `<section>`, `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
4. Section IDs must match nav: `#work`, `#research`, `#experience`, `#stack`, `#about`, `#connect`
5. Each section should include the editorial numbering pattern (001, 002, 003, …)
6. NO fake statistics, awards, or invented metrics
7. NO progress bars with percentages for skills (use status labels: USED, BUILDING WITH, EXPERIENCE, WORKFLOW)
8. Respect reduced motion

## File Boundaries (DO NOT TOUCH OTHER AGENTS' FILES)
- Each agent owns specific files (see your task brief)
- The shared files already created (globals.css, tailwind.config.ts, layout.tsx, page.tsx, data/*, lib/config.ts, components/motion/smooth-scroll.tsx, components/motion/custom-cursor.tsx, components/motion/page-loader.tsx) are FROZEN — do not edit them
- If you need a shared primitive that doesn't exist yet, create it INSIDE your own section folder

## Quality Bar (before finishing)
- [ ] Lint passes (`bun run lint` — only your files)
- [ ] No TypeScript errors
- [ ] Responsive at 360/390/430/768/1024/1280/1440/1920
- [ ] No horizontal overflow
- [ ] Reduced motion respected
- [ ] Accessible (alt text, aria-labels, keyboard nav, semantic HTML)
- [ ] Appends work log to `/home/z/my-project/worklog.md`

## Worklog Protocol
Before starting: read `/home/z/my-project/worklog.md`.
After finishing: append a section using this template:
```
---
Task ID: <your task ID>
Agent: <your name>
Task: <what you were asked to do>

Work Log:
- <step 1>
- <step 2>

Stage Summary:
- <files created/modified>
- <key decisions>
- <known issues / TODOs>
```
