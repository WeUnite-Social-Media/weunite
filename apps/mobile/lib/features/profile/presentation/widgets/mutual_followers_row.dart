import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/mutual_followers.dart';
import '../../domain/entities/profile.dart';

/// "(●●●) Seguido por leo, ana, carlos +3" — up to 3 avatars, 3 names and the
/// remaining count, the same row the web profile header shows.
class MutualFollowersRow extends StatelessWidget {
  const MutualFollowersRow({required this.mutualFollowers, super.key});

  final MutualFollowers mutualFollowers;

  static const _avatarRadius = 12.0;
  static const _overlap = 16.0;

  @override
  Widget build(BuildContext context) {
    if (mutualFollowers.isEmpty) {
      return const SizedBox.shrink();
    }
    final users = mutualFollowers.users;
    final extra = mutualFollowers.extra;
    final textStyle = Theme.of(context).textTheme.bodySmall;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: [
          SizedBox(
            width: _avatarRadius * 2 + _overlap * (users.length - 1),
            height: _avatarRadius * 2,
            child: Stack(
              children: [
                for (var i = 0; i < users.length; i++)
                  Positioned(left: i * _overlap, child: _Avatar(users[i])),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: textStyle,
                children: [
                  const TextSpan(text: 'Seguido por '),
                  TextSpan(
                    text: users.map((user) => user.username).join(', '),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  if (extra > 0)
                    TextSpan(
                      text: ' +$extra',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                ],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar(this.profile);

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    final image = profile.profileImg;
    return CircleAvatar(
      radius: MutualFollowersRow._avatarRadius + 1.5,
      backgroundColor: AppColors.background,
      child: CircleAvatar(
        radius: MutualFollowersRow._avatarRadius,
        backgroundImage: image == null ? null : NetworkImage(image),
        child: image == null
            ? Text(
                profile.name.trim().isEmpty
                    ? '?'
                    : profile.name.trim()[0].toUpperCase(),
                style: const TextStyle(fontSize: 11),
              )
            : null,
      ),
    );
  }
}
