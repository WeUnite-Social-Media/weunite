import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../legal/presentation/terms_of_use_sheet.dart';

/// Terms acceptance, with the web's own wording: the checkbox label
/// "Aceito os termos para criar minha conta." and the link
/// "Ler termos e condições" that opens the Terms of Use
/// (`SignUp.tsx` / `SignUpCompany.tsx` → `TermsModal`).
///
/// The web marks its checkbox `required`, but that attribute has no effect on
/// the button-based shadcn checkbox, so the browser never actually blocks the
/// submit. Here the rule is enforced: with the box unchecked the sign-up button
/// does nothing and this shows [errorText].
class TermsAcceptanceField extends StatelessWidget {
  const TermsAcceptanceField({
    required this.value,
    required this.onChanged,
    this.errorText,
    super.key,
  });

  final bool value;
  final ValueChanged<bool> onChanged;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox.square(
              dimension: 24,
              child: Checkbox(
                value: value,
                onChanged: (checked) => onChanged(checked ?? false),
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () => onChanged(!value),
                    child: Text(
                      'Aceito os termos para criar minha conta.',
                      style: textTheme.bodySmall
                          ?.copyWith(fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(height: 2),
                  GestureDetector(
                    onTap: () => showTermsOfUseSheet(context),
                    child: Text(
                      'Ler termos e condições',
                      style: textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        if (errorText != null)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 34),
            child: Text(
              errorText!,
              style: textTheme.bodySmall?.copyWith(
                color: AppColors.destructive,
              ),
            ),
          ),
      ],
    );
  }
}
