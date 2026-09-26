import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/notifications/domain/entities/app_notification.dart';
import 'package:weunite_mobile/features/notifications/domain/entities/notification_type.dart';
import 'package:weunite_mobile/features/notifications/domain/notification_grouping.dart';

AppNotification _notification(int id, DateTime createdAt) {
  return AppNotification(
    id: id,
    userId: 1,
    type: NotificationType.postLike,
    actorId: 2,
    actorName: 'Bob',
    actorUsername: 'bob',
    relatedEntityId: 10,
    message: 'Bob curtiu seu post',
    isRead: false,
    createdAt: createdAt,
  );
}

void main() {
  group('groupNotificationsByPeriod', () {
    test('buckets today, yesterday, this week and older', () {
      final now = DateTime(2026, 9, 26, 15); // a Saturday
      final today = _notification(1, DateTime(2026, 9, 26, 9));
      final yesterday = _notification(2, DateTime(2026, 9, 25, 9));
      final thisWeek = _notification(3, DateTime(2026, 9, 22, 9)); // Tuesday
      final older = _notification(4, DateTime(2026, 8, 1, 9));

      final grouped = groupNotificationsByPeriod(
        [today, yesterday, thisWeek, older],
        now: now,
      );

      expect(grouped[NotificationPeriod.today], [today]);
      expect(grouped[NotificationPeriod.yesterday], [yesterday]);
      expect(grouped[NotificationPeriod.thisWeek], [thisWeek]);
      expect(grouped[NotificationPeriod.older], [older]);
    });

    test('labels match the web app exactly', () {
      expect(NotificationPeriod.today.label, 'Hoje');
      expect(NotificationPeriod.yesterday.label, 'Ontem');
      expect(NotificationPeriod.thisWeek.label, 'Esta semana');
      expect(NotificationPeriod.older.label, 'Antigas');
    });
  });

  group('isNewNotification', () {
    test('is true within 5 minutes and false after', () {
      final now = DateTime(2026, 9, 26, 12);
      expect(
        isNewNotification(
          now.subtract(const Duration(minutes: 4)),
          now: now,
        ),
        isTrue,
      );
      expect(
        isNewNotification(
          now.subtract(const Duration(minutes: 6)),
          now: now,
        ),
        isFalse,
      );
    });
  });
}
