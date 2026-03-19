export const FAQ_ITEMS = [
  {
    question: "What is ResumeAI?",
    answer:
      "ResumeAI is an AI-powered resume tailoring tool. You upload your resume once, paste any job description, and get an ATS-optimized tailored resume in about 30 seconds—with keyword matching, rewritten bullets, and an ATS score.",
  },
  {
    question: "How many resumes can I tailor for free?",
    answer:
      "Free users get 3 tailored resumes per month. Pro users get unlimited tailoring, all templates, and no watermark on PDFs.",
  },
  {
    question: "Is my resume data secure?",
    answer:
      "Yes. We use NextAuth.js for authentication, Neon Postgres for data storage, and Cloudflare R2 for file storage. Resume text is processed by Anthropic Claude and not used for model training.",
  },
  {
    question: "What file formats are supported for upload?",
    answer:
      "We support PDF and DOCX. Paste the job description as plain text in the dashboard.",
  },
  {
    question: "What is ATS and why does it matter?",
    answer:
      "ATS (Applicant Tracking System) is software used by companies to filter resumes. It scans for keywords and structure. ResumeAI rewrites your resume to match the job description so it passes ATS and reaches recruiters.",
  },
];
