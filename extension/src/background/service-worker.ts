import { ROUTES } from "../utils/constants";

// Listen for job detection from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "JOB_DETECTED") {
    // Store detected job data
    chrome.storage.local.set({ detectedJob: message.payload });

    // Update extension badge to show JD was found
    chrome.action.setBadgeText({ text: "JD", tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
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
    const isJobPage =
      changeInfo.url.includes("linkedin.com/jobs") ||
      changeInfo.url.includes("indeed.com/viewjob") ||
      changeInfo.url.includes("naukri.com/job");

    if (!isJobPage) {
      chrome.action.setBadgeText({ text: "", tabId });
      chrome.storage.local.remove("detectedJob");
    }
  }
});
