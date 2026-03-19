import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    tailorsUsedThisMonth: user.tailorsUsedThisMonth,
    tailorsResetDate: user.tailorsResetDate,
    baseResumeText: user.baseResumeText,
    baseResumeFilename: user.baseResumeFilename,
    baseResumeUrl: user.baseResumeUrl,
    subscriptionStatus: user.subscriptionStatus,
  });
}
