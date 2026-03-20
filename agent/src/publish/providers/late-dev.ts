import type { IPublishProvider, PublishResult } from "./types";

// Per docs.getlate.dev, API base is Zernio.
const LATE_API = "https://zernio.com/api/v1";

type LateCreatePostResponse = {
  post?: {
    _id?: string;
    id?: string;
    platformPostUrl?: string;
  };
  id?: string;
  post_id?: string;
};

export class LateDevProvider implements IPublishProvider {
  name = "Late.dev";

  private apiKey: string;
  private instagramAccountId: string;

  constructor() {
    this.apiKey = process.env.LATE_API_KEY!;
    // Late/Zernio requires a connected account ID for platforms[].
    this.instagramAccountId =
      process.env.LATE_INSTAGRAM_ACCOUNT_ID ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
      "";

    if (!this.apiKey) {
      throw new Error("Late.dev requires LATE_API_KEY env var");
    }
    if (!this.instagramAccountId) {
      throw new Error(
        "Late.dev requires LATE_INSTAGRAM_ACCOUNT_ID (or INSTAGRAM_BUSINESS_ACCOUNT_ID fallback)"
      );
    }
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private extractPostId(data: LateCreatePostResponse): string {
    return data?.post?._id || data?.post?.id || data?.id || data?.post_id || "";
  }

  private async createAndPublishPost(payload: Record<string, unknown>): Promise<PublishResult> {
    const res = await fetch(`${LATE_API}/posts`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(async () => ({ error: await res.text() }));
      throw new Error(`Late.dev publish failed: ${JSON.stringify(error)}`);
    }

    const data = (await res.json()) as LateCreatePostResponse;
    return {
      id: this.extractPostId(data),
      success: true,
      provider: this.name,
    };
  }

  async publishCarousel(imageUrls: string[], caption: string): Promise<PublishResult> {
    return this.createAndPublishPost({
      content: caption,
      publishNow: true,
      mediaItems: imageUrls.map((url) => ({ url, type: "image" })),
      platforms: [
        {
          platform: "instagram",
          accountId: this.instagramAccountId,
        },
      ],
    });
  }

  async postFirstComment(postId: string, comment: string): Promise<void> {
    try {
      // Late docs show a comments API namespace; shape may vary by account.
      const res = await fetch(`${LATE_API}/comments`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          postId,
          content: comment,
        }),
      });

      if (!res.ok) {
        // If separate first-comment is unsupported for this integration, continue safely.
        // eslint-disable-next-line no-console
        console.warn(
          "Late.dev: first comment endpoint unavailable; include hashtags in caption if needed."
        );
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn("Late.dev: could not post first comment; continuing.");
    }
  }

  async publishSingleImage(imageUrl: string, caption: string): Promise<PublishResult> {
    return this.createAndPublishPost({
      content: caption,
      publishNow: true,
      mediaItems: [{ url: imageUrl, type: "image" }],
      platforms: [
        {
          platform: "instagram",
          accountId: this.instagramAccountId,
        },
      ],
    });
  }

  async publishReel(videoUrl: string, caption: string): Promise<PublishResult> {
    return this.createAndPublishPost({
      content: caption,
      publishNow: true,
      mediaItems: [{ url: videoUrl, type: "video" }],
      platforms: [
        {
          platform: "instagram",
          accountId: this.instagramAccountId,
        },
      ],
    });
  }
}

