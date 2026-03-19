import { sendJobData, cleanText, waitForElement } from "./common";

async function extractLinkedInJob() {
  // Wait for LinkedIn's dynamic content to load
  await waitForElement(".job-details-jobs-unified-top-card__job-title");

  // Extract job title
  const titleEl =
    document.querySelector(".job-details-jobs-unified-top-card__job-title") ||
    document.querySelector(".jobs-unified-top-card__job-title") ||
    document.querySelector("h1.t-24") ||
    document.querySelector("h1");
  const title = titleEl?.textContent?.trim() || "Unknown Title";

  // Extract company name
  const companyEl =
    document.querySelector(".job-details-jobs-unified-top-card__company-name") ||
    document.querySelector(".jobs-unified-top-card__company-name") ||
    document.querySelector("[data-tracking-control-name='public_jobs_topcard-org-name']");
  const company = companyEl?.textContent?.trim() || "Unknown Company";

  // Extract job description
  const descEl =
    document.querySelector(".jobs-description__content") ||
    document.querySelector(".jobs-description-content__text") ||
    document.querySelector("#job-details") ||
    document.querySelector(".jobs-box__html-content");
  const description = descEl ? cleanText(descEl.textContent || "") : "";

  if (description.length > 50) {
    sendJobData({
      title,
      company,
      description,
      url: window.location.href,
      site: "linkedin",
    });
  }
}

// Run on page load
extractLinkedInJob();

// Also watch for LinkedIn's SPA navigation (job listing changes without page reload)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    setTimeout(extractLinkedInJob, 1500); // Wait for content to load
  }
});
observer.observe(document.body, { childList: true, subtree: true });
