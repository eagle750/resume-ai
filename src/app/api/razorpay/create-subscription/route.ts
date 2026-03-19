import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    return NextResponse.json({ error: "Subscription plan not configured" }, { status: 500 });
  }

  try {
    const razorpay = getRazorpayInstance();
    const subscription = await (razorpay as any).subscriptions.create({
      plan_id: planId,
      total_count: 12, // auto-renews up to 12 months; user can cancel anytime
      quantity: 1,
      notes: { user_id: session.user.id },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Razorpay subscription error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
