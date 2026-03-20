import type { IPublishProvider } from "./providers/types";
import { MetaGraphProvider } from "./providers/meta-graph";
import { LateDevProvider } from "./providers/late-dev";

export type { IPublishProvider, PublishResult } from "./providers/types";

/**
 * Factory function that returns the correct publish provider
 * based on the PUBLISH_PROVIDER env var.
 *
 * Usage:
 *   const publisher = getPublishProvider();
 *   await publisher.publishCarousel(urls, caption);
 *
 * Switch providers by changing one env var:
 *   PUBLISH_PROVIDER=late   -> uses Late.dev (default, easier setup)
 *   PUBLISH_PROVIDER=meta   -> uses Meta Graph API (free, needs developer account)
 */
export function getPublishProvider(): IPublishProvider {
  const provider = (process.env.PUBLISH_PROVIDER || "late").toLowerCase().trim();

  switch (provider) {
    case "meta":
    case "graph":
    case "facebook":
      // eslint-disable-next-line no-console
      console.log("[PUBLISHER] Meta Graph API (direct)");
      return new MetaGraphProvider();

    case "late":
    case "latedev":
    case "late.dev":
      // eslint-disable-next-line no-console
      console.log("[PUBLISHER] Late.dev");
      return new LateDevProvider();

    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown PUBLISH_PROVIDER "${provider}", falling back to Late.dev`);
      return new LateDevProvider();
  }
}

