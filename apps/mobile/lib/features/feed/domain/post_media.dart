/// What a post may carry as media, and how to tell an image from a video.
///
/// The limits and the accepted formats are the web's, from
/// `apps/web/src/features/feed/schemas/post/createPost.schema.ts`: images up
/// to 5 MB, videos up to 50 MB, and only the formats listed there. The web's
/// picker declares `accept="image/*, video/*"` (`CreatePost.tsx`), so the
/// phone offers the same choice.
library;

/// `file.size <= 5 * 1024 * 1024` in the web schema.
const int kMaxPostImageBytes = 5 * 1024 * 1024;

/// The web schema says 50 MB for a video, but that limit never holds: the API
/// caps every multipart request at 10 MB
/// (`spring.servlet.multipart.max-file-size` and `.max-request-size` in
/// `application.properties`), so a 20 MB video passes the browser's check and
/// then dies at the server. The phone enforces the limit that actually
/// decides, so the person is told before waiting through an upload that cannot
/// succeed.
const int kMaxPostVideoBytes = 10 * 1024 * 1024;

/// The web's `allowedTypes`, as extensions. `quicktime` is `.mov`.
const Set<String> kPostImageExtensions = {'jpg', 'jpeg', 'png', 'webp', 'gif'};
const Set<String> kPostVideoExtensions = {'mp4', 'webm', 'mov'};

String _extensionOf(String pathOrUrl) {
  // A Cloudinary URL can carry a query string; the extension is before it.
  final withoutQuery = pathOrUrl.split('?').first;
  final lastSegment = withoutQuery.split(RegExp(r'[\\/]')).last;
  if (!lastSegment.contains('.')) {
    return '';
  }
  return lastSegment.split('.').last.toLowerCase();
}

/// True when this local file is one of the video formats the web accepts.
bool isPostVideoPath(String path) =>
    kPostVideoExtensions.contains(_extensionOf(path));

/// True when a post's stored media is a video.
///
/// Two signals, because Cloudinary does not always keep the extension: the
/// file extension, and `/video/upload/` in the delivery URL, which Cloudinary
/// uses for everything it classified as a video resource (`resource_type:
/// auto` in `CloudinaryService.uploadPost`).
bool isPostVideoUrl(String url) {
  if (url.contains('/video/upload/')) {
    return true;
  }
  return kPostVideoExtensions.contains(_extensionOf(url));
}

/// Same shape as the web's message, with the numbers that are actually
/// enforced (the web says 50MB for video, which the API refuses).
const String kPostMediaTooLargeMessage = 'Imagens: max 5MB, Videos: max 10MB';

/// The web's message for an unsupported format.
const String kPostMediaUnsupportedMessage =
    'Formato invalido. Use imagens ou videos suportados';

/// Validates a picked file against the web's two rules, returning the message
/// to show or `null` when it passes.
String? validatePostMedia({required String path, required int sizeInBytes}) {
  final extension = _extensionOf(path);
  final isImage = kPostImageExtensions.contains(extension);
  final isVideo = kPostVideoExtensions.contains(extension);

  if (!isImage && !isVideo) {
    return kPostMediaUnsupportedMessage;
  }
  final limit = isVideo ? kMaxPostVideoBytes : kMaxPostImageBytes;
  if (sizeInBytes > limit) {
    return kPostMediaTooLargeMessage;
  }
  return null;
}
