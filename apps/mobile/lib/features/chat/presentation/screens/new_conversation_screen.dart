import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/session/current_user_provider.dart';
import '../../../profile/domain/entities/profile.dart';
import '../../../profile/domain/repositories/profile_repository.dart';
import '../../domain/repositories/chat_repository.dart';
import '../cubit/user_search_cubit.dart';

/// People search that lives inside the Chat tab (`/chat/new`).
///
/// It only searches users and tapping one **opens the conversation** with that
/// person — it never opens their profile. The profile navigation belongs to the
/// Home search (`/search`).
class NewConversationScreen extends StatelessWidget {
  const NewConversationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => UserSearchCubit(
        profileRepository: context.read<ProfileRepository>(),
        chatRepository: context.read<ChatRepository>(),
        currentUserProvider: context.read<CurrentUserProvider>(),
      ),
      child: const _NewConversationView(),
    );
  }
}

class _NewConversationView extends StatefulWidget {
  const _NewConversationView();

  @override
  State<_NewConversationView> createState() => _NewConversationViewState();
}

class _NewConversationViewState extends State<_NewConversationView> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _openConversation(BuildContext context, Profile profile) async {
    final conversationId =
        await context.read<UserSearchCubit>().openConversationWith(profile.id);
    if (conversationId == null || !context.mounted) {
      return;
    }
    // Hand the id back to the Chat tab and close: it owns ChatCubit, so it can
    // open the conversation and refresh the list afterwards. Coming back from
    // the conversation then lands on the list, not on this search again.
    context.pop(conversationId);
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
            hintText: 'Buscar pessoas para conversar',
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _controller.text.isEmpty
                ? null
                : IconButton(
                    tooltip: 'Limpar',
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      _controller.clear();
                      context.read<UserSearchCubit>().queryChanged('');
                      setState(() {});
                    },
                  ),
          ),
          onChanged: (value) {
            context.read<UserSearchCubit>().queryChanged(value);
            setState(() {});
          },
          onSubmitted: context.read<UserSearchCubit>().search,
        ),
      ),
      body: BlocConsumer<UserSearchCubit, UserSearchState>(
        listenWhen: (previous, current) =>
            current.errorMessage != null &&
            previous.errorMessage != current.errorMessage,
        listener: (context, state) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!)),
          );
          context.read<UserSearchCubit>().dismissError();
        },
        builder: (context, state) {
          if (state.query.isEmpty) {
            return const _Message(
              icon: Icons.person_search,
              text: 'Busque por nome ou @username para iniciar uma conversa.',
            );
          }
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.errorMessage != null && state.isEmpty) {
            return _Message(
              icon: Icons.error_outline,
              text: state.errorMessage!,
              onRetry: () =>
                  context.read<UserSearchCubit>().search(state.query),
            );
          }
          if (state.hasSearched && state.isEmpty) {
            return _Message(
              icon: Icons.search_off,
              text: 'Nenhuma pessoa encontrada para "${state.query}".',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.only(bottom: 24),
            itemCount: state.users.length,
            itemBuilder: (context, index) {
              final profile = state.users[index];
              final isPending = state.pendingUserId == profile.id;
              return ListTile(
                leading: CircleAvatar(
                  backgroundImage: profile.profileImg == null
                      ? null
                      : NetworkImage(profile.profileImg!),
                  child: profile.profileImg == null
                      ? Text(_initials(profile.name))
                      : null,
                ),
                title: Text(profile.name),
                subtitle: Text('@${profile.username}'),
                trailing: isPending
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : profile.isCompany
                        ? const Chip(label: Text('Empresa'))
                        : const Icon(Icons.chat_bubble_outline),
                // Deliberately opens the conversation, not the profile.
                onTap: state.pendingUserId != null
                    ? null
                    : () => _openConversation(context, profile),
              );
            },
          );
        },
      ),
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
