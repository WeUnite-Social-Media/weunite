import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../domain/repositories/profile_repository.dart';
import '../cubit/user_profile_cubit.dart';
import '../widgets/profile_header.dart';

/// Read-only view of another user's profile, reached from `/profile/:userId`.
class UserProfileScreen extends StatelessWidget {
  const UserProfileScreen({required this.userId, super.key});

  final int userId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => UserProfileCubit(
        userId: userId,
        repository: context.read<ProfileRepository>(),
      )..load(),
      child: Scaffold(
        appBar: AppBar(title: const Text('Perfil')),
        body: BlocBuilder<UserProfileCubit, UserProfileState>(
          builder: (context, state) {
            return AsyncStateView(
              isLoading: state.isLoading,
              errorMessage: state.errorMessage,
              onRetry: () => context.read<UserProfileCubit>().load(),
              child: state.profile == null
                  ? const SizedBox.shrink()
                  : ListView(
                      children: [ProfileHeader(profile: state.profile!)],
                    ),
            );
          },
        ),
      ),
    );
  }
}
