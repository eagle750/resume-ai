import type { IPublishProvider, PublishResult } from "./types";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export class MetaGraphProvider implements IPublishProvider {
  name = "Meta Graph API";

  private accountId: string;
  private accessToken: string;

  constructor() {
    this.accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN!;

    if (!this.accountId || !this.accessToken) {
      throw new Error(
        "Meta Graph API requires INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN env vars"
      );
    }
  }

  async publishCarousel(imageUrls: string[], caption: string): Promise<PublishResult> {
    const containerIds: string[] = [];

    for (const url of imageUrls) {
      const res = await fetch(`${GRAPH_API}/${this.accountId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: this.accessToken,
        }),
      });
      const data = await res.json();

      if (data.id) {
        containerIds.push(data.id);
      } else {
        throw new Error(`Failed to create media container: ${JSON.stringify(data)}`);
      }
    }

    const carouselRes = await fetch(`${GRAPH_API}/${this.accountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: containerIds.join(","),
        caption,
        access_token: this.accessToken,
      }),
    });
    const carouselData = await carouselRes.json();

    if (!carouselData.id) {
      throw new Error(`Failed to create carousel: ${JSON.stringify(carouselData)}`);
    }

    await this.waitForMediaReady(carouselData.id);

    const publishRes = await fetch(`${GRAPH_API}/${this.accountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: this.accessToken,
      }),
    });
    const publishData = await publishRes.json();

    return {
      id: publishData.id || "",
      success: !!publishData.id,
      provider: this.name,
    };
  }

  async postFirstComment(postId: string, comment: string): Promise<void> {
    await fetch(`${GRAPH_API}/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: comment,
        access_token: this.accessToken,
      }),
    });
  }

  async publishSingleImage(imageUrl: string, caption: string): Promise<PublishResult> {
    const containerRes = await fetch(`${GRAPH_API}/${this.accountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: this.accessToken,
      }),
    });
    const containerData = await containerRes.json();

    if (!containerData.id) {
      throw new Error(`Failed to create container: ${JSON.stringify(containerData)}`);
    }

    await this.waitForMediaReady(containerData.id);

    const publishRes = await fetch(`${GRAPH_API}/${this.accountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: this.accessToken,
      }),
    });
    const publishData = await publishRes.json();

    return {
      id: publishData.id || "",
      success: !!publishData.id,
      provider: this.name,
    };
  }

  async publishReel(videoUrl: string, caption: string): Promise<PublishResult> {
    const containerRes = await fetch(`${GRAPH_API}/${this.accountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption,
        access_token: this.accessToken,
      }),
    });
    const containerData = await containerRes.json();

    if (!containerData.id) {
      throw new Error(`Failed to create reel container: ${JSON.stringify(containerData)}`);
    }

    await this.waitForMediaReady(containerData.id, 60);

    const publishRes = await fetch(`${GRAPH_API}/${this.accountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: this.accessToken,
      }),
    });
    const publishData = await publishRes.json();

    return {
      id: publishData.id || "",
      success: !!publishData.id,
      provider: this.name,
    };
  }

  private async waitForMediaReady(containerId: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(
        `${GRAPH_API}/${containerId}?fields=status_code&access_token=${this.accessToken}`
      );
      const data = await res.json();

      if (data.status_code === "FINISHED") return;
      if (data.status_code === "ERROR") {
        throw new Error(`Media processing failed: ${JSON.stringify(data)}`);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error("Media processing timed out");
  }
}

