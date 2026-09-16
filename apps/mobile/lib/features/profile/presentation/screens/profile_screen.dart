import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../cubit/profile_cubit.dart';
import '../widgets/profile_header.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    if (!context.read<ProfileCubit>().state.hasLoaded) {
      final userId = context.read<AuthCubit>().state.user?.id;
      if (userId != null) {
        context.read<ProfileCubit>().loadProfile(userId);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listener: (context, state) {
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<ProfileCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return AsyncStateView(
          isLoading: state.isLoading,
          errorMessage: state.loadErrorMessage,
          onRetry: () {
            final userId = context.read<AuthCubit>().state.user?.id;
            if (userId != null) {
              context.read<ProfileCubit>().loadProfile(userId);
            }
          },
          child: DefaultTabController(
            length: state.profile?.isCompany == true ? 3 : 2,
            child: ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                if (state.profile != null)
                  ProfileHeader(profile: state.profile!),
                TabBar(
                  labelColor: AppColors.primary,
                  indicatorColor: AppColors.accentGreen,
                  tabs: [
                    const Tab(text: 'Posts'),
                    const Tab(text: 'Sobre'),
                    if (state.profile?.isCompany == true)
                      const Tab(text: 'Oportunidades'),
                  ],
                ),
                SizedBox(
                  height: 360,
                  child: TabBarView(
                    children: [
                      const Center(child: Text('Posts do perfil')),
                      Center(
                        child: Text(state.profile?.bio ?? 'Sem bio ainda.'),
                      ),
                      if (state.profile?.isCompany == true)
                        const Center(child: Text('Oportunidades da empresa')),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
