import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: { user_id: user.id, plan: "pro_india" },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
