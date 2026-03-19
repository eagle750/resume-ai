import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();
  if (!verifyRazorpayWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const subscription = payload.payload?.subscription?.entity;
  const payment = payload.payload?.payment?.entity;

  const userId =
    subscription?.notes?.user_id ?? payment?.notes?.user_id;

  if (!userId) return NextResponse.json({ received: true });

  if (event === "subscription.activated" || event === "subscription.charged") {
    // Extend pro access by 30 days from now
    const proExpiresAt = new Date();
    proExpiresAt.setDate(proExpiresAt.getDate() + 30);

    await db
      .update(users)
      .set({
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionId: subscription?.id ?? payment?.subscription_id,
        paymentProvider: "razorpay",
        proExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  if (event === "subscription.cancelled" || event === "subscription.halted") {
    await db
      .update(users)
      .set({
        plan: "free",
        subscriptionStatus: event === "subscription.cancelled" ? "cancelled" : "past_due",
        proExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  return NextResponse.json({ received: true });
}
