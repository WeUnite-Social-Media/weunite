import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/chat/data/chat_models.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';

void main() {
  group('ChatMessageDto.fromJson', () {
    test('parses a real MessageDTO payload without readAt/editedAt', () {
      final dto = ChatMessageDto.fromJson({
        'id': 55,
        'conversationId': 30,
        'senderId': 9,
        'content': 'Oi!',
        'isRead': true,
        'createdAt': '2026-09-15T12:10:00.123456Z',
        'type': 'TEXT',
        'deleted': false,
        'edited': false,
      });

      expect(dto.read, isTrue);
      expect(
        dto.createdAt,
        DateTime.utc(2026, 9, 15, 12, 10, 0, 123, 456),
      );
      expect(dto.readAt, isNull);
      expect(dto.editedAt, isNull);
      expect(dto.type, ChatMessageType.text);
    });

    test(
        'createdAt with 9 fractional digits does not fall back to '
        'DateTime.now()', () {
      final dto = ChatMessageDto.fromJson({
        'id': 55,
        'conversationId': 30,
        'senderId': 9,
        'content': 'Oi!',
        'createdAt': '2026-09-15T12:10:00.123456789Z',
      });

      expect(dto.createdAt, DateTime.utc(2026, 9, 15, 12, 10, 0, 123, 456));
    });
  });

  group('SendMessageRequestDto', () {
    test('roundtrips content with quotes, backslashes and newlines', () {
      const content = 'diz "oi" \\ fim\nlinha 2';
      const dto = SendMessageRequestDto(
        conversationId: 30,
        senderId: 9,
        content: content,
      );

      final decoded = jsonDecode(jsonEncode(dto.toJson())) as Map;

      expect(decoded['content'], content);
      expect(decoded['type'], 'TEXT');
      expect(decoded['conversationId'], isA<int>());
      expect(decoded['senderId'], isA<int>());
    });
  });

  group('parseChatRealtimeEvent', () {
    Map<String, Object?> baseMessage({bool edited = false}) => {
          'id': 55,
          'conversationId': 30,
          'senderId': 9,
          'content': 'Oi!',
          'isRead': false,
          'createdAt': '2026-09-15T12:10:00Z',
          'type': 'TEXT',
          'deleted': false,
          'edited': edited,
        };

    test('a non-edited message DTO becomes ChatMessageReceived', () {
      final event = parseChatRealtimeEvent(jsonEncode(baseMessage()));

      expect(event, isA<ChatMessageReceived>());
    });

    test('an edited message DTO becomes ChatMessageEdited', () {
      final event =
          parseChatRealtimeEvent(jsonEncode(baseMessage(edited: true)));

      expect(event, isA<ChatMessageEdited>());
    });

    test('a DELETE payload becomes ChatMessageDeleted', () {
      final event = parseChatRealtimeEvent(
        jsonEncode({
          'type': 'DELETE',
          'messageId': 55,
          'forEveryone': true,
          'userId': 9,
        }),
      );

      expect(event, isA<ChatMessageDeleted>());
      expect((event as ChatMessageDeleted).messageId, 55);
    });

    test('malformed or unknown bodies return null', () {
      expect(parseChatRealtimeEvent('not json'), isNull);
      expect(parseChatRealtimeEvent('42'), isNull);
      expect(parseChatRealtimeEvent(jsonEncode({'foo': 1})), isNull);
    });
  });
}
