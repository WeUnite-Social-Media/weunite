import 'package:dio/dio.dart';

/// Media type for an image part, from the file extension. Cloudinary rejects
/// uploads sent as `application/octet-stream`, so every image part must be
/// typed (posts and chat attachments both use this).
DioMediaType imageMediaTypeFor(String filename) {
  final extension =
      filename.contains('.') ? filename.split('.').last.toLowerCase() : '';
  return switch (extension) {
    'png' => DioMediaType('image', 'png'),
    'gif' => DioMediaType('image', 'gif'),
    'webp' => DioMediaType('image', 'webp'),
    'heic' || 'heif' => DioMediaType('image', 'heic'),
    _ => DioMediaType('image', 'jpeg'),
  };
}

/// Media type for a chat audio attachment, from its file extension. The
/// `record` package defaults to `.m4a` (AAC in an MP4 container) on both
/// Android and iOS, which this maps to `audio/mp4`; other extensions are
/// mapped for completeness in case a future recorder configuration changes
/// the output format. Same reasoning as [imageMediaTypeFor]: the multipart
/// part must carry a real media type for Cloudinary's `auto` upload to
/// recognize it, not `application/octet-stream`.
DioMediaType audioMediaTypeFor(String filename) {
  final extension =
      filename.contains('.') ? filename.split('.').last.toLowerCase() : '';
  return switch (extension) {
    'mp3' => DioMediaType('audio', 'mpeg'),
    'wav' => DioMediaType('audio', 'wav'),
    'ogg' => DioMediaType('audio', 'ogg'),
    'webm' => DioMediaType('audio', 'webm'),
    _ => DioMediaType('audio', 'mp4'),
  };
}

/// Media type for a post's video part, from the file extension. Same reason as
/// [imageMediaTypeFor]: the part must carry a real media type or Cloudinary's
/// `auto` upload sees `application/octet-stream`. The formats are the ones the
/// web's post schema accepts (mp4, webm, quicktime).
DioMediaType videoMediaTypeFor(String filename) {
  final extension =
      filename.contains('.') ? filename.split('.').last.toLowerCase() : '';
  return switch (extension) {
    'webm' => DioMediaType('video', 'webm'),
    'mov' => DioMediaType('video', 'quicktime'),
    _ => DioMediaType('video', 'mp4'),
  };
}

/// Media type for whatever a post carries. A post's file part is named
/// `image` on the API (`PostController`), but it may hold a video, so the
/// type comes from the extension rather than from the part name.
DioMediaType postMediaTypeFor(String filename) {
  final extension =
      filename.contains('.') ? filename.split('.').last.toLowerCase() : '';
  const videoExtensions = {'mp4', 'webm', 'mov'};
  return videoExtensions.contains(extension)
      ? videoMediaTypeFor(filename)
      : imageMediaTypeFor(filename);
}
