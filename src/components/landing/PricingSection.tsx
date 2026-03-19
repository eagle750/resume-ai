import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Get started with no cost",
    features: ["3 tailored resumes per month", "1 template", "ATS score & breakdown", "Watermark on PDF"],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro India",
    price: "₹499",
    period: "/month",
    description: "Unlimited tailoring for Indian job seekers",
    features: ["Unlimited tailored resumes", "All templates", "No watermark", "Priority support"],
    cta: "Subscribe",
    href: "/dashboard/settings",
    highlighted: true,
  },
  {
    name: "Pro Global",
    price: "$9",
    period: "/month",
    description: "Same as Pro, billed in USD",
    features: ["Unlimited tailored resumes", "All templates", "No watermark", "Global billing"],
    cta: "Subscribe",
    href: "/dashboard/settings",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block w-full">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
