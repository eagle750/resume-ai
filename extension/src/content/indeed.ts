import { sendJobData, cleanText, waitForElement } from "./common";

async function extractIndeedJob() {
  await waitForElement(".jobsearch-JobInfoHeader-title");

  const titleEl =
    document.querySelector(".jobsearch-JobInfoHeader-title") ||
    document.querySelector("h1[data-testid='jobsearch-JobInfoHeader-title']") ||
    document.querySelector("h1.icl-u-xs-mb--xs");
  const title = titleEl?.textContent?.trim() || "Unknown Title";

  const companyEl =
    document.querySelector("[data-testid='inlineHeader-companyName']") ||
    document.querySelector(".jobsearch-InlineCompanyRating-companyHeader") ||
    document.querySelector("[data-company-name]");
  const company = companyEl?.textContent?.trim() || "Unknown Company";

  const descEl =
    document.querySelector("#jobDescriptionText") ||
    document.querySelector(".jobsearch-jobDescriptionText") ||
    document.querySelector("[data-testid='jobDescriptionText']");
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
