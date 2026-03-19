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
 * Query selector that pierces open shadow roots (Indeed / mosaic often render JD inside shadow DOM).
 * Standard document.querySelector does not see into shadow trees.
 */
export function querySelectorDeep(selector: string): Element | null {
  function search(root: Document | ShadowRoot): Element | null {
    try {
      const direct = root.querySelector(selector);
      if (direct) return direct;
    } catch {
      return null;
    }
    const elements = root.querySelectorAll("*");
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.shadowRoot) {
        const found = search(el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }
  return search(document);
}

/** Try comma-separated selectors; return first match from deep search. */
export function querySelectorDeepAny(selectorsCsv: string): Element | null {
  for (const raw of selectorsCsv.split(",")) {
    const sel = raw.trim();
    if (!sel) continue;
    const el = querySelectorDeep(sel);
    if (el) return el;
  }
  return null;
}

export function waitForElement(
  selector: string,
  timeout = 15000
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

    const root = document.body ?? document.documentElement;
    observer.observe(root, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/** Poll with shadow piercing — MutationObserver misses shadow-DOM updates. */
export function waitForElementDeep(
  selectorsCsv: string,
  timeout = 30000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const el = querySelectorDeepAny(selectorsCsv);
      if (el) {
        window.clearInterval(id);
        resolve(el);
        return;
      }
      if (Date.now() - start >= timeout) {
        window.clearInterval(id);
        resolve(null);
      }
    }, 250);
  });
}
