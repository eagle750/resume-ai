"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

async function startRazorpayCheckout(userEmail: string, userName: string, onSuccess: () => void) {
  const res = await fetch("/api/razorpay/create-order", { method: "POST" });
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const body = await res.json().catch(() => ({}));
    alert(`Payment error: ${body.error ?? "Unknown error (check Vercel logs)"}`);
    return;
  }
  const { orderId, amount, currency } = await res.json();

  const rzp = new (window as any).Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency,
    name: "ResumeAI",
    description: "Pro — Unlimited tailoring",
    order_id: orderId,
    prefill: { email: userEmail, name: userName },
    handler: async (response: any) => {
      const verify = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
      if (verify.ok) {
        onSuccess();
      } else {
        alert("Payment verification failed. Contact support.");
      }
    },
  });
  rzp.open();
}

export function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleProIndia = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    // Load Razorpay script if not already loaded
    if (!(window as any).Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });
    }
    await startRazorpayCheckout(
      session.user.email ?? "",
      session.user.name ?? "",
      () => router.push("/dashboard?upgraded=1")
    );
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-2xl font-bold">
                ₹0<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <p className="text-sm text-muted-foreground">Get started with no cost</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {["3 tailored resumes per month", "1 template", "ATS score & breakdown", "Watermark on PDF"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full">
                <Button className="w-full" variant="outline">Get started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary shadow-lg">
            <CardHeader>
              <h3 className="font-semibold text-lg">Pro</h3>
              <p className="text-2xl font-bold">
                ₹199<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <p className="text-sm text-muted-foreground">Unlimited tailoring, no watermark</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {["Unlimited tailored resumes", "All templates", "No watermark", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={handleProIndia}>Subscribe</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
