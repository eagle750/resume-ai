import type { JobData } from "@/types";

/**
 * Saves extracted job data directly to chrome.storage.local and
 * optionally notifies the background service worker for badge updates.
 *
 * We write to storage directly because MV3 service workers go to sleep
 * and may not be alive to receive the message — storage is always available.
 */
export function sendJobData(data: JobData) {
  // Always write to storage first — popup reads from here
  chrome.storage.local.set({ detectedJob: data });

  // Best-effort message to background for badge update
  // (service worker may be sleeping; that's fine — badge is cosmetic)
  chrome.runtime.sendMessage({ type: "JOB_DETECTED", payload: data }).catch(() => {});
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
