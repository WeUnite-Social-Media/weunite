import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/feed/domain/post_media.dart';

/// The rules a post's media has to follow, kept against their two sources:
/// `apps/web/src/features/feed/schemas/post/createPost.schema.ts` for the
/// accepted formats, and `spring.servlet.multipart.max-file-size` for the size
/// that is actually enforced.
void main() {
  group('isPostVideoUrl', () {
    test('recognises a Cloudinary video delivery URL', () {
      expect(
        isPostVideoUrl(
          'https://res.cloudinary.com/demo/video/upload/v1/posts/7/clip',
        ),
        isTrue,
      );
    });

    test('recognises the formats the web accepts, by extension', () {
      for (final url in [
        'https://res.cloudinary.com/demo/posts/7/clip.mp4',
        'https://res.cloudinary.com/demo/posts/7/clip.webm',
        'https://res.cloudinary.com/demo/posts/7/clip.MOV',
      ]) {
        expect(isPostVideoUrl(url), isTrue, reason: url);
      }
    });

    test('ignores a query string when reading the extension', () {
      expect(
        isPostVideoUrl('https://res.cloudinary.com/demo/clip.mp4?v=2'),
        isTrue,
      );
    });

    test('an image stays an image', () {
      for (final url in [
        'https://res.cloudinary.com/demo/image/upload/v1/posts/7/photo.jpg',
        'https://res.cloudinary.com/demo/posts/7/photo.png',
        'https://res.cloudinary.com/demo/posts/7/photo',
      ]) {
        expect(isPostVideoUrl(url), isFalse, reason: url);
      }
    });
  });

  group('isPostVideoPath', () {
    test('tells a picked video from a picked image', () {
      expect(isPostVideoPath('/storage/emulated/0/DCIM/VID_0001.mp4'), isTrue);
      expect(isPostVideoPath(r'C:\Users\x\Videos\clip.MOV'), isTrue);
      expect(isPostVideoPath('/storage/emulated/0/DCIM/IMG_0001.jpg'), isFalse);
    });
  });

  group('validatePostMedia', () {
    test('accepts an image within 5 MB', () {
      expect(
        validatePostMedia(path: 'photo.jpg', sizeInBytes: 4 * 1024 * 1024),
        isNull,
      );
    });

    test('rejects an image over 5 MB, the web schema limit', () {
      expect(
        validatePostMedia(path: 'photo.jpg', sizeInBytes: 6 * 1024 * 1024),
        kPostMediaTooLargeMessage,
      );
    });

    test('accepts a video within 10 MB', () {
      expect(
        validatePostMedia(path: 'clip.mp4', sizeInBytes: 9 * 1024 * 1024),
        isNull,
      );
    });

    test('rejects a video over 10 MB, which the API would refuse', () {
      // The web schema used to allow 50 MB here; Spring caps the request at
      // 10 MB, so that upload could never land.
      expect(
        validatePostMedia(path: 'clip.mp4', sizeInBytes: 20 * 1024 * 1024),
        kPostMediaTooLargeMessage,
      );
    });

    test('rejects a format outside the web list', () {
      for (final path in ['doc.pdf', 'song.mp3', 'clip.avi', 'clip.mkv']) {
        expect(
          validatePostMedia(path: path, sizeInBytes: 1024),
          kPostMediaUnsupportedMessage,
          reason: path,
        );
      }
    });

    test('accepts every image format the web lists', () {
      for (final path in ['a.jpg', 'a.jpeg', 'a.png', 'a.webp', 'a.gif']) {
        expect(
          validatePostMedia(path: path, sizeInBytes: 1024),
          isNull,
          reason: path,
        );
      }
    });
  });
}
