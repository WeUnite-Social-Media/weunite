import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/theme/app_colors.dart';
import 'package:weunite_mobile/core/theme/app_theme.dart';

void main() {
  testWidgets('chip labels are dark green on a light green surface',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: const Scaffold(body: Chip(label: Text('Futebol'))),
      ),
    );

    final paragraph =
        tester.renderObject<RenderParagraph>(find.text('Futebol'));
    expect(paragraph.text.style?.color, AppColors.accentGreenStrong);

    final background = AppTheme.light().chipTheme.backgroundColor!;
    expect(
      _contrastRatio(AppColors.accentGreenStrong, background),
      greaterThanOrEqualTo(4.5),
    );
  });
}

/// WCAG 2.x contrast ratio between two opaque colors.
double _contrastRatio(Color a, Color b) {
  final la = a.computeLuminance();
  final lb = b.computeLuminance();
  final lighter = la > lb ? la : lb;
  final darker = la > lb ? lb : la;
  return (lighter + 0.05) / (darker + 0.05);
}
