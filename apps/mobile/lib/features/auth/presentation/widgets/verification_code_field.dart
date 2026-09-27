import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/auth_validation.dart';

/// The phone counterpart of the web's six-slot `InputOTP`, used by both code
/// screens exactly as the web reuses `InputOTP` in `VerifyEmail` and
/// `VerifyResetToken`.
///
/// Six separate boxes each with their own controller is a well-known source of
/// focus bugs on Android (and breaks pasting a code from the e-mail app), so
/// this is one field, digits only, spaced out to read like slots.
class VerificationCodeField extends StatelessWidget {
  const VerificationCodeField({
    required this.controller,
    this.onCompleted,
    this.onChanged,
    this.enabled = true,
    super.key,
  });

  final TextEditingController controller;

  /// Called when the sixth digit is typed, so the keyboard's "done" is not the
  /// only way to submit.
  final VoidCallback? onCompleted;
  final ValueChanged<String>? onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(
          controller: controller,
          enabled: enabled,
          autofocus: true,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          textAlign: TextAlign.center,
          maxLength: 6,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            letterSpacing: 14,
          ),
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          decoration: const InputDecoration(
            counterText: '',
            hintText: '------',
            hintStyle: TextStyle(
              fontSize: 28,
              letterSpacing: 14,
              color: AppColors.border,
            ),
          ),
          validator: validateVerificationCode,
          onChanged: (value) {
            onChanged?.call(value);
            if (value.length == 6) {
              onCompleted?.call();
            }
          },
        ),
        const SizedBox(height: 8),
        Text(
          'Digite o código enviado ao seu e-mail',
          textAlign: TextAlign.center,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.mutedForeground),
        ),
      ],
    );
  }
}
