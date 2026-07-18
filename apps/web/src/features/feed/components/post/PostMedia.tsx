import { cn } from "@/shared/lib/utils";

type PostMediaType = "IMAGE" | "VIDEO" | null | undefined;

interface PostMediaProps {
  mediaUrl: string | null;
  mediaType?: PostMediaType;
  className?: string;
}

export default function PostMedia({
  mediaUrl,
  mediaType,
  className,
}: PostMediaProps) {
  if (!mediaUrl) return null;

  const resolvedMediaType = resolveMediaType(mediaUrl, mediaType);

  if (resolvedMediaType === "VIDEO") {
    return (
      <video
        src={mediaUrl}
        controls
        playsInline
        preload="metadata"
        className={cn("mb-2 rounded-sm", className)}
      />
    );
  }

  return (
    <img
      src={mediaUrl}
      alt="Post media"
      className={cn("mb-2 rounded-sm", className)}
    />
  );
}

function resolveMediaType(mediaUrl: string, mediaType: PostMediaType) {
  if (mediaType) return mediaType;

  const normalizedUrl = mediaUrl.toLowerCase();

  if (
    normalizedUrl.includes("/video/upload/") ||
    normalizedUrl.endsWith(".mp4") ||
    normalizedUrl.endsWith(".webm") ||
    normalizedUrl.endsWith(".mov")
  ) {
    return "VIDEO";
  }

  return "IMAGE";
}
