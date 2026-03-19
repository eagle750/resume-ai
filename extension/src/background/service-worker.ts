import { ROUTES } from "../utils/constants";

/** Match job-listing URLs for all locales (e.g. in.indeed.com) and /jobs?...&vjk= */
function isSupportedJobListingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const search = u.search;

    if (host.includes("linkedin.com") && path.includes("/jobs")) return true;
    if (
      host.includes("naukri.com") &&
      (path.includes("/job") || path.includes("job-listings"))
    )
      return true;

    if (host === "indeed.com" || host.endsWith(".indeed.com")) {
      if (path.includes("/viewjob")) return true;
      if (search.includes("vjk=") || search.includes("jk=")) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Listen for job detection from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "JOB_DETECTED") {
    // Store detected job data
    chrome.storage.local.set({ detectedJob: message.payload });

    // Update extension badge to show JD was found
    chrome.action.setBadgeText({ text: "JD", tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
  }

  if (message.type === "DEBUG_INDEED_RESULT") {
    // Content scripts run in isolated worlds; sending a debug payload here
    // makes it easy to inspect in the service worker console.
    // eslint-disable-next-line no-console
    console.log("[ResumeAI][DEBUG_INDEED_RESULT]", message.payload);
  }

  if (message.type === "CLEAR_JOB") {
    chrome.storage.local.remove("detectedJob");
    chrome.action.setBadgeText({ text: "" });
  }

  if (message.type === "CHECK_AUTH") {
    // Check if user is logged into the SaaS
    fetch(ROUTES.checkAuth, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ authenticated: !!data?.user, user: data?.user });
      })
      .catch(() => {
        sendResponse({ authenticated: false });
      });
    return true; // Keep channel open for async response
  }
});

// Clear badge when navigating away from job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    const isJobPage = isSupportedJobListingUrl(changeInfo.url);

    if (!isJobPage) {
      chrome.action.setBadgeText({ text: "", tabId });
      chrome.storage.local.remove("detectedJob");
    } else {
      // Restore badge if we already have a stored job (SW woke up mid-session)
      chrome.storage.local.get("detectedJob", (data) => {
        if (data.detectedJob) {
          chrome.action.setBadgeText({ text: "JD", tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
        }
      });
    }
  }
});
