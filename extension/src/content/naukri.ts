import {
  sendJobData,
  cleanText,
  querySelectorDeep,
  waitForElementDeep,
} from "./common";
import type { JobData } from "@/types";

// Naukri layouts vary a lot; we must be able to tailor even if the JD
// selectors miss some parts, so keep this reasonably low but not tiny.
const MIN_DESCRIPTION_CHARS = 25;
const MAX_DESCRIPTION_CHARS = 8000;

// Injection marker so we can confirm the content script actually runs
// on your exact Naukri URL (even if extraction fails).
try {
  console.debug("[ResumeAI][Naukri] injected", window.location.href);
  chrome.storage.local.set({
    debugNaukriInjectedUrl: window.location.href,
    debugNaukriInjectedAt: Date.now(),
  });
} catch {
  // ignore
}

/** Naukri job detail URLs (hashed CSS modules change every deploy — avoid exact class names). */
function isNaukriJobDetailPage(): boolean {
  const path = window.location.pathname.toLowerCase();
  return (
    path.includes("job-listings") ||
    path.startsWith("/job/") ||
    /^\/jobs?\/[^/]+/i.test(path)
  );
}

/** JD may render in a same-origin iframe whose path doesn’t include job-listings. */
function shouldActivateInThisFrame(): boolean {
  if (isNaukriJobDetailPage()) return true;
  if (window !== window.top) {
    return !!(
      querySelectorDeep("[class*='dang-inner-html']") ||
      querySelectorDeep(".job-desc") ||
      querySelectorDeep("[class*='jobDescription']") ||
      querySelectorDeep("[class*='jd-header-title']")
    );
  }
  return false;
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

const TITLE_SELECTORS = [
  "[class*='jd-header-title']",
  ".jd-header-title",
  "[class*='jhc__job-name']",
  "h1[class*='job-name']",
  "header h1",
  "main h1",
  "[data-title='jdTitle']",
  "[id*='job-title']",
  "h1",
].join(", ");

const COMPANY_SELECTORS = [
  "[class*='jd-header-comp-name'] a",
  "[class*='jd-header-comp-name']",
  ".jd-header-comp-name a",
  "a[class*='comp-name']",
  "[data-company-name]",
  "[class*='companyName']",
  "header [class*='company'] a",
].join(", ");

const DESCRIPTION_SELECTORS = [
  "[class*='dang-inner-html']",
  "[class*='Dang-inner-html']",
  ".dang-inner-html",
  ".job-desc",
  "[class*='jobDescription']",
  "[class*='job-description']",
  "[id*='jobDescription']",
  "section[class*='job-desc']",
  "div[class*='jd-desc']",
  "[class*='JDC__']",
  "article",
  "main [class*='description']",
];

function findJobPostingFromJsonLd(node: any): any | null {
  if (!node || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPostingFromJsonLd(item);
      if (found) return found;
    }
    return null;
  }

  const atType = node["@type"];
  const typeStr = Array.isArray(atType) ? atType.join(" ") : String(atType || "");
  const looksLikeJob =
    typeStr.toLowerCase().includes("jobposting") ||
    typeStr.toLowerCase().includes("job posting");

  const hasTitle = typeof node.title === "string" && node.title.trim().length > 0;
  const hasDesc =
    typeof node.description === "string" && node.description.trim().length > 0;

  if (looksLikeJob || (hasTitle && hasDesc)) return node;

  for (const k of Object.keys(node)) {
    const found = findJobPostingFromJsonLd(node[k]);
    if (found) return found;
  }
  return null;
}

function extractJobFromJsonLd(): Partial<JobData> | null {
  try {
    const scripts = document.querySelectorAll(
      "script[type='application/ld+json']"
    );

    for (const s of Array.from(scripts)) {
      const raw = (s.textContent || "").trim();
      if (!raw) continue;
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }

      const candidate = findJobPostingFromJsonLd(parsed);
      if (!candidate) continue;

      const title = (
        typeof candidate.title === "string" && candidate.title.trim().length
          ? candidate.title.trim()
          : typeof candidate.name === "string" && candidate.name.trim().length
          ? candidate.name.trim()
          : typeof candidate.jobTitle === "string" && candidate.jobTitle.trim().length
          ? candidate.jobTitle.trim()
          : typeof candidate.headline === "string" && candidate.headline.trim().length
          ? candidate.headline.trim()
          : typeof candidate.alternateHeadline === "string" &&
              candidate.alternateHeadline.trim().length
          ? candidate.alternateHeadline.trim()
          : undefined
      ) as string | undefined;

      const company =
        candidate?.hiringOrganization?.name ||
        candidate?.hiringOrganization?.identifier?.name ||
        candidate?.employer?.name ||
        candidate?.employer?.identifier?.name ||
        candidate?.organization?.name ||
        candidate?.publisher?.name ||
        candidate?.owner?.name ||
        candidate?.industry?.name ||
        candidate?.jobLocation?.[0]?.name;

      const descriptionRaw =
        typeof candidate.description === "string" ? candidate.description : undefined;

      const description = descriptionRaw ? cleanText(descriptionRaw) : "";

      return {
        title,
        company: typeof company === "string" ? company.trim() : undefined,
        description,
        url: canonicalJobUrl(),
        site: "naukri",
      };
    }
  } catch {
    // ignore
  }

  return null;
}

function extractJobFromMeta(): Partial<JobData> | null {
  try {
    const ogTitle = document
      .querySelector("meta[property='og:title']")
      ?.getAttribute("content")
      ?.trim();

    const ogDesc =
      document
        .querySelector("meta[property='og:description']")
        ?.getAttribute("content")
        ?.trim() ||
      document.querySelector("meta[name='description']")?.getAttribute("content")?.trim();

    const title = ogTitle || undefined;
    const description = ogDesc ? cleanText(ogDesc) : "";

    if (!title && description.length === 0) return null;

    return {
      title,
      company: undefined,
      description,
      url: canonicalJobUrl(),
      site: "naukri",
    };
  } catch {
    return null;
  }
}

function firstMatchingTextDeep(selectorsCsv: string): string {
  for (const raw of selectorsCsv.split(",")) {
    const sel = raw.trim();
    if (!sel) continue;
    const el = querySelectorDeep(sel);
    const t = el?.textContent?.trim();
    if (t && t.length > 0 && t.length < 500) return t;
  }
  return "";
}

/** Longest JD-like block from candidates */
function longestDescription(): string {
  let best = "";
  for (const raw of DESCRIPTION_SELECTORS) {
    const sel = raw.trim();
    if (!sel) continue;
    const el = querySelectorDeep(sel);
    if (!el) continue;
    const text = cleanText(el.textContent || "");
    if (text.length > best.length) best = text;
  }
  return best;
}

/** Heuristic: main column minus chrome */
function descriptionFromMain(title: string, company: string): string {
  const main =
    querySelectorDeep("main") ||
    querySelectorDeep("[role='main']") ||
    querySelectorDeep("#root main") ||
    querySelectorDeep("article");

  if (!main) return "";

  let text = cleanText(main.innerText || main.textContent || "");
  for (const line of [title, company]) {
    if (line && line !== "Unknown Title" && line !== "Unknown Company") {
      const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(`^\\s*${escaped}\\s*`, "i"), "");
    }
  }
  return text.trim();
}

function descriptionFromBody(title: string, company: string): string {
  // Last-resort fallback: page text includes lots of nav chrome, but it is
  // usually still enough for tailoring.
  const root = document.body || document.documentElement;
  if (!root) return "";

  let text = cleanText((root as HTMLElement).innerText || root.textContent || "");
  for (const line of [title, company]) {
    if (line && line !== "Unknown Title" && line !== "Unknown Company") {
      const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ");
    }
  }
  // Collapse runs again after removals
  return cleanText(text);
}

let lastPayloadKey = "";

function debugDebugPayload(payload: any) {
  try {
    // Visible in the page DevTools console
    console.debug("[ResumeAI][Naukri]", payload);
    // Also save for quick inspection via chrome DevTools
    chrome.storage.local.set({ debugNaukri: payload });
  } catch {
    // ignore
  }
}

function sendIfMeaningful(data: JobData) {
  const key = `${data.url}|${data.title}|${data.description.slice(0, 120)}`;
  if (key === lastPayloadKey) return;
  lastPayloadKey = key;
  sendJobData(data);
}

async function extractNaukriJob() {
  if (!shouldActivateInThisFrame()) return;

  try {
    await waitForElementDeep(
      `script[type='application/ld+json'], ${TITLE_SELECTORS}, ${DESCRIPTION_SELECTORS.join(", ")}`,
      35000
    );

    let title = firstMatchingTextDeep(TITLE_SELECTORS);
    if (!title || title.length > 400) {
      const h1 = querySelectorDeep("main h1") || querySelectorDeep("h1");
      title = h1?.textContent?.trim() || "";
    }
    if (!title) title = "Unknown Title";

    let company = firstMatchingTextDeep(COMPANY_SELECTORS);
    if (!company) company = "Unknown Company";

    let description = longestDescription();

    const jsonLd = extractJobFromJsonLd();
    if (jsonLd?.title && (!title || title === "Unknown Title")) title = jsonLd.title;
    if (
      jsonLd?.company &&
      (!company || company === "Unknown Company")
    )
      company = jsonLd.company;
    if (jsonLd?.description && jsonLd.description.length > description.length) {
      description = jsonLd.description;
    }

    const meta = extractJobFromMeta();
    if (meta?.title && (!title || title === "Unknown Title")) title = meta.title;
    if (meta?.description && meta.description.length > description.length) {
      description = meta.description;
    }

    if (description.length < MIN_DESCRIPTION_CHARS) {
      const fallback = descriptionFromMain(title, company);
      if (fallback.length > description.length) description = fallback;
    }

    const hasStrongTitle =
      title !== "Unknown Title" && title.length >= 3 && title.length < 400;
    const hasStrongCompany =
      company !== "Unknown Company" &&
      company.length >= 2 &&
      company.length < 200;

    // Final fallback: body text.
    if (description.length < MIN_DESCRIPTION_CHARS) {
      const bodyFallback = descriptionFromBody(title, company);
      if (bodyFallback.length > description.length) description = bodyFallback;
    }

    // Hard gate: if we still don't have enough text, don't store garbage.
    const rawBodyText =
      (document.body?.innerText || document.body?.textContent || "").toString();
    const rawBodyLen = rawBodyText.length;
    const rawBodyPreview = cleanText(rawBodyText).slice(0, 200);

    debugDebugPayload({
      url: canonicalJobUrl(),
      title,
      company,
      descLen: description.length,
      minChars: MIN_DESCRIPTION_CHARS,
      bodyInnerTextLen: rawBodyLen,
      bodyPreview: rawBodyPreview,
      hasStrongTitle,
      hasStrongCompany,
      jsonLdApplied: !!jsonLd,
      jsonLdDescLen: jsonLd?.description ? jsonLd.description.length : 0,
      metaApplied: !!meta,
      attemptAt: Date.now(),
    });

    if (description.length < MIN_DESCRIPTION_CHARS) return;

    description = description.slice(0, MAX_DESCRIPTION_CHARS);

    sendIfMeaningful({
      title,
      company,
      description,
      url: canonicalJobUrl(),
      site: "naukri",
    });
  } catch (err: any) {
    debugDebugPayload({
      error: err?.message || String(err),
      stack: err?.stack,
      url: canonicalJobUrl(),
    });
  }
}

void extractNaukriJob();

function debounce(fn: () => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

const scheduleExtract = debounce(() => {
  void extractNaukriJob();
}, 400);

const _push = history.pushState.bind(history);
const _replace = history.replaceState.bind(history);
history.pushState = (...args: Parameters<History["pushState"]>) => {
  const r = _push(...args);
  queueMicrotask(() => {
    lastPayloadKey = "";
    void extractNaukriJob();
  });
  return r;
};
history.replaceState = (...args: Parameters<History["replaceState"]>) => {
  const r = _replace(...args);
  queueMicrotask(() => {
    lastPayloadKey = "";
    void extractNaukriJob();
  });
  return r;
};
window.addEventListener("popstate", () => {
  lastPayloadKey = "";
  void extractNaukriJob();
});

const domObserver = new MutationObserver(() => {
  if (shouldActivateInThisFrame()) scheduleExtract();
});
domObserver.observe(document.documentElement, { childList: true, subtree: true });

for (const ms of [1500, 4000, 8000, 16000, 24000]) {
  window.setTimeout(() => {
    if (shouldActivateInThisFrame()) void extractNaukriJob();
  }, ms);
}
