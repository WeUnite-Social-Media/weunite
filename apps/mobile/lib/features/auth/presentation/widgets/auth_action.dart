import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../cubit/auth_cubit.dart';

/// Runs one authentication action and handles its answer *in the screen that
/// started it*. Returns true when the action succeeded.
///
/// A `BlocListener` reads better but is wrong for this flow. Login, sign-up and
/// the three recovery steps all share one `AuthCubit`, and every screen stays
/// mounted underneath the next one, so a message meant for the top screen
/// reaches all of them: after "Senha redefinida!" the code screen — still alive
/// two levels down — ran its own navigation again and pushed
/// `/reset-password/` with no code, landing the app on go_router's
/// "Page Not Found". The snackbars stacked up for the same reason.
///
/// Awaiting the call keeps each answer with its caller.
Future<bool> runAuthAction(
  BuildContext context,
  Future<void> Function() action,
) async {
  final cubit = context.read<AuthCubit>();
  final messenger = ScaffoldMessenger.of(context);
  await action();
  if (!context.mounted) {
    return false;
  }
  final state = cubit.state;
  final message = state.errorMessage ?? state.successMessage;
  if (message != null) {
    messenger.showSnackBar(SnackBar(content: Text(message)));
    cubit.clearMessages();
  }
  return state.successMessage != null;
}
