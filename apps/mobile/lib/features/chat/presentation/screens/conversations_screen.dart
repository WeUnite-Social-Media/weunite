import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/async_state_view.dart';
import '../../domain/entities/conversation.dart';
import '../cubit/chat_cubit.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  @override
  void initState() {
    super.initState();
    if (!context.read<ChatCubit>().state.hasLoaded) {
      context.read<ChatCubit>().loadConversations();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ChatCubit, ChatState>(
      listener: (context, state) {
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<ChatCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Colors.transparent,
          floatingActionButton: state.conversations.isEmpty
              ? null
              : FloatingActionButton(
                  // The feed tab keeps its own FAB alive in the IndexedStack,
                  // so this one needs a distinct hero tag.
                  heroTag: 'new-conversation-fab',
                  tooltip: 'Nova conversa',
                  onPressed: () => _openNewConversation(context),
                  child: const Icon(Icons.edit_square),
                ),
          body: Column(
            children: [
              const _NewConversationBar(),
              Expanded(
                child: AsyncStateView(
                  isLoading: state.isLoading,
                  errorMessage: state.loadErrorMessage,
                  onRetry: context.read<ChatCubit>().loadConversations,
                  child: RefreshIndicator(
                    onRefresh: context.read<ChatCubit>().loadConversations,
                    child: state.conversations.isEmpty
                        ? const _EmptyConversations()
                        : ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
                            itemCount: state.conversations.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final conversation = state.conversations[index];
                              return _ConversationTile(
                                conversation: conversation,
                                onTap: () async {
                                  // Opening it marks it as read on the API;
                                  // clear the badge here too and refresh on the
                                  // way back.
                                  context
                                      .read<ChatCubit>()
                                      .markAsRead(conversation.id);
                                  await context
                                      .push<void>('/chat/${conversation.id}');
                                  if (context.mounted) {
                                    await context
                                        .read<ChatCubit>()
                                        .loadConversations();
                                  }
                                },
                              );
                            },
                          ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Entry point for item 19: a people search that belongs to the Chat tab.
Future<void> _openNewConversation(BuildContext context) async {
  // The search pops with the conversation it opened (or created), so the list
  // — which owns ChatCubit — pushes the conversation and reloads afterwards.
  final conversationId = await context.push<int>('/chat/new');
  if (conversationId != null && context.mounted) {
    await context.push<void>('/chat/$conversationId');
  }
  if (context.mounted) {
    await context.read<ChatCubit>().loadConversations();
  }
}

/// Looks like the Home search bar, but it opens the chat-only people search.
class _NewConversationBar extends StatelessWidget {
  const _NewConversationBar();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => _openNewConversation(context),
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppColors.mutedForeground),
              const SizedBox(width: 8),
              Text(
                'Buscar pessoas para conversar',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: AppColors.mutedForeground),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Conversation row: a card, so it stands out from the page background the
/// way the web list does.
class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.conversation, required this.onTap});

  final Conversation conversation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final unread = conversation.unreadCount > 0;
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: unread ? AppColors.accentGreen : AppColors.border,
              width: unread ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundImage: conversation.peerAvatar == null
                    ? null
                    : NetworkImage(conversation.peerAvatar!),
                child: conversation.peerAvatar == null
                    ? Text(_initials(conversation.peerName ?? '?'))
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      conversation.peerName ?? 'Conversa',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight:
                                unread ? FontWeight.w700 : FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _preview(conversation),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: unread
                                ? AppColors.foreground
                                : AppColors.mutedForeground,
                            fontWeight:
                                unread ? FontWeight.w600 : FontWeight.w400,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    formatConversationTime(conversation.lastMessageAt),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: unread
                              ? AppColors.accentGreenStrong
                              : AppColors.mutedForeground,
                        ),
                  ),
                  const SizedBox(height: 6),
                  if (unread)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.destructive,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${conversation.unreadCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    )
                  else
                    const SizedBox(height: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _preview(Conversation conversation) {
    return switch (conversation.lastMessageType) {
      ChatMessageType.image => 'Imagem',
      ChatMessageType.file => 'Arquivo',
      ChatMessageType.text => (conversation.lastMessage?.isNotEmpty ?? false)
          ? conversation.lastMessage!
          : conversation.peerUsername == null
              ? 'Sem mensagens ainda'
              : '@${conversation.peerUsername}',
    };
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    if (words.isEmpty || words.first.isEmpty) {
      return '?';
    }
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }
}

/// Today shows the time, this year day/month, older the full date.
String formatConversationTime(DateTime? date, {DateTime? now}) {
  if (date == null) {
    return '';
  }
  final local = date.toLocal();
  final today = now ?? DateTime.now();
  final sameDay = local.year == today.year &&
      local.month == today.month &&
      local.day == today.day;
  if (sameDay) {
    return DateFormat('HH:mm').format(local);
  }
  if (local.year == today.year) {
    return DateFormat('dd/MM').format(local);
  }
  return DateFormat('dd/MM/yyyy').format(local);
}

class _EmptyConversations extends StatelessWidget {
  const _EmptyConversations();

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        const SizedBox(height: 80),
        Icon(
          Icons.forum_outlined,
          size: 48,
          color: Theme.of(context).disabledColor,
        ),
        const SizedBox(height: 16),
        const Center(child: Text('Voce ainda nao possui conversas.')),
        const SizedBox(height: 8),
        const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              'Encontre pessoas na busca para iniciar uma conversa.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
        const SizedBox(height: 20),
        Center(
          child: FilledButton.icon(
            onPressed: () => _openNewConversation(context),
            icon: const Icon(Icons.edit_square),
            label: const Text('Nova conversa'),
          ),
        ),
      ],
    );
  }
}
