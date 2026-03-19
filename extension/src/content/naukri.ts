import { sendJobData, cleanText, waitForElement } from "./common";

async function extractNaukriJob() {
  await waitForElement(".styles_jd-header-title__rZwM1, .jd-header-title");

  const titleEl =
    document.querySelector(".styles_jd-header-title__rZwM1") ||
    document.querySelector(".jd-header-title") ||
    document.querySelector("h1.styles_jhc__job-name___CJb2m") ||
    document.querySelector("h1");
  const title = titleEl?.textContent?.trim() || "Unknown Title";

  const companyEl =
    document.querySelector(".styles_jd-header-comp-name__MvqAI a") ||
    document.querySelector(".jd-header-comp-name a") ||
    document.querySelector("[data-company-name]");
  const company = companyEl?.textContent?.trim() || "Unknown Company";

  const descEl =
    document.querySelector(".styles_JDC__dang-inner-html__h0K4t") ||
    document.querySelector(".dang-inner-html") ||
    document.querySelector(".job-desc") ||
    document.querySelector("[class*='jobDescription']");
  const description = descEl ? cleanText(descEl.textContent || "") : "";

  if (description.length > 50) {
    sendJobData({
      title,
      company,
      description,
      url: window.location.href,
      site: "naukri",
    });
  }
}

extractNaukriJob();
