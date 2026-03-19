import {
  sendJobData,
  cleanText,
  querySelectorDeep,
  waitForElementDeep,
  querySelectorDeepAny,
} from "./common";
import type { JobData } from "@/types";

const MIN_DESCRIPTION_CHARS = 40;

const TITLE_SELECTORS = [
  "[data-tracking-control-name='public_jobs_topcard-job-title']",
  "[data-tracking-control-name='public_jobs_topcard-job-title'] span",
  ".job-details-jobs-unified-top-card__job-title",
  ".jobs-unified-top-card__job-title",
  "h1.t-24",
  "h1",
  "h2",
].join(", ");

const COMPANY_SELECTORS = [
  "[data-tracking-control-name='public_jobs_topcard-org-name']",
  ".job-details-jobs-unified-top-card__company-name",
  ".jobs-unified-top-card__company-name",
  "[data-tracking-control-name='public_jobs_topcard-org-name'] a",
  ".company",
  "[class*='company-name']",
].join(", ");

const DESCRIPTION_SELECTORS = [
  ".jobs-description__content",
  ".jobs-description-content__text",
  "#job-details",
  ".jobs-box__html-content",
  "[class*='jobs-description']",
  "[id*='job-details']",
].join(", ");

// Injection marker for debugging LinkedIn detection.
try {
  chrome.storage.local.set({
    debugLinkedinInjectedUrl: window.location.href,
    debugLinkedinInjectedAt: Date.now(),
  });
} catch {
  // ignore
}

async function extractLinkedInJob() {
  // Wait for either title or description to appear.
  await waitForElementDeep(
    `${TITLE_SELECTORS}, ${DESCRIPTION_SELECTORS}`,
    30000
  );

  const titleEl = querySelectorDeepAny(TITLE_SELECTORS);
  const companyEl = querySelectorDeepAny(COMPANY_SELECTORS);
  const descEl = querySelectorDeepAny(DESCRIPTION_SELECTORS);

  const title = titleEl?.textContent?.trim() || "Unknown Title";
  const company = companyEl?.textContent?.trim() || "Unknown Company";
  const description = descEl ? cleanText(descEl.textContent || "") : "";

  const hasValidText =
    title !== "Unknown Title" ||
    company !== "Unknown Company" ||
    description.length >= MIN_DESCRIPTION_CHARS;

  // Save debug snapshot so we can see what LinkedIn exposed.
  try {
    chrome.storage.local.set({
      debugLinkedinExtract: {
        url: window.location.href,
        title,
        company,
        descLen: description.length,
        descPreview: description.slice(0, 180),
        hasValidText,
      },
    });
  } catch {
    // ignore
  }

  if (!hasValidText) return;
  if (description.length < MIN_DESCRIPTION_CHARS) return;

  const payload: JobData = {
    title,
    company,
    description,
    url: window.location.href,
    site: "linkedin",
  };

  sendJobData(payload);
}

function debounce(fn: () => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

const scheduleExtract = debounce(() => {
  void extractLinkedInJob();
}, 500);

// Initial run
void extractLinkedInJob();

// Watch for LinkedIn SPA navigation
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    scheduleExtract();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
