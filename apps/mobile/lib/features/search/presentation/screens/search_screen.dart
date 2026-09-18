import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../feed/domain/repositories/feed_repository.dart';
import '../../../feed/presentation/widgets/comments_sheet.dart';
import '../../../feed/presentation/widgets/post_card.dart';
import '../../../opportunities/domain/repositories/opportunity_repository.dart';
import '../../../opportunities/presentation/widgets/opportunity_card.dart';
import '../../../profile/domain/entities/profile.dart';
import '../../../profile/domain/repositories/profile_repository.dart';
import '../../../profile/presentation/navigation/open_user_profile.dart';
import '../cubit/search_cubit.dart';

/// Full-screen search reached from the Home search bar (`/search`).
class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SearchCubit(
        profileRepository: context.read<ProfileRepository>(),
        feedRepository: context.read<FeedRepository>(),
        opportunityRepository: context.read<OpportunityRepository>(),
      ),
      child: const _SearchView(),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView();

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            hintText: 'Pesquisar pessoas, posts e oportunidades',
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _controller.text.isEmpty
                ? null
                : IconButton(
                    tooltip: 'Limpar',
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      _controller.clear();
                      context.read<SearchCubit>().queryChanged('');
                      setState(() {});
                    },
                  ),
          ),
          onChanged: (value) {
            context.read<SearchCubit>().queryChanged(value);
            setState(() {});
          },
          onSubmitted: context.read<SearchCubit>().search,
        ),
      ),
      body: BlocBuilder<SearchCubit, SearchState>(
        builder: (context, state) {
          if (state.query.isEmpty) {
            return const _Message(
              icon: Icons.search,
              text: 'Busque por pessoas, posts e oportunidades.',
            );
          }
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.errorMessage != null) {
            return _Message(
              icon: Icons.error_outline,
              text: state.errorMessage!,
              onRetry: () => context.read<SearchCubit>().search(state.query),
            );
          }
          if (state.isEmpty) {
            return _Message(
              icon: Icons.search_off,
              text: 'Nenhum resultado para "${state.query}".',
            );
          }

          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              if (state.users.isNotEmpty) ...[
                const _SectionTitle('Pessoas'),
                for (final user in state.users) _UserTile(profile: user),
              ],
              if (state.posts.isNotEmpty) ...[
                const _SectionTitle('Posts'),
                for (final post in state.posts)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: PostCard(
                      post: post,
                      onComments: () =>
                          showCommentsSheet(context, postId: post.id),
                    ),
                  ),
              ],
              if (state.opportunities.isNotEmpty) ...[
                const _SectionTitle('Oportunidades'),
                for (final opportunity in state.opportunities)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: OpportunityCard(opportunity: opportunity),
                  ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(title, style: Theme.of(context).textTheme.titleMedium),
    );
  }
}

class _UserTile extends StatelessWidget {
  const _UserTile({required this.profile});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundImage: profile.profileImg == null
            ? null
            : NetworkImage(profile.profileImg!),
        child:
            profile.profileImg == null ? Text(_initials(profile.name)) : null,
      ),
      title: Text(profile.name),
      subtitle: Text('@${profile.username}'),
      trailing: profile.isCompany ? const Chip(label: Text('Empresa')) : null,
      onTap: () => openUserProfile(context, profile.id),
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    if (words.isEmpty || words.first.isEmpty) {
      return '?';
    }
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, this.onRetry});

  final IconData icon;
  final String text;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: Theme.of(context).disabledColor),
            const SizedBox(height: 12),
            Text(text, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: onRetry,
                child: const Text('Tentar novamente'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
