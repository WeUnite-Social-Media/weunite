import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/opportunities/presentation/cubit/opportunities_cubit.dart';
import 'package:weunite_mobile/features/opportunities/presentation/screens/opportunities_screen.dart';
import 'package:weunite_mobile/features/reporting/domain/entities/report_entity_type.dart';
import 'package:weunite_mobile/features/reporting/domain/repositories/report_repository.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => currentUser;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {}

  @override
  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  }) async {}

  @override
  Future<void> logout() async {}
}

class _FakeReportRepository implements ReportRepository {
  @override
  Future<String?> submitReport({
    required ReportEntityType type,
    required int entityId,
    required String reason,
  }) async =>
      null;
}

class _FakeOpportunityRepository implements OpportunityRepository {
  List<Opportunity> opportunities = const [];

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async =>
      opportunities;

  @override
  Future<List<Opportunity>> getSavedOpportunities() async => const [];

  @override
  Future<List<Opportunity>> getMySubscriptions() async => const [];

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async => true;

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async => true;
}

const _athlete = AppUser(
  id: 1,
  name: 'Alice',
  username: 'alice',
  email: 'alice@weunite.com',
  role: 'ATHLETE',
);

Opportunity _opportunity({
  required int id,
  required String title,
  String? location = 'Sao Paulo',
}) {
  return Opportunity(
    id: id,
    title: title,
    description: 'Descricao $id',
    companyName: 'Clube $id',
    location: location,
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

  final authRepository = _FakeAuthRepository()..currentUser = _athlete;
  final authCubit = AuthCubit(authRepository, SessionEvents())
    ..restoreSession();
  addTearDown(authCubit.close);

  final opportunityCubit = OpportunitiesCubit(
    _FakeOpportunityRepository()..opportunities = opportunities,
  );
  addTearDown(opportunityCubit.close);

  await tester.pumpWidget(
    MaterialApp(
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<ReportRepository>.value(
            value: _FakeReportRepository(),
          ),
        ],
        child: MultiBlocProvider(
          providers: [
            BlocProvider.value(value: authCubit),
            BlocProvider.value(value: opportunityCubit),
          ],
          child: const Scaffold(body: OpportunitiesScreen()),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('typing in the search field narrows the list to what matches',
      (tester) async {
    await _pump(
      tester,
      opportunities: [
        _opportunity(id: 1, title: 'Peneira sub-20'),
        _opportunity(id: 2, title: 'Vaga de analista de desempenho'),
      ],
    );

    expect(find.text('Buscar oportunidades...'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'analista');
    await tester.pumpAndSettle();

    expect(find.text('Vaga de analista de desempenho'), findsOneWidget);
    expect(find.text('Peneira sub-20'), findsNothing);
  });

  testWidgets('hides the suggestions carousel while a search is active',
      (tester) async {
    await _pump(
      tester,
      opportunities: [
        _opportunity(id: 1, title: 'Peneira sub-20'),
        _opportunity(id: 2, title: 'Vaga de analista'),
      ],
    );

    expect(find.text('Oportunidades Sugestões'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'analista');
    await tester.pumpAndSettle();

    expect(find.text('Oportunidades Sugestões'), findsNothing);
  });

  testWidgets(
      'shows the not-found message, worded like the web, for an unmatched search',
      (tester) async {
    await _pump(
      tester,
      opportunities: [_opportunity(id: 1, title: 'Peneira sub-20')],
    );

    await tester.enterText(find.byType(TextField), 'inexistente');
    await tester.pumpAndSettle();

    expect(
      find.text('Nenhuma oportunidade encontrada para "inexistente".'),
      findsOneWidget,
    );
    expect(find.text('Peneira sub-20'), findsNothing);
  });

  testWidgets('shows the athlete-only navigation entries', (tester) async {
    await _pump(
      tester,
      opportunities: [_opportunity(id: 1, title: 'Peneira sub-20')],
    );

    expect(find.text('Minhas candidaturas'), findsOneWidget);
    expect(find.text('Oportunidades salvas'), findsOneWidget);
  });
}
