import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../domain/repositories/chat_repository.dart';
import '../cubit/conversation_lookup_cubit.dart';
import 'conversation_screen.dart';

/// Resolves a `/chat/:conversationId` deep link into the full [Conversation]
/// entity that [ConversationScreen] needs, since only the id is known from
/// the route.
class ConversationRouteScreen extends StatelessWidget {
  const ConversationRouteScreen({required this.conversationId, super.key});

  final int conversationId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ConversationLookupCubit(
        conversationId: conversationId,
        repository: context.read<ChatRepository>(),
      )..load(),
      child: BlocBuilder<ConversationLookupCubit, ConversationLookupState>(
        builder: (context, state) {
          final conversation = state.conversation;
          if (conversation != null) {
            return ConversationScreen(conversation: conversation);
          }
          return Scaffold(
            appBar: AppBar(),
            body: AsyncStateView(
              isLoading: state.isLoading,
              errorMessage: state.errorMessage,
              onRetry: () => context.read<ConversationLookupCubit>().load(),
              child: const SizedBox.shrink(),
            ),
          );
        },
      ),
    );
  }
}
