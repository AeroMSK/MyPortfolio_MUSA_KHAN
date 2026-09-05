/**
 * Site-wide configuration for Musa Khan's portfolio.
 * Edit values here to update personal info, links, and content.
 */

export const siteConfig = {
  name: "Musa Khan",
  shortName: "Musa Khan",
  initials: "MK",
  profession: "Developer · Researcher",
  subProfession: "Creative Technologist",
  location: "Chittagong, Bangladesh",
  locationShort: "CTG / BD",
  year: "2026",
  university: "International Islamic University Chittagong",
  universityShort: "CSE / IIUC",

  // Contact
  email: "musakhanstorage5572@gmail.com",
  phone: "+8801823601506",
  phoneDisplay: "+88 01823 601506",

  // Social
  githubUsername: "AeroMSK",
  githubUrl: "https://github.com/AeroMSK",
  linkedinUrl: "https://www.linkedin.com/in/hello-musa-khan",
  instagramUrl: "https://www.instagram.com/khan.exe_404",
  facebookUrl: "https://www.facebook.com/share/1HpCWBDbDw/",

  // CV
  cvPath: "/pdf/Musa-Khan-CV.pdf",

  // Navigation
  nav: [
    { label: "Work", href: "#work", index: "001" },
    { label: "Research", href: "#research", index: "002" },
    { label: "Experience", href: "#experience", index: "003" },
    { label: "About", href: "#about", index: "004" },
    { label: "Stack", href: "#stack", index: "005" },
    { label: "Connect", href: "#connect", index: "006" },
  ] as const,

  // Availability
  availability: "Available for development, research, and creative opportunities",
} as const;

export type SiteConfig = typeof siteConfig;
