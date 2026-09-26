import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/weunite_card.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../profile/presentation/navigation/open_user_profile.dart';
import '../../../reporting/domain/entities/report_entity_type.dart';
import '../../../reporting/presentation/widgets/report_sheet.dart';
import '../../domain/entities/post.dart';

/// Longest a post's text shows in the report sheet's "Denunciando: ..."
/// preview before it's truncated with "...", matching apps/web's
/// `Post.tsx` (`postText.substring(0, 50) + "..."`).
const _kReportTitleMaxLength = 50;

class PostCard extends StatelessWidget {
  const PostCard({
    required this.post,
    this.onLike,
    this.onComments,
    this.enableAuthorNavigation = true,
    super.key,
  });

  final Post post;
  final VoidCallback? onLike;
  final VoidCallback? onComments;

  /// Tapping the author's avatar or name opens their profile. Disable it
  /// where the list already belongs to that author's profile.
  final bool enableAuthorNavigation;

  @override
  Widget build(BuildContext context) {
    final canOpenAuthor = enableAuthorNavigation && post.authorId != null;
    // Display-only decision (whether the three-dot menu is shown), the same
    // exception `openUserProfile` already makes for navigation: the id is
    // never forwarded to a repository/API call from here. Acting on behalf
    // of the signed-in user still goes through `CurrentUserProvider`
    // (`ReportRepositoryImpl` resolves it for the actual report request).
    final currentUserId = context.watch<AuthCubit>().state.user?.id;
    final isOwner = post.authorId != null && post.authorId == currentUserId;
    return WeUniteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            onTap: canOpenAuthor
                ? () => openUserProfile(context, post.authorId)
                : null,
            leading: CircleAvatar(
              backgroundImage: post.authorAvatar == null
                  ? null
                  : NetworkImage(post.authorAvatar!),
              child: post.authorAvatar == null
                  ? Text(_initials(post.authorName))
                  : null,
            ),
            title: Text(post.authorName),
            subtitle: Text('@${post.authorUsername}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(DateFormat('dd/MM').format(post.createdAt)),
                // The web's three-dot menu shows "Editar"/"Excluir"/
                // "Compartilhar" to the post's owner and "Denunciar" to
                // everyone else. Mobile has no edit/delete-post flow yet, and
                // "Compartilhar" was deliberately left out of this step (the
                // web has no public post route either — its share button is
                // a no-op) — see PROGRESS.md. So the owner gets no menu at
                // all for now, and only non-owners see it, with the single
                // "Denunciar" action.
                if (!isOwner)
                  PopupMenuButton<_PostMenuAction>(
                    icon: const Icon(Icons.more_vert),
                    onSelected: (action) => _onMenuAction(context, action),
                    itemBuilder: (context) => const [
                      PopupMenuItem<_PostMenuAction>(
                        value: _PostMenuAction.report,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.flag_outlined,
                              color: AppColors.destructive,
                            ),
                            SizedBox(width: 8),
                            Text(
                              'Denunciar',
                              style: TextStyle(color: AppColors.destructive),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          if (post.content?.isNotEmpty ?? false) Text(post.content!),
          if (post.mediaUrl != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 420),
                child: Image.network(
                  post.mediaUrl!,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) {
                      return child;
                    }
                    return const SizedBox(
                      height: 220,
                      child: Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) => SizedBox(
                    height: 120,
                    child: Center(
                      child: Icon(
                        Icons.broken_image_outlined,
                        color: Theme.of(context).disabledColor,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton(
                onPressed: onLike,
                icon: Icon(
                  post.likedByViewer ? Icons.favorite : Icons.favorite_border,
                ),
                color: post.likedByViewer
                    ? Theme.of(context).colorScheme.error
                    : null,
              ),
              Text('${post.likesCount}'),
              const SizedBox(width: 16),
              IconButton(
                onPressed: onComments,
                icon: const Icon(Icons.mode_comment_outlined),
              ),
              Text('${post.commentsCount}'),
            ],
          ),
        ],
      ),
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }

  void _onMenuAction(BuildContext context, _PostMenuAction action) {
    switch (action) {
      case _PostMenuAction.report:
        showReportSheet(
          context,
          type: ReportEntityType.post,
          entityId: post.id,
          entityTitle: _reportTitle(post.content),
        );
    }
  }

  /// "Denunciando: ..." preview text — `null` when the post has no text
  /// (e.g. image-only), truncated at [_kReportTitleMaxLength] otherwise,
  /// mirroring apps/web's `Post.tsx`.
  String? _reportTitle(String? content) {
    if (content == null || content.isEmpty) {
      return null;
    }
    if (content.length <= _kReportTitleMaxLength) {
      return content;
    }
    return '${content.substring(0, _kReportTitleMaxLength)}...';
  }
}

enum _PostMenuAction { report }
