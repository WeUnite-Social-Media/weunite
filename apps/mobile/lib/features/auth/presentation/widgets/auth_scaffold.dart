import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// The WeUnite wordmark, the phone stand-in for the Lottie animation the web
/// puts above every auth card. A remote animation would mean a network round
/// trip before the user can even type, so the brand mark is drawn locally with
/// the same two colours the rest of the app uses.
class AuthWordmark extends StatelessWidget {
  const AuthWordmark({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(text: 'We', style: TextStyle(color: AppColors.primary)),
            TextSpan(
              text: 'Unite',
              style: TextStyle(color: AppColors.accentGreen),
            ),
          ],
        ),
        style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900),
      ),
    );
  }
}

/// Header of the recovery and verification screens: the web wraps each of them
/// in a card with a "Voltar" link, a bold title and a description
/// (`VerifyEmail`, `SendResetPassword`, `VerifyResetToken`, `ResetPassword`).
/// The back link lives in the AppBar on the phone, so this is title +
/// description only.
class AuthStepHeader extends StatelessWidget {
  const AuthStepHeader({
    required this.title,
    required this.description,
    super.key,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          textAlign: TextAlign.center,
          style:
              textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground),
        ),
      ],
    );
  }
}
