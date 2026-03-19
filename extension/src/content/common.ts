import type { JobData } from "@/types";

/**
 * Sends extracted job data to the extension popup via chrome messaging.
 * Called by each site-specific content script.
 */
export function sendJobData(data: JobData) {
  chrome.runtime.sendMessage({
    type: "JOB_DETECTED",
    payload: data,
  });
}

/**
 * Cleans up extracted text: removes extra whitespace, newlines, etc.
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Waits for an element to appear in the DOM.
 * Useful because LinkedIn loads content dynamically.
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver((_, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
