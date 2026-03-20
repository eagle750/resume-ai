export interface PublishResult {
  id: string;
  success: boolean;
  provider: string;
}

export interface IPublishProvider {
  name: string;

  /**
   * Publish a carousel post with multiple images.
   * @param imageUrls - Array of publicly accessible image URLs (hosted on R2)
   * @param caption - The post caption text
   * @returns Post ID and success status
   */
  publishCarousel(imageUrls: string[], caption: string): Promise<PublishResult>;

  /**
   * Add a first comment to an existing post (used for hashtags).
   * @param postId - The ID of the published post
   * @param comment - The comment text (hashtags)
   */
  postFirstComment(postId: string, comment: string): Promise<void>;

  /**
   * Publish a single image post.
   * @param imageUrl - Publicly accessible image URL
   * @param caption - The post caption text
   */
  publishSingleImage(imageUrl: string, caption: string): Promise<PublishResult>;

  /**
   * Publish a reel/video post.
   * @param videoUrl - Publicly accessible video URL
   * @param caption - The post caption text
   */
  publishReel(videoUrl: string, caption: string): Promise<PublishResult>;
}

