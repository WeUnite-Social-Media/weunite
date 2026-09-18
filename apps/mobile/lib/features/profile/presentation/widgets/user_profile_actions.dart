import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../cubit/user_profile_cubit.dart';

/// "Seguir"/"Deixar de seguir" and "Conversar" on another user's profile — the
/// same pair the web `HeaderProfile` renders when the profile is not mine.
/// Applies to athletes and to companies/clubs alike: the web makes no role
/// distinction here, and neither does the API.
class UserProfileActions extends StatelessWidget {
  const UserProfileActions({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserProfileCubit, UserProfileState>(
      builder: (context, state) {
        final profile = state.profile;
        if (profile == null) {
          return const SizedBox.shrink();
        }
        final isFollowing = profile.isFollowing;
        return Row(
          children: [
            Expanded(
              child: isFollowing
                  ? OutlinedButton(
                      onPressed: state.isFollowPending
                          ? null
                          : context.read<UserProfileCubit>().toggleFollow,
                      child: const Text('Deixar de seguir'),
                    )
                  : FilledButton(
                      onPressed: state.isFollowPending
                          ? null
                          : context.read<UserProfileCubit>().toggleFollow,
                      child: const Text('Seguir'),
                    ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: state.isConversationPending
                    ? null
                    : () => _openConversation(context),
                icon: state.isConversationPending
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.send_outlined, size: 18),
                label: Text(
                  state.isConversationPending ? 'Abrindo...' : 'Conversar',
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _openConversation(BuildContext context) async {
    final conversationId =
        await context.read<UserProfileCubit>().openConversation();
    if (conversationId == null || !context.mounted) {
      return;
    }
    // Straight to the messages screen, like the web button does.
    await context.push<void>('/chat/$conversationId');
  }
}
