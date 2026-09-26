import 'package:flutter/material.dart';

import '../widgets/saved_opportunities_list.dart';

/// "Oportunidades salvas" as its own pushed screen, reached from the
/// Opportunities tab. It reuses [SavedOpportunitiesList] (and, inside it,
/// `SavedOpportunitiesCubit`) as-is — the same widget already shown in the
/// "Salvos" tab of the signed-in athlete's own profile — so there is a single
/// source of truth for saved opportunities, not a second cubit or data
/// source.
class SavedOpportunitiesScreen extends StatefulWidget {
  const SavedOpportunitiesScreen({super.key});

  @override
  State<SavedOpportunitiesScreen> createState() =>
      _SavedOpportunitiesScreenState();
}

class _SavedOpportunitiesScreenState extends State<SavedOpportunitiesScreen> {
  int _refreshTick = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Oportunidades salvas')),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _refreshTick++),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SavedOpportunitiesList(refreshTick: _refreshTick),
        ),
      ),
    );
  }
}
