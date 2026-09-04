/**
 * Publications / Research data.
 * Adding a new publication = adding a new object to this array.
 */

export type Publication = {
  id: string;
  index: string;
  venue: string;
  fullVenue: string;
  type: string;
  year: string;
  title: string;
  shortTitle: string;
  abstract: string;
  methods: string[];
  tags: string[];
  images: { src: string; alt: string; caption?: string }[];
  paperUrl?: string;
};

export const publications: Publication[] = [
  {
    id: "diaxai-stack",
    index: "01",
    venue: "ICCA 2026",
    fullVenue: "4th International Conference on Computing Advancements (ICCA 2026)",
    type: "Conference Paper",
    year: "2026",
    shortTitle: "DiaXAI-Stack",
    title:
      "DiaXAI-Stack: An Explainable AI Framework for Diabetes Prediction Using Leakage-Free Stacking Ensemble Learning with Dual Threshold Optimization",
    abstract:
      "An explainable machine-learning framework for diabetes prediction that explores leakage-free stacking ensemble learning together with dual-threshold optimization, with an emphasis on predictive performance and interpretable model behavior.",
    methods: [
      "Stacking Ensemble Learning",
      "Leakage-Free Pipelines",
      "Dual Threshold Optimization",
      "Explainable AI (XAI)",
      "Diabetes Prediction",
    ],
    tags: ["Research", "Machine Learning", "XAI"],
    images: [
      {
        src: "/images/research/diaxai-1.png",
        alt: "DiaXAI-Stack — paper screenshot",
        caption: "Paper preview",
      },
    ],
    // TODO: replace with the actual published paper URL once provided
    paperUrl: "#",
  },
];
