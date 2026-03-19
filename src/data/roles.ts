export interface RoleData {
  slug: string;
  title: string;
  description: string;
  skills: string[];
  tips: string[];
}

export const roles: RoleData[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    description: "Resume example and guide for software engineer roles.",
    skills: ["Programming", "System Design", "Algorithms", "Databases", "APIs"],
    tips: ["Lead with impact and metrics.", "Match tech stack to JD.", "Keep bullets concise."],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    description: "Data analyst resume example and keywords.",
    skills: ["SQL", "Python", "Excel", "Visualization", "Statistics"],
    tips: ["Quantify insights and impact.", "List tools (Tableau, Power BI).", "Include A/B tests."],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    description: "Product manager resume guide.",
    skills: ["Roadmap", "Stakeholder", "Metrics", "Agile", "User Research"],
    tips: ["Show outcome-focused ownership.", "Use product metrics.", "Highlight cross-functional work."],
  },
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    description: "Frontend developer resume example.",
    skills: ["React", "JavaScript", "CSS", "TypeScript", "Accessibility"],
    tips: ["Match framework to JD.", "Include performance/UX impact.", "List design systems."],
  },
  {
    slug: "backend-developer",
    title: "Backend Developer",
    description: "Backend developer resume guide.",
    skills: ["APIs", "Databases", "Scalability", "Security", "Caching"],
    tips: ["Emphasize scale and reliability.", "Mention stack (Node, Java, etc.).", "Quantify throughput/latency."],
  },
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    description: "Full stack resume example.",
    skills: ["Frontend", "Backend", "APIs", "Databases", "DevOps"],
    tips: ["Balance front-end and back-end bullets.", "Include full product ownership.", "Match stack to JD."],
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    description: "Data scientist resume tips.",
    skills: ["ML", "Python", "Statistics", "Experimentation", "SQL"],
    tips: ["Lead with business impact of models.", "List ML frameworks.", "Include metrics (accuracy, lift)."],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    description: "DevOps resume example.",
    skills: ["CI/CD", "Kubernetes", "AWS/GCP", "Terraform", "Monitoring"],
    tips: ["Show automation and reliability.", "Mention cloud and IaC.", "Quantify uptime/deploy frequency."],
  },
];
