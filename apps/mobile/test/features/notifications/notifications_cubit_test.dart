import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/notifications/domain/entities/app_notification.dart';
import 'package:weunite_mobile/features/notifications/domain/entities/notification_filter.dart';
import 'package:weunite_mobile/features/notifications/domain/entities/notification_type.dart';
import 'package:weunite_mobile/features/notifications/domain/repositories/notification_repository.dart';
import 'package:weunite_mobile/features/notifications/presentation/cubit/notifications_cubit.dart';

AppNotification _notification({
  int id = 1,
  NotificationType type = NotificationType.postLike,
  String actorName = 'Bob',
  String message = 'Bob curtiu seu post',
  bool isRead = false,
  DateTime? createdAt,
  int relatedEntityId = 10,
}) {
  return AppNotification(
    id: id,
    userId: 1,
    type: type,
    actorId: 2,
    actorName: actorName,
    actorUsername: 'bob',
    relatedEntityId: relatedEntityId,
    message: message,
    isRead: isRead,
    createdAt: createdAt ?? DateTime.utc(2026, 9, 26, 10),
  );
}

class _FakeNotificationRepository implements NotificationRepository {
  List<AppNotification> notifications = [];
  int unreadCount = 0;
  final markAsReadCalls = <int>[];
  final deleteCalls = <int>[];
  var markAllCalls = 0;

  Object? markAsReadError;
  Object? markAllError;
  Object? deleteError;
  Object? loadError;

  final _controller = StreamController<AppNotification>.broadcast();

  @override
  Future<List<AppNotification>> getNotifications() async {
    if (loadError != null) throw loadError!;
    return notifications;
  }

  @override
  Future<int> getUnreadCount() async {
    if (loadError != null) throw loadError!;
    return unreadCount;
  }

  @override
  Future<void> markAsRead(int notificationId) async {
    markAsReadCalls.add(notificationId);
    if (markAsReadError != null) throw markAsReadError!;
  }

  @override
  Future<void> markAllAsRead() async {
    markAllCalls++;
    if (markAllError != null) throw markAllError!;
  }

  @override
  Future<void> delete(int notificationId) async {
    deleteCalls.add(notificationId);
    if (deleteError != null) throw deleteError!;
  }

  @override
  Stream<AppNotification> watchNewNotifications() => _controller.stream;

  void pushRealtime(AppNotification notification) {
    _controller.add(notification);
  }

  void dispose() => _controller.close();
}

void main() {
  late _FakeNotificationRepository repository;

  setUp(() => repository = _FakeNotificationRepository());
  tearDown(() => repository.dispose());

  group('NotificationsCubit.load', () {
    test('loads the list and the unread count together', () async {
      repository.notifications = [_notification(id: 1), _notification(id: 2)];
      repository.unreadCount = 2;
      final cubit = NotificationsCubit(repository);

      await cubit.load();

      expect(cubit.state.notifications, hasLength(2));
      expect(cubit.state.unreadCount, 2);
      expect(cubit.state.isLoading, isFalse);
      expect(cubit.state.hasLoaded, isTrue);
      expect(cubit.state.loadErrorMessage, isNull);

      await cubit.close();
    });

    test('reports the failure message when there is no data yet', () async {
      repository.loadError = const AppException('Falha ao carregar');
      final cubit = NotificationsCubit(repository);

      await cubit.load();

      expect(cubit.state.notifications, isEmpty);
      expect(cubit.state.loadErrorMessage, 'Falha ao carregar');

      await cubit.close();
    });
  });

  group('NotificationsCubit.markAsRead', () {
    test('marks it read and decrements the unread counter', () async {
      repository.notifications = [_notification(id: 1, isRead: false)];
      repository.unreadCount = 1;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.markAsRead(1);

      expect(cubit.state.notifications.single.isRead, isTrue);
      expect(cubit.state.unreadCount, 0);
      expect(repository.markAsReadCalls, [1]);

      await cubit.close();
    });

    test('reverts and reports actionErrorMessage on failure', () async {
      repository.notifications = [_notification(id: 1, isRead: false)];
      repository.unreadCount = 1;
      repository.markAsReadError = const AppException('Erro ao marcar');
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.markAsRead(1);

      expect(cubit.state.notifications.single.isRead, isFalse);
      expect(cubit.state.unreadCount, 1);
      expect(cubit.state.actionErrorMessage, 'Erro ao marcar');

      await cubit.close();
    });
  });

  group('NotificationsCubit.markAllAsRead', () {
    test('marks every notification read and zeroes the counter', () async {
      repository.notifications = [
        _notification(id: 1, isRead: false),
        _notification(id: 2, isRead: false),
      ];
      repository.unreadCount = 2;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.markAllAsRead();

      expect(cubit.state.notifications.every((n) => n.isRead), isTrue);
      expect(cubit.state.unreadCount, 0);
      expect(repository.markAllCalls, 1);

      await cubit.close();
    });

    test('reverts on failure', () async {
      repository.notifications = [_notification(id: 1, isRead: false)];
      repository.unreadCount = 1;
      repository.markAllError = const AppException('Erro ao marcar todas');
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.markAllAsRead();

      expect(cubit.state.notifications.single.isRead, isFalse);
      expect(cubit.state.unreadCount, 1);
      expect(cubit.state.actionErrorMessage, 'Erro ao marcar todas');

      await cubit.close();
    });
  });

  group('NotificationsCubit.delete', () {
    test('removes an unread notification and decrements the counter', () async {
      repository.notifications = [_notification(id: 1, isRead: false)];
      repository.unreadCount = 1;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.delete(1);

      expect(cubit.state.notifications, isEmpty);
      expect(cubit.state.unreadCount, 0);
      expect(repository.deleteCalls, [1]);

      await cubit.close();
    });

    test('removing a read notification does not touch the counter', () async {
      repository.notifications = [_notification(id: 1, isRead: true)];
      repository.unreadCount = 0;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.delete(1);

      expect(cubit.state.notifications, isEmpty);
      expect(cubit.state.unreadCount, 0);

      await cubit.close();
    });

    test('reverts on failure', () async {
      final notification = _notification(id: 1, isRead: false);
      repository.notifications = [notification];
      repository.unreadCount = 1;
      repository.deleteError = const AppException('Erro ao remover');
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      await cubit.delete(1);

      expect(cubit.state.notifications, [notification]);
      expect(cubit.state.unreadCount, 1);
      expect(cubit.state.actionErrorMessage, 'Erro ao remover');

      await cubit.close();
    });
  });

  group('NotificationsCubit filter/search', () {
    test('filterChanged keeps only notifications of the matching category',
        () async {
      repository.notifications = [
        _notification(id: 1, type: NotificationType.postLike),
        _notification(id: 2, type: NotificationType.newFollower),
      ];
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      cubit.filterChanged(NotificationFilter.follows);

      expect(cubit.state.visibleNotifications.map((n) => n.id), [2]);

      await cubit.close();
    });

    test('queryChanged searches actorName and message case-insensitively',
        () async {
      repository.notifications = [
        _notification(id: 1, actorName: 'Alice', message: 'oi'),
        _notification(id: 2, actorName: 'Bob', message: 'curtiu seu POST'),
      ];
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      cubit.queryChanged('post');

      expect(cubit.state.visibleNotifications.map((n) => n.id), [2]);

      cubit.queryChanged('alice');
      expect(cubit.state.visibleNotifications.map((n) => n.id), [1]);

      await cubit.close();
    });
  });

  group('NotificationsCubit realtime', () {
    test(
        'a new notification from the socket is inserted at the top and '
        'raises the unread counter', () async {
      repository.notifications = [_notification(id: 1)];
      repository.unreadCount = 1;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      repository.pushRealtime(_notification(id: 2, isRead: false));
      await Future<void>.delayed(Duration.zero);

      expect(cubit.state.notifications.map((n) => n.id), [2, 1]);
      expect(cubit.state.unreadCount, 2);

      await cubit.close();
    });

    test('ignores a duplicate id already in the list', () async {
      repository.notifications = [_notification(id: 1)];
      repository.unreadCount = 1;
      final cubit = NotificationsCubit(repository);
      await cubit.load();

      repository.pushRealtime(_notification(id: 1));
      await Future<void>.delayed(Duration.zero);

      expect(cubit.state.notifications, hasLength(1));
      expect(cubit.state.unreadCount, 1);

      await cubit.close();
    });
  });
}
