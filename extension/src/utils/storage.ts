import type { JobData, TailorResult } from "@/types";

export async function getStoredJob(): Promise<JobData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("detectedJob", (data) => {
      resolve(data.detectedJob ?? null);
    });
  });
}

export async function setStoredJob(job: JobData): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ detectedJob: job }, resolve);
  });
}

export async function clearStoredJob(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove("detectedJob", resolve);
  });
}

export async function getStoredResult(): Promise<TailorResult | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("lastResult", (data) => {
      resolve(data.lastResult ?? null);
    });
  });
}

export async function setStoredResult(result: TailorResult): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastResult: result }, resolve);
  });
}
