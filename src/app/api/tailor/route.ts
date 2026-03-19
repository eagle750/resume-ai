import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tailorResume } from "@/lib/claude";
import { FREE_TAILORS_PER_MONTH } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const daysSinceReset =
      (Date.now() - new Date(profile.tailors_reset_date).getTime()) / 86400000;
    if (daysSinceReset >= 30) {
      await supabase
        .from("profiles")
        .update({
          tailors_used_this_month: 0,
          tailors_reset_date: new Date().toISOString(),
        })
        .eq("id", user.id);
      profile.tailors_used_this_month = 0;
    }

    if (
      profile.plan === "free" &&
      profile.tailors_used_this_month >= FREE_TAILORS_PER_MONTH
    ) {
      return NextResponse.json(
        {
          error: "Free limit reached. Upgrade to Pro for unlimited tailoring.",
          limit_reached: true,
        },
        { status: 429 }
      );
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    const result = await tailorResume(resumeText, jobDescription);

    const { data: saved } = await supabase
      .from("tailored_resumes")
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        company_name: result.extracted_job_info.company_name,
        job_title: result.extracted_job_info.job_title,
        original_resume_text: resumeText,
        tailored_resume_json: result.tailored_sections,
        ats_score: result.ats_score,
        score_breakdown: result.score_breakdown,
        missing_keywords: result.missing_keywords,
        suggestions: result.suggestions,
      })
      .select()
      .single();

    await supabase
      .from("profiles")
      .update({
        tailors_used_this_month: profile.tailors_used_this_month + 1,
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      data: { ...result, id: saved?.id },
    });
  } catch (error: unknown) {
    console.error("Tailor API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
