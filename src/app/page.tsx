import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/sections/hero";
import { IntroSection } from "@/components/sections/intro";
import { WorkSection } from "@/components/sections/work";
import { ResearchSection } from "@/components/sections/research";
import { GithubSection } from "@/components/sections/github";
import { ExperienceSection } from "@/components/sections/experience";
import { AboutSection } from "@/components/sections/about";
import { BeyondCodeSection } from "@/components/sections/beyond-code";
import { SystemCuriositySection } from "@/components/sections/system-curiosity";
import { TechStackSection } from "@/components/sections/tech-stack";
import { EducationSection } from "@/components/sections/education";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <IntroSection />
      <WorkSection />
      <ResearchSection />
      <GithubSection />
      <ExperienceSection />
      <AboutSection />
      <BeyondCodeSection />
      <SystemCuriositySection />
      <TechStackSection />
      <EducationSection />
      <Footer />
    </main>
  );
}
