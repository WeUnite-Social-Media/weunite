import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/async_state_view.dart';
import '../../../feed/presentation/widgets/comments_sheet.dart';
import '../../../profile/presentation/navigation/open_user_profile.dart';
import '../../domain/entities/app_notification.dart';
import '../../domain/entities/notification_filter.dart';
import '../../domain/entities/notification_type.dart';
import '../../domain/notification_grouping.dart';
import '../cubit/notifications_cubit.dart';
import '../widgets/notification_tile.dart';

/// `/notifications`, pushed outside the bottom-nav shell. Its cubit is the
/// same session-scoped `NotificationsCubit` the bell in `AppShell` reads, so
/// the unread badge and the list always agree (see `lib/app/router.dart`).
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final cubit = context.read<NotificationsCubit>();
    if (!cubit.state.hasLoaded) {
      cubit.load();
    }
    _searchController.text = cubit.state.query;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notificacoes')),
      body: BlocConsumer<NotificationsCubit, NotificationsState>(
        listenWhen: (previous, current) =>
            previous.actionErrorMessage != current.actionErrorMessage &&
            current.actionErrorMessage != null,
        listener: (context, state) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<NotificationsCubit>().dismissActionError();
        },
        builder: (context, state) {
          return AsyncStateView(
            isLoading: state.isLoading,
            errorMessage: state.loadErrorMessage,
            onRetry: () => context.read<NotificationsCubit>().load(),
            child: RefreshIndicator(
              onRefresh: () => context.read<NotificationsCubit>().load(),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) => context
                          .read<NotificationsCubit>()
                          .queryChanged(value),
                      decoration: const InputDecoration(
                        hintText: 'Buscar notificacoes...',
                        prefixIcon: Icon(Icons.search),
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 40,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: NotificationFilter.values.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final filter = NotificationFilter.values[index];
                        return ChoiceChip(
                          label: Text(filter.label),
                          selected: state.filter == filter,
                          onSelected: (_) => context
                              .read<NotificationsCubit>()
                              .filterChanged(filter),
                        );
                      },
                    ),
                  ),
                  if (state.hasUnread)
                    Align(
                      alignment: Alignment.centerRight,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                        child: TextButton.icon(
                          onPressed: () => context
                              .read<NotificationsCubit>()
                              .markAllAsRead(),
                          icon: const Icon(Icons.done_all, size: 18),
                          label: const Text('Marcar todas como lidas'),
                        ),
                      ),
                    ),
                  const SizedBox(height: 8),
                  Expanded(child: _buildList(context, state)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildList(BuildContext context, NotificationsState state) {
    final visible = state.visibleNotifications;
    if (visible.isEmpty) {
      return _EmptyView(
        message: state.notifications.isEmpty
            ? 'Nenhuma notificacao ainda'
            : 'Nenhuma notificacao encontrada',
        showClearFilters: state.hasActiveFilterOrQuery,
        onClearFilters: () {
          _searchController.clear();
          context.read<NotificationsCubit>().clearFilters();
        },
      );
    }

    final grouped = groupNotificationsByPeriod(visible);
    return ListView(
      children: [
        for (final period in NotificationPeriod.values)
          if (grouped[period]!.isNotEmpty)
            _PeriodSection(
              period: period,
              notifications: grouped[period]!,
              onTap: (notification) => _onTap(context, notification),
              onDelete: (notification) =>
                  context.read<NotificationsCubit>().delete(notification.id),
            ),
      ],
    );
  }

  void _onTap(BuildContext context, AppNotification notification) {
    final cubit = context.read<NotificationsCubit>();
    if (!notification.isRead) {
      cubit.markAsRead(notification.id);
    }

    switch (notification.type) {
      case NotificationType.newFollower:
        openUserProfile(context, notification.actorId);
      case NotificationType.newMessage:
        context.go('/chat');
      case NotificationType.opportunitySubscription:
        context.go('/opportunities');
      case NotificationType.postLike:
      case NotificationType.postComment:
      case NotificationType.commentLike:
      case NotificationType.commentReply:
      case NotificationType.postRepost:
        _openPostComments(context, notification.relatedEntityId);
      case NotificationType.unknown:
        context.go('/feed');
    }
  }

  /// The mobile app has no post-detail route yet (`/posts/:postId` is a
  /// placeholder, see `lib/app/router.dart`), unlike the web app, which opens
  /// a Comments modal in place. As an adaptation, we navigate to the Home
  /// tab and reopen the equivalent comments sheet there a frame later (the
  /// current context, on the pushed `/notifications` route, is about to be
  /// unmounted by the `go` call). If the sheet can't be shown for any
  /// reason, staying on `/feed` is still the documented fallback.
  void _openPostComments(BuildContext context, int postId) {
    final router = GoRouter.of(context);
    router.go('/feed');
    SchedulerBinding.instance.addPostFrameCallback((_) {
      final homeContext = router.routerDelegate.navigatorKey.currentContext;
      if (homeContext == null) {
        return;
      }
      try {
        showCommentsSheet(homeContext, postId: postId);
      } on Object {
        // Fallback already satisfied: we're on /feed.
      }
    });
  }
}

class _PeriodSection extends StatelessWidget {
  const _PeriodSection({
    required this.period,
    required this.notifications,
    required this.onTap,
    required this.onDelete,
  });

  final NotificationPeriod period;
  final List<AppNotification> notifications;
  final ValueChanged<AppNotification> onTap;
  final ValueChanged<AppNotification> onDelete;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text(
            period.label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: AppColors.mutedForeground,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                ),
          ),
        ),
        for (final notification in notifications)
          NotificationTile(
            notification: notification,
            onTap: () => onTap(notification),
            onDelete: () => onDelete(notification),
          ),
      ],
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView({
    required this.message,
    required this.showClearFilters,
    required this.onClearFilters,
  });

  final String message;
  final bool showClearFilters;
  final VoidCallback onClearFilters;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.notifications_none,
              size: 48,
              color: AppColors.mutedForeground,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.mutedForeground),
            ),
            if (showClearFilters) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onClearFilters,
                child: const Text('Limpar filtros'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
