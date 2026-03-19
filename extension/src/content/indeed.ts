import {
  sendJobData,
  cleanText,
  querySelectorDeep,
  querySelectorDeepAny,
  waitForElementDeep,
} from "./common";
import type { JobData } from "@/types";

const MIN_DESCRIPTION_CHARS = 35;

// Injection marker so we can confirm the content script actually runs on the page
// (helps distinguish stale stored `detectedJob` vs new extraction failing).
try {
  chrome.storage.local.set({
    debugIndeedInjectedUrl: window.location.href,
    debugIndeedInjectedAt: Date.now(),
  });
} catch {
  // ignore
}

/** Indeed job search can use /jobs?...&vjk= or /?...&vjk= or /viewjob */
function hasJobParam(): boolean {
  const { pathname, search } = window.location;
  return (
    pathname.includes("/viewjob") ||
    search.includes("vjk=") ||
    search.includes("jk=")
  );
}

/**
 * Indeed often renders the JD in a same-origin iframe or shadow tree. Top frame has ?vjk=
 * while the iframe URL may not — still run extraction when JD nodes exist in this frame.
 */
function shouldActivateInThisFrame(): boolean {
  if (hasJobParam()) return true;
  if (window !== window.top) {
    return !!(
      querySelectorDeep("#jobDescriptionText") ||
      querySelectorDeep("[data-testid='jobDescriptionText']") ||
      querySelectorDeep(".jobsearch-jobDescriptionText")
    );
  }

  // Top frame: Indeed may show the selected JD in the right pane even when
  // the URL does not include ?vjk=/jk= (SPA behavior). If we can see the
  // pane/title/description in the DOM, go ahead and extract.
  return !!querySelectorDeepAny(
    [
      "#jobsearch-ViewjobPaneWrapper",
      "[data-testid='jobsearch-ViewjobPane']",
      "#jobDescriptionText",
      "[data-testid='jobDescriptionText']",
      ".jobsearch-jobDescriptionText",
      ".jobsearch-JobInfoHeader-title",
      "[data-testid='jobsearch-JobInfoHeader-title']",
      ".jobTitle[data-testid='jobTitle']",
      "[data-testid='jobTitle']",
    ].join(", ")
  );
}

function canonicalJobUrl(): string {
  try {
    if (window.top && window.top !== window) {
      return window.top.location.href;
    }
  } catch {
    /* cross-origin */
  }
  return window.location.href;
}

function currentVjk(): string | null {
  try {
    const own = new URLSearchParams(window.location.search).get("vjk");
    if (own) return own;
    // Job detail iframe may not include ?vjk=; parent search URL usually does
    if (window.top && window.top !== window) {
      return new URLSearchParams(window.top.location.search).get("vjk");
    }
  } catch {
    /* cross-origin top */
  }
  return null;
}

const TITLE_SELECTORS = [
  "[data-testid='jobsearch-JobInfoHeader-title']",
  "h1[data-testid='jobsearch-JobInfoHeader-title']",
  "h2[data-testid='jobsearch-JobInfoHeader-title']",
  ".jobsearch-JobInfoHeader-title",
  ".jobTitle[data-testid='jobTitle']",
  "[data-testid='jobTitle']",
  ".job-title",
  "h1.icl-u-xs-mb--xs",
  "div.jobsearch-JobInfoHeader-title",
  "h1[class*='jobsearch']",
  "h2[class*='jobTitle']",
].join(", ");

const COMPANY_SELECTORS = [
  "[data-testid='inlineHeader-companyName']",
  "[data-testid='employer-name']",
  "a[data-testid='inlineHeader-companyName']",
  ".jobsearch-InlineCompanyRating-companyHeader",
  "[data-company-name]",
  ".companyName",
  "[class*='companyName']",
  "[data-testid='company-name']",
].join(", ");

const DESCRIPTION_SELECTORS = [
  "#jobDescriptionText",
  ".jobsearch-jobDescriptionText",
  "[data-testid='jobDescriptionText']",
  "[data-testid*='jobDescriptionText']",
  ".jobDescription",
  "#jobDetailsSection",
  "[class*='jobDescriptionText']",
  // #vjs-desc has shown up to be non-JD in some layouts; keep it out for accuracy.
];

function isProbablyCssOrNonJdText(text: string): boolean {
  // Indeed uses CSS-in-JS; deep selectors can accidentally pick up styles.
  // Your screenshot showed "@keyframes"/"keyframes" content.
  const t = text.toLowerCase();
  if (t.includes("keyframes") || t.includes("@keyframes")) return true;
  if (t.includes("fadeout") || t.includes("fade-in") || t.includes("fadein")) return true;
  if (t.includes("animation") || t.includes("transform")) return true;
  if (t.includes("translate") || t.includes("opacity:")) return true;
  // CSS blocks often contain braces / semicolons.
  if (/[{}]/.test(text) && text.length < 6000) return true;
  // Some keyframes blocks render with from/to tokens.
  if (t.includes("from") && t.includes("to") && (t.includes("{") || t.includes("transform"))) {
    return true;
  }
  return false;
}

function firstMatchingTextDeep(selectorsCsv: string): string {
  for (const raw of selectorsCsv.split(",")) {
    const sel = raw.trim();
    if (!sel) continue;
    const el = querySelectorDeep(sel);
    const t = el?.textContent?.trim();
    if (t && t.length > 0) return t;
  }
  return "";
}

/** Fallback: highlighted job row often has data-jk matching URL ?vjk= */
function textFromJobCardForVjk(vjk: string): { title: string; company: string } {
  const esc = (vjk || "").replace(/["'\\]/g, "");
  if (!esc) return { title: "", company: "" };

  const card =
    querySelectorDeep(`[data-jk="${esc}"]`) ||
    querySelectorDeep(`li[data-jk="${esc}"]`) ||
    querySelectorDeep(`div[data-jk="${esc}"]`);

  if (!card) return { title: "", company: "" };

  const titleEl =
    card.querySelector("[data-testid='jobsearch-JobInfoHeader-title']") ||
    card.querySelector("h2.jobTitle, h2 span[title], .jobTitle, a.jcs-JobTitle span") ||
    card.querySelector("h2, h3, a");

  const companyEl =
    card.querySelector("[data-testid='companyName']") ||
    card.querySelector(".companyName, [data-testid='company-name'], span[data-testid='company-name']");

  return {
    title: titleEl?.textContent?.trim() || "",
    company: companyEl?.textContent?.trim() || "",
  };
}

/** When structured nodes are missing, use the main job detail column text (deep). */
function descriptionFromJobPane(title: string, company: string): string {
  const pane =
    querySelectorDeep("#jobsearch-ViewjobPaneWrapper") ||
    querySelectorDeep("[data-testid='jobsearch-ViewjobPane']") ||
    querySelectorDeepAny(
      "#mosaic-provider-jobcards ~ div, div[class*='ViewJob'], div[class*='jobsearch-ViewjobPane']"
    );

  if (!pane) return "";

  let text = cleanText(pane.innerText || pane.textContent || "");
  for (const line of [title, company]) {
    if (line && line !== "Unknown Title" && line !== "Unknown Company") {
      const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(`^\\s*${escaped}\\s*`, "i"), "");
    }
  }
  return text.trim();
}

let lastPayloadKey = "";

function sendIfMeaningful(data: JobData) {
  const key = `${data.url}|${data.title}|${data.description.slice(0, 120)}`;
  if (key === lastPayloadKey) return;
  lastPayloadKey = key;
  sendJobData(data);
}

function stripCssLike(text: string): string {
  if (!text) return "";
  let t = text;
  // Remove @keyframes blocks
  t = t.replace(/@keyframes[^{]*\{[\s\S]*?\}\s*/gi, " ");
  // Remove "keyframes { ... }" blocks (some renders omit @)
  t = t.replace(/keyframes\s*\{[\s\S]*?\}\s*/gi, " ");

  // Remove lines that look like CSS tokens
  t = t
    .split("\n")
    .filter((line) => {
      const s = line.trim();
      if (!s) return false;
      const lower = s.toLowerCase();
      if (lower.includes("@keyframes") || lower.includes("keyframes")) return false;
      // short CSS-ish fragments
      if (/[{}]/.test(s) && s.length < 300) return false;
      return true;
    })
    .join("\n");

  return cleanText(t);
}

async function extractIndeedJob() {
  if (!shouldActivateInThisFrame()) return;

  const vjk = currentVjk();

  // Shadow-aware wait (polling) — MutationObserver cannot see inside shadow roots
  await waitForElementDeep(
    `${TITLE_SELECTORS}, ${DESCRIPTION_SELECTORS.join(", ")}`,
    35000
  );

  let title =
    firstMatchingTextDeep(TITLE_SELECTORS) ||
    querySelectorDeep("main h1, main h2")?.textContent?.trim() ||
    "";

  let company = firstMatchingTextDeep(COMPANY_SELECTORS);

  if ((!title || title.length < 2) && vjk) {
    const fromCard = textFromJobCardForVjk(vjk);
    if (fromCard.title) title = fromCard.title;
    if (!company && fromCard.company) company = fromCard.company;
  }

  if (!title) title = "Unknown Title";
  if (!company) company = "Unknown Company";

  // Prefer the right-pane text as the source of truth.
  const paneDescription = descriptionFromJobPane(title, company);
  const paneSuspicious =
    paneDescription && isProbablyCssOrNonJdText(paneDescription);

  let description = "";
  const candidates: Array<{ sel: string; text: string }> = [];
  for (const sel of DESCRIPTION_SELECTORS) {
    const el = querySelectorDeep(sel);
    if (!el) continue;
    const chunk = cleanText(el.textContent || "");
    if (!chunk || isProbablyCssOrNonJdText(chunk)) continue;
    candidates.push({ sel, text: chunk });
  }

  // Choose description:
  // 1) If pane text is usable, use it (it’s usually the actual JD).
  // 2) Otherwise, fall back to the longest candidate.
  // 3) Otherwise, try pane text again even if it was suspicious (last resort).
  if (paneDescription && !paneSuspicious && paneDescription.length >= MIN_DESCRIPTION_CHARS) {
    description = paneDescription;
  } else if (candidates.length > 0) {
    description = candidates.reduce((a, b) => (b.text.length > a.text.length ? b : a), candidates[0]).text;
  } else if (paneDescription) {
    description = paneDescription;
  }

  const chosenCandidate = description
    ? candidates.find((c) => c.text === description)?.sel
    : undefined;

  // Strip CSS-like junk from whatever we extracted.
  const rawDesc = description;
  description = stripCssLike(description);

  // Save debug info for quick inspection.
  try {
    chrome.storage.local.set({
      debugIndeed: {
        url: canonicalJobUrl(),
        title,
        company,
        paneLen: paneDescription?.length || 0,
        paneSuspicious,
        chosenSelector: chosenCandidate || null,
        rawDescLen: rawDesc.length,
        descLen: description.length,
        rawDescPreview: rawDesc.slice(0, 180),
        descPreview: description.slice(0, 180),
      },
    });

    // Also log to service worker console for visibility even if storage reads are delayed.
    chrome.runtime.sendMessage({
      type: "DEBUG_INDEED_RESULT",
      payload: {
        url: canonicalJobUrl(),
        title,
        company,
        paneLen: paneDescription?.length || 0,
        paneSuspicious,
        chosenSelector: chosenCandidate || null,
        rawDescPreview: rawDescPreview,
        descPreview: description.slice(0, 140),
        descLen: description.length,
      },
    });
  } catch {
    // ignore
  }

  const hasStrongTitle =
    title !== "Unknown Title" && title.length >= 3 && title.length < 400;
  const hasStrongCompany =
    company !== "Unknown Company" && company.length >= 2 && company.length < 200;

  if (description.length < MIN_DESCRIPTION_CHARS) {
    if (!(hasStrongTitle && hasStrongCompany && description.length >= 20)) {
      return;
    }
  }

  sendIfMeaningful({
    title,
    company,
    description,
    url: canonicalJobUrl(),
    site: "indeed",
  });
}

void extractIndeedJob();

function debounce(fn: () => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

const scheduleExtract = debounce(() => {
  void extractIndeedJob();
}, 400);

function onLocationMaybeChanged() {
  const href = window.location.href;
  if (href !== lastHref) {
    lastHref = href;
    lastPayloadKey = "";
    if (shouldActivateInThisFrame()) {
      setTimeout(() => void extractIndeedJob(), 600);
    }
  }
}

let lastHref = window.location.href;

// Indeed SPA: history API (MutationObserver on body often misses URL-only updates)
const _pushState = history.pushState.bind(history);
const _replaceState = history.replaceState.bind(history);
history.pushState = (...args: Parameters<History["pushState"]>) => {
  const r = _pushState(...args);
  queueMicrotask(onLocationMaybeChanged);
  return r;
};
history.replaceState = (...args: Parameters<History["replaceState"]>) => {
  const r = _replaceState(...args);
  queueMicrotask(onLocationMaybeChanged);
  return r;
};
window.addEventListener("popstate", () => queueMicrotask(onLocationMaybeChanged));

// Backup: some navigations still touch the DOM tree
const urlObserver = new MutationObserver(() => {
  onLocationMaybeChanged();
});
if (document.body) {
  urlObserver.observe(document.body, { childList: true, subtree: true });
}

const domObserver = new MutationObserver(() => {
  if (shouldActivateInThisFrame()) scheduleExtract();
});
domObserver.observe(document.documentElement, { childList: true, subtree: true });

const retryDelays = [1500, 4000, 8000, 16000, 24000];
for (const ms of retryDelays) {
  window.setTimeout(() => {
    if (shouldActivateInThisFrame()) void extractIndeedJob();
  }, ms);
}
