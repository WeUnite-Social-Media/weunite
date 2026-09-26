import 'entities/app_notification.dart';

/// Mirrors `apps/web`'s
/// `features/notifications/lib/notificationHelpers.ts`
/// (`groupNotificationsByPeriod`, `isNewNotification`). Grouping and the
/// "new" badge are computed on the client from `createdAt`, the same way the
/// web app does.
enum NotificationPeriod { today, yesterday, thisWeek, older }

extension NotificationPeriodX on NotificationPeriod {
  /// Exact labels used by the web app.
  String get label => switch (this) {
        NotificationPeriod.today => 'Hoje',
        NotificationPeriod.yesterday => 'Ontem',
        NotificationPeriod.thisWeek => 'Esta semana',
        NotificationPeriod.older => 'Antigas',
      };
}

/// Groups [notifications] by period, preserving their relative order inside
/// each group. [now] is injectable for tests.
Map<NotificationPeriod, List<AppNotification>> groupNotificationsByPeriod(
  List<AppNotification> notifications, {
  DateTime? now,
}) {
  final reference = now ?? DateTime.now();
  final groups = <NotificationPeriod, List<AppNotification>>{
    for (final period in NotificationPeriod.values) period: [],
  };
  for (final notification in notifications) {
    groups[_periodOf(notification.createdAt.toLocal(), reference)]!
        .add(notification);
  }
  return groups;
}

NotificationPeriod _periodOf(DateTime createdAt, DateTime now) {
  if (_isSameDay(createdAt, now)) {
    return NotificationPeriod.today;
  }
  final yesterday = _startOfDay(now).subtract(const Duration(days: 1));
  if (_isSameDay(createdAt, yesterday)) {
    return NotificationPeriod.yesterday;
  }
  final startOfWeek = _startOfWeek(now);
  if (!createdAt.isBefore(startOfWeek) &&
      createdAt.isBefore(_startOfDay(now))) {
    return NotificationPeriod.thisWeek;
  }
  return NotificationPeriod.older;
}

bool _isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}

DateTime _startOfDay(DateTime date) =>
    DateTime(date.year, date.month, date.day);

/// Start of the week containing [date], Sunday-based (date-fns' default
/// `weekStartsOn: 0`, used by the web app's `isThisWeek`).
DateTime _startOfWeek(DateTime date) {
  final startOfDay = _startOfDay(date);
  return startOfDay.subtract(Duration(days: startOfDay.weekday % 7));
}

/// A notification younger than 5 minutes shows the "Novo" badge.
bool isNewNotification(DateTime createdAt, {DateTime? now}) {
  final reference = now ?? DateTime.now();
  return reference.difference(createdAt).inMilliseconds < 5 * 60 * 1000;
}
