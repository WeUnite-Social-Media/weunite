import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/presentation/widgets/opportunity_card.dart';
import 'package:weunite_mobile/features/reporting/domain/repositories/report_repository.dart';
import 'package:weunite_mobile/features/reporting/domain/entities/report_entity_type.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

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
  Future<String?> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async =>
      null;

  @override
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) async =>
      null;

  @override
  Future<String?> sendResetPassword({required String email}) async => null;

  @override
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  }) async =>
      null;

  @override
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) async =>
      null;

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

const _viewer = AppUser(
  id: 1,
  name: 'Alice',
  username: 'alice',
  email: 'alice@weunite.com',
  role: 'ATHLETE',
);

Opportunity _opportunity({required int companyId}) {
  return Opportunity(
    id: 5,
    title: 'Peneira sub-20',
    description: 'Selecao para atletas de base',
    companyName: 'Clube Teste',
    companyId: companyId,
    location: 'Sao Paulo',
    dateEnd: DateTime.utc(2026, 10, 17),
    createdAt: DateTime.utc(2026, 9, 20),
    subscribersCount: 7,
  );
}

Future<void> _pump(WidgetTester tester, {required int companyId}) async {
  final authRepository = _FakeAuthRepository()..currentUser = _viewer;
  final authCubit = AuthCubit(authRepository, SessionEvents())
    ..restoreSession();
  addTearDown(authCubit.close);

  await tester.pumpWidget(
    MaterialApp(
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<ReportRepository>.value(
            value: _FakeReportRepository(),
          ),
        ],
        child: BlocProvider.value(
          value: authCubit,
          child: Scaffold(
            body: OpportunityCard(
              opportunity: _opportunity(companyId: companyId),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

/// Pumps the card the way the Opportunities tab really uses it: inside a
/// scrolling list, with the toggle callbacks wired, at phone size.
Future<void> _pumpInList(
  WidgetTester tester, {
  required int companyId,
}) async {
  await tester.binding.setSurfaceSize(const Size(393, 873));
  addTearDown(() => tester.binding.setSurfaceSize(null));

  final authRepository = _FakeAuthRepository()..currentUser = _viewer;
  final authCubit = AuthCubit(authRepository, SessionEvents())
    ..restoreSession();
  addTearDown(authCubit.close);

  await tester.pumpWidget(
    MaterialApp(
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<ReportRepository>.value(
            value: _FakeReportRepository(),
          ),
        ],
        child: BlocProvider.value(
          value: authCubit,
          child: Scaffold(
            body: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) => OpportunityCard(
                // The exact shape `GET /opportunities/get` returns.
                opportunity: Opportunity(
                  id: 3,
                  title: 'Avaliacao de laterais',
                  description: 'Terceira oportunidade para validar o refresh',
                  location: 'Santos, SP',
                  dateEnd: DateTime.utc(2026, 12, 20),
                  createdAt: DateTime.utc(2026, 9, 18, 4, 21, 42),
                  companyId: companyId,
                  companyName: 'Marca Teste QA',
                  companyUsername: 'marcateste',
                  skills: const ['Futebol'],
                  subscribersCount: 1,
                ),
                onOpenDetail: () {},
                onToggleSaved: () {},
                onToggleSubscription: () {},
              ),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('renders inside a scrolling list, as the tab uses it',
      (tester) async {
    await _pumpInList(tester, companyId: 99);

    expect(tester.takeException(), isNull);
    expect(find.text('Avaliacao de laterais'), findsWidgets);
    expect(find.text('Santos, SP'), findsWidgets);
    expect(find.text('Futebol'), findsWidgets);
  });
  testWidgets(
    'shows the three-dot menu for an opportunity from another company',
    (tester) async {
      await _pump(tester, companyId: _viewer.id + 1);

      expect(find.byIcon(Icons.more_vert), findsOneWidget);
    },
  );

  testWidgets(
    'hides the three-dot menu for the owning company (the viewer)',
    (tester) async {
      await _pump(tester, companyId: _viewer.id);

      expect(find.byIcon(Icons.more_vert), findsNothing);
    },
  );

  testWidgets('tapping Denunciar opens the report sheet', (tester) async {
    await _pump(tester, companyId: _viewer.id + 1);

    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    expect(find.text('Denunciar'), findsOneWidget);

    await tester.tap(find.text('Denunciar'));
    await tester.pumpAndSettle();

    expect(find.text('Denunciar Oportunidade'), findsOneWidget);
  });

  testWidgets(
    'shows company, "ha ...", title, description and meta in that order '
    'on a phone-sized screen',
    (tester) async {
      // Regression class: a previous layout only broke at phone width.
      await tester.binding.setSurfaceSize(const Size(360, 690));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await _pump(tester, companyId: _viewer.id + 1);

      final texts = tester
          .widgetList<Text>(find.byType(Text))
          .map((widget) => widget.data ?? '')
          .where((text) => text.isNotEmpty)
          .toList();

      int indexOf(bool Function(String text) match) => texts.indexWhere(match);

      final companyIndex = indexOf((text) => text == 'Clube Teste');
      final timeIndex = indexOf((text) => text.startsWith('ha '));
      final titleIndex = indexOf((text) => text == 'Peneira sub-20');
      final descriptionIndex =
          indexOf((text) => text.contains('Selecao para atletas de base'));
      final locationIndex = indexOf((text) => text == 'Sao Paulo');
      final dateIndex = indexOf((text) => text.startsWith('Ate '));
      final candidatesIndex = indexOf((text) => text.endsWith('candidatos'));

      expect(companyIndex, greaterThanOrEqualTo(0));
      expect(timeIndex, greaterThan(companyIndex));
      expect(titleIndex, greaterThan(timeIndex));
      expect(descriptionIndex, greaterThan(titleIndex));
      expect(locationIndex, greaterThan(descriptionIndex));
      expect(dateIndex, greaterThan(locationIndex));
      expect(candidatesIndex, greaterThan(dateIndex));
    },
  );
}
