import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/profile.dart';

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({required this.profile, super.key});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 160,
          width: double.infinity,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 120,
                width: double.infinity,
                color: AppColors.primary,
                child: profile.bannerImg == null
                    ? null
                    : Image.network(profile.bannerImg!, fit: BoxFit.cover),
              ),
              Positioned(
                left: 20,
                bottom: 0,
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: AppColors.background,
                  child: CircleAvatar(
                    radius: 44,
                    backgroundImage: profile.profileImg == null
                        ? null
                        : NetworkImage(profile.profileImg!),
                    child: profile.profileImg == null
                        ? Text(
                            _initial(profile.name),
                            style: const TextStyle(fontSize: 28),
                          )
                        : null,
                  ),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(profile.name, style: Theme.of(context).textTheme.headlineSmall),
              Text('@${profile.username}', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text('${profile.followersCount} seguidores'),
                  const SizedBox(width: 16),
                  Text('${profile.followingCount} seguindo'),
                ],
              ),
              if (profile.bio != null) ...[
                const SizedBox(height: 12),
                Text(profile.bio!),
              ],
            ],
          ),
        ),
      ],
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}
