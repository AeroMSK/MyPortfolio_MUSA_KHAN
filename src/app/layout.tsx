import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { PageLoader } from "@/components/motion/page-loader";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { BackToTop } from "@/components/motion/back-to-top";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Rock Salt — handwritten signature font (used in footer)
const rockSalt = localFont({
  src: "../../public/fonts/RockSalt-Regular.ttf",
  variable: "--font-rock-salt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Musa Khan — Developer, Researcher & Creative Technologist",
  description:
    "Musa Khan — Computer Science & Engineering student at IIUC. Software development, research in machine learning / explainable AI, and creative technology. Building across web, mobile, modern systems, and academic publications.",
  keywords: [
    "Musa Khan",
    "Developer",
    "Researcher",
    "Creative Technologist",
    "Machine Learning",
    "Explainable AI",
    "Next.js",
    "React",
    "React Native",
    "Appwrite",
    "Web Development",
    "Mobile Development",
    "Portfolio",
    "Bangladesh",
    "IIUC",
  ],
  authors: [{ name: "Musa Khan" }],
  creator: "Musa Khan",
  openGraph: {
    title: "Musa Khan — Developer, Researcher & Creative Technologist",
    description:
      "Developer, researcher, and creative technologist. Building across software, machine learning, and modern systems. CSE @ IIUC.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Musa Khan — Developer, Researcher & Creative Technologist",
    description:
      "Developer, researcher, and creative technologist building across software, machine learning, and modern systems.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} ${rockSalt.variable} antialiased bg-background text-foreground font-sans bg-noise`}
      >
        <CustomCursor />
        <ScrollProgress />
        <SmoothScroll>
          <PageLoader />
          {children}
          <BackToTop />
        </SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
