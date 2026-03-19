import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: `r_${session.user.id.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
      notes: { user_id: session.user.id, plan: "pro_india" },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Razorpay order error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
