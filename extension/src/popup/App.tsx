import React, { useState, useEffect } from "react";
import { checkAuth, getProfile, tailorResume as tailorAPI } from "@/api/client";
import type { JobData, UserProfile, TailorResult, PopupState } from "@/types";
import { FREE_LIMIT, ROUTES } from "@/utils/constants";
import LoginPrompt from "./components/LoginPrompt";
import NoJobDetected from "./components/NoJobDetected";
import JobDetected from "./components/JobDetected";
import TailoringLoader from "./components/TailoringLoader";
import ResultView from "./components/ResultView";
import UpgradePrompt from "./components/UpgradePrompt";
import ErrorView from "./components/ErrorView";

export default function App() {
  const [state, setState] = useState<PopupState>("loading");
  const [job, setJob] = useState<JobData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    init();
  }, []);

  // Content scripts often finish after the popup opens; pick up late writes to storage
  useEffect(() => {
    const onStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "local" || !changes.detectedJob?.newValue) return;
      const next = changes.detectedJob.newValue as JobData;
      setJob(next);
      // Don't interrupt loading/auth; init() will read storage. Only upgrade from "no job" UI.
      setState((prev) =>
        prev === "no_job" || prev === "loading" ? "job_detected" : prev
      );
    };
    chrome.storage.onChanged.addListener(onStorage);
    return () => chrome.storage.onChanged.removeListener(onStorage);
  }, []);

  async function init() {
    setState("loading");

    // 1. Check auth
    const auth = await checkAuth();
    if (!auth.authenticated) {
      setState("not_logged_in");
      return;
    }

    // 2. Get profile
    const userProfile = await getProfile();
    if (!userProfile) {
      setState("not_logged_in");
      return;
    }
    setProfile(userProfile);

    // 3. Check if user has uploaded a base resume
    if (!userProfile.baseResumeText) {
      setState("no_resume");
      return;
    }

    // 4. Check for detected job from content script
    // Content scripts can take a while on Indeed/Naukri (SPA + hydration).
    // If we only wait a short time, the UI can fall back to "no_job" even
    // though `detectedJob` arrives moments later.
    const maxWaitMs = 120000; // Indeed/Naukri can take a while (SPA hydration)
    const pollEveryMs = 1000;
    const startAt = Date.now();

    const readJobOnce = () => {
      chrome.storage.local.get("detectedJob", (data) => {
        if (data.detectedJob) {
          setJob(data.detectedJob);
          setState("job_detected");
          return;
        }

        if (Date.now() - startAt >= maxWaitMs) {
          setState("no_job");
          return;
        }

        window.setTimeout(readJobOnce, pollEveryMs);
      });
    };

    readJobOnce();
  }

  async function handleTailor() {
    if (!profile || !job) return;

    // Check usage limits
    if (
      profile.plan === "free" &&
      profile.tailorsUsedThisMonth >= FREE_LIMIT
    ) {
      setState("limit_reached");
      return;
    }

    setState("tailoring");

    try {
      const tailorResult = await tailorAPI(
        profile.baseResumeText!,
        job.description
      );
      setResult(tailorResult);

      // Update local usage count
      setProfile((prev) =>
        prev ? { ...prev, tailorsUsedThisMonth: prev.tailorsUsedThisMonth + 1 } : prev
      );

      setState("result");
    } catch (err: any) {
      if (err.message?.includes("limit")) {
        setState("limit_reached");
      } else {
        setError(err.message || "Something went wrong");
        setState("error");
      }
    }
  }

  function handleReset() {
    setResult(null);
    setError("");
    setState("job_detected");
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-semibold text-sm">ResumeAI</span>
        </div>
        {profile && (
          <span className="text-xs text-gray-500">
            {profile.tailorsUsedThisMonth}/{profile.plan === "free" ? FREE_LIMIT : "∞"} used
          </span>
        )}
      </div>

      {/* States */}
      {state === "loading" && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      )}
      {state === "not_logged_in" && <LoginPrompt />}
      {state === "no_job" && <NoJobDetected />}
      {state === "no_resume" && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 mb-3">Upload your base resume first</p>
          <a
            href={ROUTES.dashboard}
            target="_blank"
            className="inline-block px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
          >
            Go to Dashboard
          </a>
        </div>
      )}
      {state === "job_detected" && job && (
        <JobDetected job={job} onTailor={handleTailor} />
      )}
      {state === "tailoring" && <TailoringLoader />}
      {state === "result" && result && (
        <ResultView result={result} onReset={handleReset} />
      )}
      {state === "limit_reached" && <UpgradePrompt />}
      {state === "error" && <ErrorView message={error} onRetry={handleReset} />}
    </div>
  );
}
