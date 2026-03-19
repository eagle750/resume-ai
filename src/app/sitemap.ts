import type { MetadataRoute } from "next";
import { companies } from "@/data/companies";
import { roles } from "@/data/roles";
import { getBlogSlugs } from "@/lib/blog";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/tools/ats-score-checker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/tools/resume-keyword-scanner`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/tools/resume-summary-generator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/resume-examples`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const companyPages = companies.map((c) => ({
    url: `${baseUrl}/tools/${c.slug}-resume`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const rolePages = roles.map((r) => ({
    url: `${baseUrl}/resume-examples/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogSlugs = getBlogSlugs();
  const blogPages = blogSlugs.map((s) => ({
    url: `${baseUrl}/blog/${s}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...companyPages, ...rolePages, ...blogPages];
}
