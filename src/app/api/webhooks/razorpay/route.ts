import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    await supabase.from("profiles").update({
      plan: "pro_india",
      subscription_status: "active",
      subscription_id: payment.id,
      payment_provider: "razorpay",
    }).eq("id", payment.notes.user_id);
  }

  return NextResponse.json({ received: true });
}
