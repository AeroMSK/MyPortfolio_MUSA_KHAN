/**
 * Work experience data — editorial vertical timeline.
 */

export type Experience = {
  id: string;
  index: string;
  role: string;
  organization: string;
  location?: string;
  period: string;
  current?: boolean;
  description: string[];
  tags?: string[];
};

export const experiences: Experience[] = [
  {
    id: "amplytic-dev",
    index: "01",
    role: "Software Developer",
    organization: "Amplytic Dev",
    location: "Chittagong, Bangladesh",
    period: "Present",
    current: true,
    description: [
      "Working on web application development as part of a software development team.",
      "Contributing to mobile application development alongside web projects.",
      "Collaborating on software development tasks using modern technologies and frameworks.",
    ],
    tags: ["Web", "Mobile", "Production"],
  },
  {
    id: "iiuc-computer-club",
    index: "02",
    role: "Assistant Design and Creative Secretary",
    organization: "IIUC Computer Club",
    period: "2025 — 2026",
    description: [
      "Supported design and creative initiatives for club activities and events.",
      "Contributed creative input to club communications and promotional materials.",
    ],
    tags: ["Design", "Creative", "Leadership"],
  },
  {
    id: "ieee-comsoc",
    index: "03",
    role: "Video Editor & Executive Member",
    organization: "IEEE ComSoc IIUC SBC",
    period: "August 2025 — Present",
    current: true,
    description: [
      "Edited and produced videos for webinars, events, and community projects.",
      "Coordinated video production timelines.",
      "Assisted in planning and promoting IEEE events.",
    ],
    tags: ["Video", "Motion", "Production"],
  },
  {
    id: "ysse-intern",
    index: "04",
    role: "Intern — Admin and HR Department",
    organization: "YSSE",
    location: "Youth School for Social Entrepreneurs",
    period: "May 2024 — November 2024",
    description: [
      "Organized learning sessions.",
      "Contributed to the “Behind the Journey” show.",
      "Developed leadership and communication skills through organizational activities.",
      "Monitored and led group projects.",
    ],
    tags: ["Internship", "Leadership", "Operations"],
  },
  {
    id: "bee-properties-ops",
    index: "05",
    role: "Data and Operations Assistant",
    organization: "BEE Properties Ltd.",
    period: "July 2023 — Present",
    current: true,
    description: [
      "Worked with property data.",
      "Performed calculation and accounts-related work.",
      "Compiled monthly totals and working details.",
    ],
    tags: ["Data", "Operations", "Accounts"],
  },
];

export type Education = {
  id: string;
  institution: string;
  degree: string;
  detail: string;
  period: string;
  current?: boolean;
};

export const education: Education[] = [
  {
    id: "iiuc",
    institution: "International Islamic University Chittagong",
    degree: "Bachelor of Science in Computer Science and Engineering",
    detail: "7th Semester · Expected Graduation: July 2027",
    period: "2023 — 2027",
    current: true,
  },
  {
    id: "cda",
    institution: "CDA Public School and College",
    degree: "Higher Secondary Certificate (HSC)",
    detail: "Science",
    period: "2022",
  },
  {
    id: "sanowara",
    institution: "Sanowara Islam Boys' High School",
    degree: "Secondary School Certificate (SSC)",
    detail: "Science",
    period: "2020",
  },
];

export type Activity = {
  id: string;
  title: string;
  detail: string;
  period: string;
};

export const activities: Activity[] = [
  {
    id: "iiuc-tech-fest-2025",
    title: "IIUC Tech Fest 2025",
    detail: "Mobile and Web Application Development",
    period: "2025",
  },
  {
    id: "cse-fest-2026",
    title: "CSE Fest 2026",
    detail: "Mobile and Web Application Development",
    period: "2026",
  },
  {
    id: "workshop-cybersecurity",
    title: "Workshop · Cybersecurity",
    detail: "Attended workshop on cybersecurity fundamentals",
    period: "Workshop",
  },
  {
    id: "workshop-ml",
    title: "Workshop · Machine Learning",
    detail: "Attended workshop on applied machine learning",
    period: "Workshop",
  },
  {
    id: "workshop-github",
    title: "Workshop · GitHub",
    detail: "Attended workshop on Git & GitHub workflows",
    period: "Workshop",
  },
  {
    id: "workshop-professional",
    title: "Workshop · Professional Skills",
    detail: "Attended workshop on professional communication and skills",
    period: "Workshop",
  },
];
