import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/auth_validation.dart';

/// The web shows a `Progress` bar plus the caption "Segurança da senha"
/// (`SignUp.tsx`, `ResetPassword.tsx`). The bar alone doesn't say *what* is
/// missing, which on a phone means retyping blind, so the same score is shown
/// with the checklist of the five criteria it is made of.
///
/// The score comes from [passwordStrength], the same function the validators
/// use, so the bar can never disagree with the error message.
class PasswordStrengthIndicator extends StatelessWidget {
  const PasswordStrengthIndicator({required this.password, super.key});

  final String password;

  @override
  Widget build(BuildContext context) {
    final strength = passwordStrength(password);
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: strength / 100,
            minHeight: 6,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation(_colorFor(strength)),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Segurança da senha',
          style: textTheme.bodySmall?.copyWith(
            color: AppColors.mutedForeground,
          ),
        ),
        const SizedBox(height: 8),
        for (final requirement in kPasswordRequirements)
          _RequirementRow(
            label: requirement.label,
            isMet: requirement.isMetBy(password),
          ),
      ],
    );
  }

  Color _colorFor(int strength) {
    if (strength >= 100) {
      return AppColors.accentGreen;
    }
    if (strength >= 60) {
      return const Color(0xFFF59E0B);
    }
    return AppColors.destructive;
  }
}

class _RequirementRow extends StatelessWidget {
  const _RequirementRow({required this.label, required this.isMet});

  final String label;
  final bool isMet;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Row(
        children: [
          Icon(
            isMet ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 14,
            color:
                isMet ? AppColors.accentGreenStrong : AppColors.mutedForeground,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isMet
                        ? AppColors.accentGreenStrong
                        : AppColors.mutedForeground,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
