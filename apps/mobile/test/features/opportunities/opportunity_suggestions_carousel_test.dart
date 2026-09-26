import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/presentation/widgets/opportunity_suggestions_carousel.dart';

Opportunity _opportunity(int id) {
  return Opportunity(
    id: id,
    title: 'Peneira sub-20 #$id',
    description: 'Descricao $id',
    companyName: 'Clube $id',
    dateEnd: DateTime.utc(2026, 10, 17),
    subscribersCount: id,
  );
}

Future<void> _pump(
  WidgetTester tester, {
  required List<Opportunity> opportunities,
}) async {
  await tester.binding.setSurfaceSize(const Size(360, 690));
  addTearDown(() => tester.binding.setSurfaceSize(null));

  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: OpportunitySuggestionsCarousel(
          opportunities: opportunities,
          onOpenDetail: (_) {},
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('shows the section title and one card per opportunity',
      (tester) async {
    await _pump(
      tester,
      opportunities: [_opportunity(1), _opportunity(2), _opportunity(3)],
    );

    expect(find.text('Oportunidades Sugestões'), findsOneWidget);
    expect(find.text('Peneira sub-20 #1'), findsOneWidget);

    // The carousel is a horizontal list on a phone-sized screen, so later
    // cards start out of view — scroll them in before asserting on them.
    await tester.dragUntilVisible(
      find.text('Peneira sub-20 #3'),
      find.byType(ListView),
      const Offset(-300, 0),
    );
    expect(find.text('Peneira sub-20 #2'), findsOneWidget);
    expect(find.text('Peneira sub-20 #3'), findsOneWidget);
  });

  testWidgets('renders nothing when there are no opportunities to suggest',
      (tester) async {
    await _pump(tester, opportunities: const []);

    expect(find.text('Oportunidades Sugestões'), findsNothing);
    expect(find.byType(SizedBox), findsWidgets);
  });

  testWidgets('tapping a suggestion card opens its detail', (tester) async {
    Opportunity? tapped;
    await tester.binding.setSurfaceSize(const Size(360, 690));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final opportunity = _opportunity(9);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OpportunitySuggestionsCarousel(
            opportunities: [opportunity],
            onOpenDetail: (value) => tapped = value,
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Peneira sub-20 #9'));
    await tester.pumpAndSettle();

    expect(tapped, opportunity);
  });
}
