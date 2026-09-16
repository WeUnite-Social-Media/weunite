import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
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
        return AsyncStateView(
          isLoading: state.isLoading,
          errorMessage: state.loadErrorMessage,
          onRetry: () => context.read<ChatCubit>().loadConversations(),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: state.conversations.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final conversation = state.conversations[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundImage: conversation.peerAvatar == null
                      ? null
                      : NetworkImage(conversation.peerAvatar!),
                  child: conversation.peerAvatar == null
                      ? Text(_initial(conversation.peerName))
                      : null,
                ),
                title: Text(conversation.peerName),
                subtitle: Text(
                  conversation.lastMessage ?? '@${conversation.peerUsername}',
                ),
                trailing: conversation.unreadCount == 0
                    ? null
                    : Badge(label: Text('${conversation.unreadCount}')),
              );
            },
          ),
        );
      },
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}
