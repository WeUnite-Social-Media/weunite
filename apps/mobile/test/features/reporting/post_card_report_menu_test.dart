import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/presentation/widgets/post_card.dart';
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

const _viewer = AppUser(
  id: 1,
  name: 'Alice',
  username: 'alice',
  email: 'alice@weunite.com',
  role: 'ATHLETE',
);

Post _post({required int authorId}) {
  return Post(
    id: 10,
    content: 'Ola mundo',
    authorName: 'Bob',
    authorUsername: 'bob',
    authorId: authorId,
    createdAt: DateTime.utc(2026, 9, 26),
  );
}

Future<void> _pump(WidgetTester tester, {required int authorId}) async {
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
            body: PostCard(post: _post(authorId: authorId)),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('shows the three-dot menu for a post from someone else',
      (tester) async {
    await _pump(tester, authorId: _viewer.id + 1);

    expect(find.byIcon(Icons.more_vert), findsOneWidget);
  });

  testWidgets('hides the three-dot menu for the post author (the viewer)',
      (tester) async {
    await _pump(tester, authorId: _viewer.id);

    expect(find.byIcon(Icons.more_vert), findsNothing);
  });

  testWidgets('tapping Denunciar opens the report sheet', (tester) async {
    await _pump(tester, authorId: _viewer.id + 1);

    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    expect(find.text('Denunciar'), findsOneWidget);

    await tester.tap(find.text('Denunciar'));
    await tester.pumpAndSettle();

    expect(find.text('Denunciar Post'), findsOneWidget);
    expect(find.text('Denunciando: '), findsNothing);
    expect(find.textContaining('Denunciando:'), findsOneWidget);
  });

  testWidgets('the report sheet lays out on a phone-sized screen',
      (tester) async {
    // Regression: the action buttons used to get an unbounded width inside
    // their Row, which only blew up on a narrow screen — the sheet opened
    // empty on the emulator while the wider default test surface passed.
    await tester.binding.setSurfaceSize(const Size(360, 690));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await _pump(tester, authorId: _viewer.id + 1);
    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Denunciar'));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('Enviar Denúncia'), findsOneWidget);
    expect(find.text('Cancelar'), findsOneWidget);
  });
}
