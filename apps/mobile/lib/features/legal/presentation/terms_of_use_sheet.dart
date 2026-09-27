import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../domain/terms_of_use.dart';

/// The phone equivalent of the web's `TermsModal`: same title, same
/// "Última atualização" line and the same article text. A dialog is the wrong
/// shape for a long document on a small screen, so it is a draggable sheet.
Future<void> showTermsOfUseSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => const _TermsOfUseSheet(),
  );
}

class _TermsOfUseSheet extends StatelessWidget {
  const _TermsOfUseSheet();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return FractionallySizedBox(
      heightFactor: 0.9,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Termos de Uso', style: textTheme.titleLarge),
                const SizedBox(height: 4),
                Text(
                  'Última atualização: $kTermsOfUseLastUpdated',
                  style: textTheme.bodySmall
                      ?.copyWith(color: AppColors.mutedForeground),
                ),
              ],
            ),
          ),
          const Divider(height: 16),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 32),
              itemCount: kTermsOfUseSections.length,
              separatorBuilder: (_, __) => const SizedBox(height: 24),
              itemBuilder: (context, index) =>
                  _Section(kTermsOfUseSections[index]),
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.section);

  final TermsSection section;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          section.title,
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        for (final paragraph in section.paragraphs) ...[
          const SizedBox(height: 10),
          Text(
            paragraph,
            style: textTheme.bodyMedium?.copyWith(
              color: section.highlighted
                  ? AppColors.foreground
                  : AppColors.mutedForeground,
              height: 1.5,
            ),
          ),
        ],
        for (final bullet in section.bullets) ...[
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(top: 6, right: 8),
                child: Icon(Icons.circle, size: 5),
              ),
              Expanded(
                child: Text(
                  bullet,
                  style: textTheme.bodyMedium?.copyWith(
                    color: AppColors.mutedForeground,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );

    if (!section.highlighted) {
      return body;
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.muted,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: body,
    );
  }
}
