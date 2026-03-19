import { ROUTES } from "@/utils/constants";
import type { UserProfile, TailorResult } from "@/types";

/**
 * All API calls use `credentials: "include"` so the browser
 * sends the NextAuth session cookie automatically.
 * The user must be logged into the SaaS website in the same browser.
 */

export async function checkAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    const res = await fetch(ROUTES.checkAuth, {
      credentials: "include",
    });
    const data = await res.json();
    if (data?.user) {
      return { authenticated: true, user: data.user };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch(ROUTES.getProfile, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function tailorResume(
  resumeText: string,
  jobDescription: string
): Promise<TailorResult> {
  const res = await fetch(ROUTES.tailorResume, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to tailor resume");
  }

  const data = await res.json();
  return data.data;
}

// The web dashboard generates a PDF by sending the tailored resume payload.
// The Next.js `/api/generate-pdf` route expects `{ resume, template, addWatermark }`.
export async function downloadPdf(resume: any): Promise<Blob> {
  const res = await fetch(ROUTES.generatePdf, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume,
      template: "clean",
      addWatermark: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || "Failed to generate PDF");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/pdf")) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Expected PDF, got: ${contentType || "unknown"}: ${errText.slice(
        0,
        200
      )}`
    );
  }

  return await res.blob();
}
