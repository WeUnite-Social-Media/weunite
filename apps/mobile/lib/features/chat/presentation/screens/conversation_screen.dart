import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';
import '../cubit/conversation_cubit.dart';

class ConversationScreen extends StatelessWidget {
  const ConversationScreen({required this.conversation, super.key});

  final Conversation conversation;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ConversationCubit(
        conversationId: conversation.id,
        repository: context.read<ChatRepository>(),
      )..start(),
      child: _ConversationView(conversation: conversation),
    );
  }
}

class _ConversationView extends StatefulWidget {
  const _ConversationView({required this.conversation});

  final Conversation conversation;

  @override
  State<_ConversationView> createState() => _ConversationViewState();
}

class _ConversationViewState extends State<_ConversationView> {
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
        title: Text(widget.conversation.peerName ?? 'Conversa'),
      ),
      body: MultiBlocListener(
        listeners: [
          BlocListener<ConversationCubit, ConversationState>(
            listenWhen: (previous, current) =>
                current.actionErrorMessage != null,
            listener: (context, state) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.actionErrorMessage!)),
              );
              context.read<ConversationCubit>().dismissActionError();
            },
          ),
          BlocListener<ConversationCubit, ConversationState>(
            listenWhen: (previous, current) =>
                previous.messageSentTick != current.messageSentTick,
            listener: (context, state) => _controller.clear(),
          ),
        ],
        child: BlocBuilder<ConversationCubit, ConversationState>(
          builder: (context, state) {
            return Column(
              children: [
                Expanded(
                  child: AsyncStateView(
                    isLoading: state.isLoading,
                    errorMessage: state.loadErrorMessage,
                    onRetry: () =>
                        context.read<ConversationCubit>().loadMessages(),
                    child: ListView.builder(
                      reverse: true,
                      padding: const EdgeInsets.all(16),
                      itemCount: state.messages.length,
                      itemBuilder: (context, index) {
                        final message =
                            state.messages[state.messages.length - 1 - index];
                        return _MessageBubble(message: message);
                      },
                    ),
                  ),
                ),
                _Composer(controller: _controller, isSending: state.isSending),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final myId = context.select((AuthCubit cubit) => cubit.state.user?.id);
    final isMine = message.senderId == myId;
    final time = DateFormat.Hm().format(message.createdAt.toLocal());

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isMine
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message.deleted
                  ? 'Mensagem apagada'
                  : message.edited
                      ? '${message.content} (editada)'
                      : message.content,
              style: message.deleted
                  ? const TextStyle(fontStyle: FontStyle.italic)
                  : null,
            ),
            const SizedBox(height: 4),
            Text(time, style: Theme.of(context).textTheme.labelSmall),
          ],
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({required this.controller, required this.isSending});

  final TextEditingController controller;
  final bool isSending;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Digite uma mensagem',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: controller,
              builder: (context, value, _) {
                final canSend = !isSending && value.text.trim().isNotEmpty;
                return IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: canSend
                      ? () => context
                          .read<ConversationCubit>()
                          .sendMessage(controller.text)
                      : null,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
