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
