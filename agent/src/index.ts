import path from "path";
import fs from "fs/promises";
import { AGENT_CONFIG } from "./config";
import { discoverTrendingTopics } from "./discover/aggregator";
import { planPostForSlot, type SlotPlan } from "./create/content-planner";
import { writeCarousel } from "./create/carousel-writer";
import { writeReelScript } from "./create/reel-writer";
import { renderAllSlides } from "./generate/image-renderer";
import { uploadFile } from "./publish/uploader";
import { getPublishProvider } from "./publish/instagram";
import { resolveSlotFromNow } from "./publish/scheduler";
import {
  getRecentTopics,
  initTopicHistory,
  savePostedTopic,
} from "./storage/topic-history";
import { logger } from "./utils/logger";

function buildR2Key(slotIndex: number, slideIndex: number): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `instagram/${yyyy}-${mm}-${dd}/slot-${slotIndex}/slide-${slideIndex}.png`;
}

async function run(): Promise<void> {
  const { slotIndex, type } = resolveSlotFromNow();
  const publisher = getPublishProvider();
  // eslint-disable-next-line no-console
  console.log(`Using publish provider: ${publisher.name}`);
  // eslint-disable-next-line no-console
  console.log("To switch providers, change PUBLISH_PROVIDER env var");
  // eslint-disable-next-line no-console
  console.log(`Current: PUBLISH_PROVIDER=${process.env.PUBLISH_PROVIDER || "late"}`);

  logger.info("Starting Instagram autopilot run", {
    slotIndex,
    slotType: type,
    timezone: AGENT_CONFIG.timezone,
  });

  await initTopicHistory();

  logger.info("Discovering trending topics...");
  const trendingTopics = await discoverTrendingTopics();
  logger.info("Topics discovered", { count: trendingTopics.length });

  logger.info("Fetching recent posted topics...");
  const recentTopics = await getRecentTopics(30);

  logger.info("Planning one post for this slot...");
  const planned: SlotPlan = await planPostForSlot(
    trendingTopics,
    recentTopics,
    type
  );

  if (planned.type === "carousel") {
    logger.info("Writing carousel...");
    const carousel = await writeCarousel(
      planned.topic,
      planned.hook,
      planned.angle,
      planned.category,
      planned.hashtags
    );

    logger.info("Rendering slides...");
    const images = await renderAllSlides(carousel.slides);

    logger.info("Uploading slides to R2...");
    const imageUrls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const key = buildR2Key(slotIndex, i + 1);
      const url = await uploadFile(key, images[i], "image/png");
      imageUrls.push(url);
    }

    logger.info("Publishing carousel to Instagram...");
    const result = await publisher.publishCarousel(imageUrls, carousel.caption);

    logger.info("Posting hashtags as first comment...");
    await publisher.postFirstComment(result.id, carousel.firstComment);

    await savePostedTopic(planned.topic, planned.category, result.id);
    logger.info("Carousel published", {
      instagramId: result.id,
      provider: result.provider,
    });
    return;
  }

  // reel_script
  logger.info("Writing 60-sec reel script...");
  const reel = await writeReelScript(
    planned.topic,
    planned.hook,
    planned.angle,
    planned.category,
    planned.hashtags
  );

  const outDir = path.join(process.cwd(), "output");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(
    outDir,
    `reel-${new Date().toISOString().slice(0, 10)}-slot-${slotIndex}.json`
  );

  await fs.writeFile(
    outPath,
    JSON.stringify(
      {
        topic: planned.topic,
        category: planned.category,
        script: reel.script,
        caption: reel.caption,
        firstComment: reel.firstComment,
      },
      null,
      2
    ),
    "utf-8"
  );

  // Stored as a draft because this module currently only generates the reel script.
  await savePostedTopic(planned.topic, planned.category, "draft");
  logger.info("Reel script generated and saved", { outPath });
}

run().catch((err) => {
  logger.error("Run failed", { message: String(err?.message ?? err) });
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

