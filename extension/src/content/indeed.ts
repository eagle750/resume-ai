import { sendJobData, cleanText, waitForElement } from "./common";

// Detect if current URL/state has a job open
function hasJobParam(): boolean {
  const url = window.location.href;
  return (
    url.includes("/viewjob") ||
    url.includes("vjk=") ||
    url.includes("jk=")
  );
}

async function extractIndeedJob() {
  if (!hasJobParam()) return;

  // Side panel on search results uses different selectors than /viewjob page
  await waitForElement(
    [
      ".jobsearch-JobInfoHeader-title",
      "h1[data-testid='jobsearch-JobInfoHeader-title']",
      ".jobTitle[data-testid='jobTitle']",
      ".job-title",
      "h1.icl-u-xs-mb--xs",
    ].join(", ")
  );

  const titleEl =
    document.querySelector("h1[data-testid='jobsearch-JobInfoHeader-title']") ||
    document.querySelector(".jobsearch-JobInfoHeader-title") ||
    document.querySelector(".jobTitle[data-testid='jobTitle']") ||
    document.querySelector(".job-title") ||
    document.querySelector("h1.icl-u-xs-mb--xs") ||
    document.querySelector("h1");
  const title = titleEl?.textContent?.trim() || "Unknown Title";

  const companyEl =
    document.querySelector("[data-testid='inlineHeader-companyName']") ||
    document.querySelector("[data-testid='employer-name']") ||
    document.querySelector(".jobsearch-InlineCompanyRating-companyHeader") ||
    document.querySelector("[data-company-name]") ||
    document.querySelector(".companyName");
  const company = companyEl?.textContent?.trim() || "Unknown Company";

  const descEl =
    document.querySelector("#jobDescriptionText") ||
    document.querySelector(".jobsearch-jobDescriptionText") ||
    document.querySelector("[data-testid='jobDescriptionText']") ||
    document.querySelector(".jobDescription") ||
    document.querySelector("[id*='jobDescription']");
  const description = descEl ? cleanText(descEl.textContent || "") : "";

  if (description.length > 50) {
    sendJobData({
      title,
      company,
      description,
      url: window.location.href,
      site: "indeed",
    });
  }
}

extractIndeedJob();

// Watch for URL changes — Indeed search results update URL when clicking jobs
// without a full page reload
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    if (hasJobParam()) {
      setTimeout(extractIndeedJob, 1500);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
