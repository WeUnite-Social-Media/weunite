import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/chat/domain/message_media.dart';

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
}
