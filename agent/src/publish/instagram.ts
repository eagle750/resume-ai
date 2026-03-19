const GRAPH_API = "https://graph.facebook.com/v19.0";

const IG_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;

async function waitForMediaReady(
  containerId: string,
  maxAttempts = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${encodeURIComponent(
        ACCESS_TOKEN
      )}`
    );
    const data = await res.json();

    if (data?.status_code === "FINISHED") return;
    if (data?.status_code === "ERROR") {
      throw new Error(
        `Media processing failed: ${JSON.stringify(data)}`
      );
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Media processing timed out");
}

export async function publishCarousel(
  imageUrls: string[],
  caption: string
): Promise<{ id: string; success: boolean }> {
  if (imageUrls.length === 0) {
    throw new Error("publishCarousel: no image urls provided");
  }

  // Step 1: Create individual media containers.
  const containerIds: string[] = [];

  for (const url of imageUrls) {
    const res = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: url,
        is_carousel_item: true,
        access_token: ACCESS_TOKEN,
      }),
    });

    const data = await res.json();
    if (data?.id) containerIds.push(data.id);
    else {
      throw new Error(
        `Failed to create carousel item: ${JSON.stringify(data)}`
      );
    }
  }

  // Step 2: Create carousel container.
  const carouselRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "CAROUSEL",
      children: containerIds.join(","),
      caption,
      access_token: ACCESS_TOKEN,
    }),
  });

  const carouselData = await carouselRes.json();
  if (!carouselData?.id) {
    throw new Error(
      `Failed to create carousel: ${JSON.stringify(carouselData)}`
    );
  }

  // Step 3: Wait for processing.
  await waitForMediaReady(carouselData.id);

  // Step 4: Publish.
  const publishRes = await fetch(
    `${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: ACCESS_TOKEN,
      }),
    }
  );

  const publishData = await publishRes.json();
  return {
    id: publishData?.id,
    success: !!publishData?.id,
  };
}

export async function postFirstComment(
  mediaId: string,
  comment: string
): Promise<void> {
  if (!comment.trim()) return;

  await fetch(`${GRAPH_API}/${mediaId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: comment,
      access_token: ACCESS_TOKEN,
    }),
  });
}

