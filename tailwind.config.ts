import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Portfolio dark tones
        ink: "#070707",
        charcoal: "#0B0B0D",
        graphite: "#111214",
        "slate-deep": "#161719",
        iron: "#1D1F22",
        steel: "#26282C",
        paper: "#EAEAEA",
        ash: "#A7A7A7",
        acid: "#C4F542",
        "acid-soft": "#9DC932",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        tightest: "-0.05em",
        "mega-tight": "-0.06em",
        "label": "0.18em",
        "wide-2": "0.2em",
      },
      fontSize: {
        // Editorial display sizes (using clamp via arbitrary in components)
        "display-sm": ["clamp(2rem, 6vw, 4rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-md": ["clamp(3rem, 9vw, 7rem)", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
        "display-lg": ["clamp(4rem, 14vw, 12rem)", { lineHeight: "0.85", letterSpacing: "-0.06em" }],
      },
      maxWidth: {
        editorial: "1440px",
        prose: "780px",
      },
      animation: {
        blink: "blink 1.1s steps(1) infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "marquee-left": "marquee-left 40s linear infinite",
        "marquee-right": "marquee-right 40s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
