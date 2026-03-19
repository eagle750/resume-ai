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
  const event = payload.event;
  const payment = payload.payload?.payment?.entity;

  if (event === "payment.captured" && payment?.notes?.user_id) {
    await db
      .update(users)
      .set({
        plan: "pro_india",
        subscriptionStatus: "active",
        subscriptionId: payment.id,
        paymentProvider: "razorpay",
        updatedAt: new Date(),
      })
      .where(eq(users.id, payment.notes.user_id));
  }

  return NextResponse.json({ received: true });
}
