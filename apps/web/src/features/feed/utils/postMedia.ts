/**
 * A post's media lives in one field (`imageUrl`), because the API uploads it
 * with Cloudinary's `resource_type: auto` and stores whatever comes back. The
 * composer already accepts `image/*, video/*`, so that field can hold a video
 * and the renderer has to tell them apart.
 *
 * Two signals, same as the mobile app: `/video/upload/` in the delivery URL,
 * which Cloudinary uses for anything it classified as a video, and the file
 * extension for URLs that keep one.
 */
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];

export function isPostVideoUrl(url: string): boolean {
  if (url.includes("/video/upload/")) {
    return true;
  }
  const withoutQuery = url.split("?")[0];
  const lastSegment = withoutQuery.split("/").pop() ?? "";
  if (!lastSegment.includes(".")) {
    return false;
  }
  const extension = lastSegment.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(extension);
}
