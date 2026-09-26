import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/cubit/auth_cubit.dart';

/// Opens the profile of [userId] from anywhere in the app (feed, comments,
/// opportunities, search results). The signed-in user's own id goes to the
/// `/profile` tab instead of pushing a read-only copy of it.
///
/// Set [closeCurrentRoute] when calling from a bottom sheet or dialog, so it
/// is dismissed before navigating.
///
/// Reading `AuthCubit.state.user?.id` here is a navigation-only decision (own
/// profile vs someone else's); the id is never sent to the API.
void openUserProfile(
  BuildContext context,
  int? userId, {
  bool closeCurrentRoute = false,
}) {
  if (userId == null) {
    return;
  }
  final router = GoRouter.of(context);
  final location = profileLocationFor(
    userId: userId,
    currentUserId: context.read<AuthCubit>().state.user?.id,
  );
  if (closeCurrentRoute) {
    Navigator.of(context).pop();
  }
  if (location == ownProfileLocation) {
    router.go(location);
  } else {
    router.push(location);
  }
}

const ownProfileLocation = '/profile';

/// Where tapping on [userId] should lead: the own-profile tab for the
/// signed-in user, the read-only `/profile/:userId` route for anyone else.
String profileLocationFor({required int userId, required int? currentUserId}) {
  return userId == currentUserId ? ownProfileLocation : '/profile/$userId';
}
