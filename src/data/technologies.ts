/**
 * Tech stack — icons sourced from Iconify CDN.
 * No fake expertise percentages. Just category + status.
 */

export type Tech = {
  name: string;
  icon: string; // Iconify URL
  status: "USED" | "BUILDING WITH" | "EXPERIENCE" | "WORKFLOW";
};

export type TechGroup = {
  id: string;
  label: string;
  index: string;
  techs: Tech[];
};

export const techGroups: TechGroup[] = [
  {
    id: "languages",
    label: "Languages",
    index: "L1",
    techs: [
      { name: "C", icon: "https://api.iconify.design/devicon/c.svg", status: "USED" },
      { name: "C++", icon: "https://api.iconify.design/devicon/cplusplus.svg", status: "USED" },
      { name: "Java", icon: "https://api.iconify.design/devicon/java.svg", status: "USED" },
      { name: "JavaScript", icon: "https://api.iconify.design/devicon/javascript.svg", status: "BUILDING WITH" },
      { name: "SQL", icon: "https://api.iconify.design/devicon/mysql.svg", status: "EXPERIENCE" },
      { name: "HTML", icon: "https://api.iconify.design/devicon/html5.svg", status: "WORKFLOW" },
      { name: "CSS", icon: "https://api.iconify.design/devicon/css3.svg", status: "WORKFLOW" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    index: "L2",
    techs: [
      { name: "Next.js", icon: "https://api.iconify.design/devicon/nextjs.svg", status: "BUILDING WITH" },
      { name: "React", icon: "https://api.iconify.design/devicon/react.svg", status: "BUILDING WITH" },
      { name: "React Native", icon: "https://api.iconify.design/devicon/react.svg", status: "BUILDING WITH" },
      { name: "Vite", icon: "https://api.iconify.design/devicon/vitejs.svg", status: "EXPERIENCE" },
      { name: "Figma", icon: "https://api.iconify.design/devicon/figma.svg", status: "WORKFLOW" },
      { name: "TailwindCSS", icon: "https://api.iconify.design/devicon/tailwindcss.svg", status: "BUILDING WITH" },
      { name: "NativeWind", icon: "https://api.iconify.design/simple-icons/tailwindcss.svg", status: "EXPERIENCE" },
      { name: "shadcn/ui", icon: "https://api.iconify.design/simple-icons/shadcnui.svg", status: "BUILDING WITH" },
      { name: "Expo", icon: "https://api.iconify.design/simple-icons/expo.svg", status: "EXPERIENCE" },
      { name: "GSAP", icon: "https://api.iconify.design/simple-icons/gsap.svg", status: "BUILDING WITH" },
      { name: "Framer Motion", icon: "https://api.iconify.design/logos/framer.svg", status: "BUILDING WITH" },
    ],
  },
  {
    id: "backend",
    label: "Backend & Database",
    index: "L3",
    techs: [
      { name: "Node.js", icon: "https://api.iconify.design/devicon/nodejs.svg", status: "EXPERIENCE" },
      { name: "ASP.NET", icon: "https://api.iconify.design/devicon/dotnetcore.svg", status: "EXPERIENCE" },
      { name: ".NET", icon: "https://api.iconify.design/devicon/dotnetcore.svg", status: "EXPERIENCE" },
      { name: "MySQL", icon: "https://api.iconify.design/devicon/mysql.svg", status: "EXPERIENCE" },
      { name: "MongoDB", icon: "https://api.iconify.design/devicon/mongodb.svg", status: "EXPERIENCE" },
      { name: "Appwrite", icon: "https://api.iconify.design/devicon/appwrite.svg", status: "BUILDING WITH" },
      { name: "Firebase", icon: "https://api.iconify.design/devicon/firebase.svg", status: "EXPERIENCE" },
    ],
  },
  {
    id: "tools",
    label: "Tools & Hardware",
    index: "L4",
    techs: [
      { name: "Git", icon: "https://api.iconify.design/devicon/git.svg", status: "WORKFLOW" },
      { name: "GitHub", icon: "https://api.iconify.design/devicon/github.svg", status: "WORKFLOW" },
      { name: "ESP32", icon: "https://api.iconify.design/simple-icons/espressif.svg", status: "EXPERIENCE" },
      { name: "Arduino", icon: "https://api.iconify.design/devicon/arduino.svg", status: "EXPERIENCE" },
    ],
  },
];

/**
 * Creative categories — Beyond Code section
 */
export type CreativeCategory = {
  id: string;
  index: string;
  label: string;
  items: string[];
};

export const creativeCategories: CreativeCategory[] = [
  {
    id: "code-systems",
    index: "01",
    label: "Code & Systems",
    items: ["Software Engineering", "Debugging", "System Investigation", "Digital Curiosity"],
  },
  {
    id: "visual-motion",
    index: "02",
    label: "Visual & Motion",
    items: ["Video Editing", "Motion Graphics", "Graphic Design", "Visual Experiments"],
  },
  {
    id: "sound-rhythm",
    index: "03",
    label: "Sound & Rhythm",
    items: ["Audio Engineering", "Beat Making", "Rhythm Production", "Sound Design"],
  },
  {
    id: "design-form",
    index: "04",
    label: "Design & Form",
    items: ["UI Design", "Editorial Layouts", "Form & Function", "Brand Identity"],
  },
  {
    id: "digital-exploration",
    index: "05",
    label: "Digital Exploration",
    items: ["Edge Cases", "System Behavior", "Failure Analysis", "Technical Exploration"],
  },
];

/**
 * System Curiosity items
 */
export type CuriosityItem = {
  id: string;
  label: string;
  description: string;
};

export const curiosityItems: CuriosityItem[] = [
  {
    id: "debugging",
    label: "Debugging",
    description: "Tracing root causes through unfamiliar codebases and unexpected runtime states.",
  },
  {
    id: "system-behavior",
    label: "System Behavior",
    description: "Understanding how software behaves under load, failure, and unusual inputs.",
  },
  {
    id: "edge-cases",
    label: "Edge Cases",
    description: "Hunting down the boundary conditions where assumptions quietly break.",
  },
  {
    id: "security-concepts",
    label: "Security Concepts",
    description: "Learning about threat models, attack surfaces, and defensive design.",
  },
  {
    id: "digital-investigation",
    label: "Digital Investigation",
    description: "Investigating suspicious behavior, tracing logs, and reasoning about intent.",
  },
  {
    id: "failure-analysis",
    label: "Failure Analysis",
    description: "Studying how systems fail — and what those failures reveal about design.",
  },
];
