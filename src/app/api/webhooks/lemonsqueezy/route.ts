import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyLemonSqueezySignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return hmac === signature;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature") ?? "";
  const rawBody = await req.text();
  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  // Handle subscription_created, subscription_updated, subscription_cancelled
  // and update profiles accordingly (e.g. plan = pro_global)
  return NextResponse.json({ received: true });
}
