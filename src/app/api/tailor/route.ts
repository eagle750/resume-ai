import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tailoredResumes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { tailorResume } from "@/lib/claude";

const FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset monthly counter if 30+ days passed
    const daysSinceReset = user.tailorsResetDate
      ? (Date.now() - user.tailorsResetDate.getTime()) / 86400000
      : 31;

    if (daysSinceReset >= 30) {
      await db
        .update(users)
        .set({
          tailorsUsedThisMonth: 0,
          tailorsResetDate: new Date(),
        })
        .where(eq(users.id, userId));
      user.tailorsUsedThisMonth = 0;
    }

    // Check limits for free users
    if (
      user.plan === "free" &&
      (user.tailorsUsedThisMonth || 0) >= FREE_LIMIT
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
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    // Call Claude AI
    const result = await tailorResume(resumeText, jobDescription);

    // Save to database
    const [saved] = await db
      .insert(tailoredResumes)
      .values({
        userId,
        jobDescription,
        companyName: result.extracted_job_info.company_name,
        jobTitle: result.extracted_job_info.job_title,
        originalResumeText: resumeText,
        tailoredResumeJson: result.tailored_sections,
        atsScore: result.ats_score,
        scoreBreakdown: result.score_breakdown,
        missingKeywords: result.missing_keywords,
        suggestions: result.suggestions,
      })
      .returning();

    // Increment usage counter
    await db
      .update(users)
      .set({
        tailorsUsedThisMonth: sql`${users.tailorsUsedThisMonth} + 1`,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      data: { ...result, id: saved.id },
    });
  } catch (error: any) {
    console.error("Tailor API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
