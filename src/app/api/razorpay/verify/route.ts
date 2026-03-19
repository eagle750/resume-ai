import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

  // Razorpay subscription signature: payment_id | subscription_id
  const body = razorpay_payment_id + "|" + razorpay_subscription_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const session = await auth();
  if (session?.user?.id) {
    const proExpiresAt = new Date();
    proExpiresAt.setDate(proExpiresAt.getDate() + 30);

    await db
      .update(users)
      .set({
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionId: razorpay_subscription_id,
        paymentProvider: "razorpay",
        proExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  }

  return NextResponse.json({ success: true });
}
