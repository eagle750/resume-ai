import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // Update user plan
  const session = await auth();
  if (session?.user?.id) {
    await db
      .update(users)
      .set({
        plan: "pro_india",
        subscriptionStatus: "active",
        subscriptionId: razorpay_payment_id,
        paymentProvider: "razorpay",
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  }

  return NextResponse.json({ success: true });
}
