import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/chat/domain/message_media.dart';

// Cloudinary renames what the phone records (AAC/m4a) to .mp4, since it stores
// audio as a video resource — the bubble must still treat it as audio.
const _cloudinaryFromPhone =
    'https://res.cloudinary.com/demo/video/upload/v1/chat/1/1/abc.mp4';
const _cloudinaryFromWeb =
    'https://res.cloudinary.com/demo/video/upload/v1/chat/1/2/abc.webm';

void main() {
  group('detectMessageMediaKind', () {
    for (final extension in ['mp3', 'wav', 'ogg', 'm4a', 'webm']) {
      test('recognizes .$extension as audio', () {
        expect(
          detectMessageMediaKind('https://cdn.weunite.com/chat/a.$extension'),
          MessageMediaKind.audio,
        );
      });

      test('recognizes .${extension.toUpperCase()} (uppercase) as audio', () {
        expect(
          detectMessageMediaKind(
            'https://cdn.weunite.com/chat/a.${extension.toUpperCase()}',
          ),
          MessageMediaKind.audio,
        );
      });
    }

    for (final extension in ['jpg', 'jpeg', 'png', 'gif', 'webp']) {
      test('recognizes .$extension as image', () {
        expect(
          detectMessageMediaKind('https://cdn.weunite.com/chat/a.$extension'),
          MessageMediaKind.image,
        );
      });

      test('recognizes .${extension.toUpperCase()} (uppercase) as image', () {
        expect(
          detectMessageMediaKind(
            'https://cdn.weunite.com/chat/a.${extension.toUpperCase()}',
          ),
          MessageMediaKind.image,
        );
      });
    }

    test('plain text is neither image nor audio', () {
      expect(detectMessageMediaKind('Oi, tudo bem?'), MessageMediaKind.text);
    });

    test('a URL with no recognized media extension is text', () {
      expect(
        detectMessageMediaKind('https://cdn.weunite.com/chat/report.pdf'),
        MessageMediaKind.text,
      );
    });

    test('an extension-like substring in the middle of the text is not media',
        () {
      expect(
        detectMessageMediaKind('confira o arquivo a.mp3 depois'),
        MessageMediaKind.text,
      );
    });
  });

  group('Cloudinary URLs seen in production', () {
    test('audio recorded on the phone comes back as .mp4 and still plays', () {
      expect(
        detectMessageMediaKind(_cloudinaryFromPhone),
        MessageMediaKind.audio,
      );
    });

    test('audio recorded on the web comes back as .webm', () {
      expect(
        detectMessageMediaKind(_cloudinaryFromWeb),
        MessageMediaKind.audio,
      );
    });

    test('an image upload is still an image', () {
      expect(
        detectMessageMediaKind(
          'https://res.cloudinary.com/demo/image/upload/v1/chat/1/1/a.jpg',
        ),
        MessageMediaKind.image,
      );
    });
  });
}
