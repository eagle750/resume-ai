const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.in";

export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "ResumeAI",
          url: BASE_URL,
          description:
            "AI-powered resume tailoring tool that optimizes your resume for any job description",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            description: "Free plan with 3 resume tailors per month",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "1240",
          },
        }),
      }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }),
      }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  date,
  slug,
  image,
}: {
  title: string;
  description: string;
  date: string;
  slug: string;
  image?: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: image || `${BASE_URL}/og-image.png`,
          datePublished: date,
          dateModified: date,
          author: { "@type": "Organization", name: "ResumeAI" },
          publisher: {
            "@type": "Organization",
            name: "ResumeAI",
            logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
          },
          mainEntityOfPage: `${BASE_URL}/blog/${slug}`,
        }),
      }}
    />
  );
}
