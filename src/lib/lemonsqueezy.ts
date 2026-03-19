import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function initLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LemonSqueezy API key not configured");
  }
  return lemonSqueezySetup({ apiKey });
}
