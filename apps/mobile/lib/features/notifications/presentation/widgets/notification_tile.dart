import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/app_notification.dart';
import '../../domain/notification_grouping.dart';

class NotificationTile extends StatelessWidget {
  const NotificationTile({
    required this.notification,
    required this.onTap,
    required this.onDelete,
    super.key,
  });

  final AppNotification notification;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final unread = !notification.isRead;
    final isNew = isNewNotification(notification.createdAt);
    return Material(
      color: unread
          ? AppColors.accentGreenSurface.withValues(alpha: 0.35)
          : AppColors.card,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundImage: notification.actorProfileImg == null
                    ? null
                    : NetworkImage(notification.actorProfileImg!),
                child: notification.actorProfileImg == null
                    ? Text(_initials(notification.actorName))
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            notification.actorName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ),
                        if (isNew && unread) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 1,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'Novo',
                              style: TextStyle(
                                color: AppColors.primaryForeground,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      notification.message,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.foreground.withValues(alpha: 0.85),
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ha ${notificationTimeAgo(notification.createdAt)}',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.mutedForeground,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Column(
                children: [
                  if (unread)
                    const Padding(
                      padding: EdgeInsets.only(top: 4, bottom: 4),
                      child: CircleAvatar(
                        radius: 4,
                        backgroundColor: AppColors.primary,
                      ),
                    ),
                  IconButton(
                    tooltip: 'Remover notificacao',
                    onPressed: onDelete,
                    icon: const Icon(
                      Icons.delete_outline,
                      size: 20,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    if (parts.isEmpty) {
      return '?';
    }
    final first = parts.first.substring(0, 1);
    final last = parts.length > 1 ? parts.last.substring(0, 1) : '';
    return (first + last).toUpperCase();
  }
}

/// Mirrors `apps/web`'s `shared/hooks/useGetTimeAgo.ts` `getTimeAgo`, used
/// by `NotificationItem` as `ha {getTimeAgo(...)}`.
String notificationTimeAgo(DateTime createdAt, {DateTime? now}) {
  final reference = now ?? DateTime.now();
  final diffInSeconds = reference.difference(createdAt).inSeconds;

  if (diffInSeconds < 60) {
    return 'agora';
  }
  final diffInMinutes = diffInSeconds ~/ 60;
  if (diffInMinutes < 60) {
    return '$diffInMinutes ${diffInMinutes == 1 ? 'minuto' : 'minutos'}';
  }
  final diffInHours = diffInMinutes ~/ 60;
  if (diffInHours < 24) {
    return '$diffInHours ${diffInHours == 1 ? 'hora' : 'horas'}';
  }
  final diffInDays = diffInHours ~/ 24;
  if (diffInDays < 7) {
    return '$diffInDays ${diffInDays == 1 ? 'dia' : 'dias'}';
  }
  final diffInWeeks = diffInDays ~/ 7;
  if (diffInWeeks < 4) {
    return '$diffInWeeks ${diffInWeeks == 1 ? 'semana' : 'semanas'}';
  }
  final diffInMonths = diffInDays ~/ 30;
  if (diffInMonths < 12) {
    return '$diffInMonths ${diffInMonths == 1 ? 'mes' : 'meses'}';
  }
  final diffInYears = diffInDays ~/ 365;
  return '$diffInYears ${diffInYears == 1 ? 'ano' : 'anos'}';
}
