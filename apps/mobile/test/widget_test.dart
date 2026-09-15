import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/theme/app_theme.dart';
import 'package:weunite_mobile/core/widgets/app_bottom_nav.dart';

void main() {
  testWidgets('Bottom navigation selects the requested tab', (tester) async {
    var selectedTab = AppTab.feed;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: StatefulBuilder(
          builder: (context, setState) => Scaffold(
            bottomNavigationBar: AppBottomNav(
              currentTab: selectedTab,
              onTabSelected: (tab) => setState(() => selectedTab = tab),
            ),
          ),
        ),
      ),
    );
    for (final tab in AppTab.values) {
      await tester.tap(find.byType(NavigationDestination).at(tab.index));
      await tester.pumpAndSettle();
      expect(selectedTab, tab);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        tab.index,
      );
    }
  });
}
