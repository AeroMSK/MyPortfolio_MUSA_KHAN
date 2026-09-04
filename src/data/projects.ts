/**
 * Projects data for Musa Khan's portfolio.
 * Adding a new project = adding a new object to this array.
 */

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  id: string;
  index: string;
  year: string;
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  images: ProjectImage[];
  liveUrl?: string;
  githubUrl?: string;
  // Layout hint — alternate between projects to avoid repetition
  layout: "image-right" | "image-left" | "image-bottom" | "image-top";
};

export const projects: Project[] = [
  {
    id: "bee-properties",
    index: "01",
    year: "2026",
    title: "BEE Properties",
    category: "Web Application · Real Estate",
    description:
      "Real-estate property management application built for managing property listings, information, and related real-estate operations.",
    longDescription:
      "A production web application designed for property managers and real-estate operators. It handles listings, property information, and the daily operational workflows that surround real-estate management.",
    technologies: ["Next.js", "Appwrite", "TailwindCSS"],
    images: [
      {
        src: "/images/projects/bee-properties-1.png",
        alt: "BEE Properties — main dashboard view",
        caption: "Property management dashboard",
      },
      {
        src: "/images/projects/bee-properties-2.png",
        alt: "BEE Properties — listings view",
        caption: "Listings overview",
      },
    ],
    liveUrl: "https://beeproperties.appwrite.network/",
    githubUrl: "https://github.com/AeroMSK/BeeProperties_Webapplication",
    layout: "image-right",
  },
  {
    id: "amplytic-webapp",
    index: "02",
    year: "2026",
    title: "Amplytic Webapp",
    category: "Web Application · Product",
    description:
      "Web application work developed as part of my experience at Amplytic, contributing to production-oriented software development and modern application interfaces.",
    longDescription:
      "Contributed to production web application development at Amplytic Dev. Worked across modern application interfaces and production-oriented software systems as part of a software development team.",
    technologies: ["Next.js", "React", "Appwrite", "Modern Web Stack"],
    images: [
      {
        src: "/images/projects/amplytic-1.png",
        alt: "Amplytic Webapp — interface view",
        caption: "Amplytic web application interface",
      },
    ],
    liveUrl: "https://www.amplytic.dev/",
    githubUrl: "TODO",
    layout: "image-left",
  },
  {
    id: "classrep",
    index: "03",
    year: "2025",
    title: "ClassRep",
    category: "Web Application · Education",
    description:
      "A classroom management system designed for students and class representatives, helping organize classroom activities and management workflows.",
    longDescription:
      "ClassRep streamlines how class representatives and students coordinate classroom activities — from announcements to attendance and routine management. Built specifically for the academic workflow.",
    technologies: ["Next.js", "Appwrite", "TailwindCSS"],
    images: [
      {
        src: "/images/projects/classrep-1.png",
        alt: "ClassRep — classroom dashboard",
        caption: "ClassRep dashboard",
      },
    ],
    liveUrl: "https://classrep.appwrite.network/",
    githubUrl: "TODO",
    layout: "image-bottom",
  },
  {
    id: "travx",
    index: "04",
    year: "2025",
    title: "TRAVX",
    category: "Mobile Application · Transport",
    description:
      "A local transportation and navigation application focused on helping users understand transportation options and navigate local routes.",
    longDescription:
      "TRAVX is a mobile-first application built to help users understand and navigate local transportation options. Focused on practical, on-the-go route discovery for daily commuters.",
    technologies: ["React Native", "Appwrite", "Expo"],
    images: [
      {
        src: "/images/projects/travx-1.png",
        alt: "TRAVX — mobile route view",
        caption: "TRAVX mobile application",
      },
    ],
    liveUrl: "TODO",
    githubUrl: "TODO",
    layout: "image-right",
  },
  {
    id: "vanguard-engine",
    index: "05",
    year: "2024",
    title: "Vanguard Engine",
    category: "Web Platform · Recruitment",
    description:
      "A security guard recruitment and management platform designed to help recruiters manage guard recruitment, assignments, and related operational workflows.",
    longDescription:
      "Vanguard Engine is a recruitment and operational platform built for the security-guard industry. Recruiters use it to manage guard recruitment, assignments, and ongoing operational workflows in a single system.",
    technologies: ["ASP.NET", ".NET", "Appwrite"],
    images: [
      {
        src: "/images/projects/vanguard-1.png",
        alt: "Vanguard Engine — recruitment dashboard",
        caption: "Vanguard Engine dashboard",
      },
    ],
    liveUrl: "https://vanguard-engine-d8ei.onrender.com/",
    githubUrl: "https://github.com/shams909/Vanguard-Engine",
    layout: "image-left",
  },
];
