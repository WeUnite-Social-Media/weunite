import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/auth/presentation/screens/reset_password_screen.dart';
import 'package:weunite_mobile/features/auth/presentation/screens/send_reset_password_screen.dart';
import 'package:weunite_mobile/features/auth/presentation/screens/verify_reset_token_screen.dart';

/// The whole "Esqueceu sua senha?" flow, driven the way a person drives it:
/// e-mail, code, new password.
///
/// The end-to-end test is the regression guard for a bug found on the emulator.
/// The three screens stack up and all of them share one `AuthCubit`, so while
/// each one navigated from a `BlocListener`, the success message of the *last*
/// step reached the screens underneath and they navigated again: the code
/// screen pushed `/reset-password/` a second time, without a code, and the app
/// ended on go_router's "Page Not Found" even though the password had in fact
/// been changed.
void main() {
  late _FakeAuthRepository repository;
  late SessionEvents sessionEvents;
  late AuthCubit cubit;

  setUp(() {
    repository = _FakeAuthRepository();
    sessionEvents = SessionEvents();
    cubit = AuthCubit(repository, sessionEvents);
  });

  tearDown(() async {
    await cubit.close();
    sessionEvents.dispose();
  });

  Future<void> pumpRecovery(WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    final router = GoRouter(
      initialLocation: '/send-reset-password',
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) =>
              const Scaffold(body: Center(child: Text('tela de login'))),
        ),
        GoRoute(
          path: '/send-reset-password',
          builder: (context, state) => const SendResetPasswordScreen(),
        ),
        GoRoute(
          path: '/verify-reset-token/:email',
          builder: (context, state) => VerifyResetTokenScreen(
            email: state.pathParameters['email']!,
          ),
        ),
        GoRoute(
          path: '/reset-password/:verificationToken',
          builder: (context, state) => ResetPasswordScreen(
            verificationToken: state.pathParameters['verificationToken']!,
          ),
        ),
      ],
    );

    await tester.pumpWidget(
      BlocProvider.value(
        value: cubit,
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pumpAndSettle();
  }

  // The assertions look at what is on screen instead of the router's location:
  // `push` adds an imperative page that `currentConfiguration` does not report,
  // and what matters here is which screen the person is actually looking at.
  final codeScreen =
      find.text('Um código de seis digitos foi enviado ao seu e-mail');
  final newPasswordScreen = find.text('Insira sua nova senha');
  final emailScreen = find.text('Insira seu e-mail para redefinir sua senha');
  final loginScreen = find.text('tela de login');
  final notFound = find.textContaining('Page Not Found');

  testWidgets(
      'goes e-mail -> code -> new password and ends on the login screen',
      (tester) async {
    await pumpRecovery(tester);

    await tester.enterText(
      find.byType(TextFormField),
      'joao@provedor.com',
    );
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();

    expect(repository.sentTo, ['joao@provedor.com']);
    expect(codeScreen, findsOneWidget);
    expect(find.text('joao@provedor.com'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.pumpAndSettle();

    expect(repository.verifiedCodes, ['123456']);
    expect(newPasswordScreen, findsOneWidget);

    final passwordFields = find.byType(TextFormField);
    await tester.enterText(passwordFields.at(0), 'Nova@2026y');
    await tester.enterText(passwordFields.at(1), 'Nova@2026y');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Redefinir'));
    await tester.pumpAndSettle();

    expect(repository.resetWith, [('123456', 'Nova@2026y')]);
    // The whole point: one navigation, to the login screen — not a second push
    // from a screen further down the stack, which used to end on "Page Not
    // Found" with the password already changed.
    expect(loginScreen, findsOneWidget);
    expect(notFound, findsNothing);
    expect(codeScreen, findsNothing);
  });

  testWidgets('a wrong code keeps the user on the code screen', (tester) async {
    await pumpRecovery(tester);
    await tester.enterText(find.byType(TextFormField), 'joao@provedor.com');
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();

    // Lets the "Codigo enviado!" snackbar expire, so the next one checked is
    // the one this step produces.
    await tester.pump(const Duration(seconds: 5));
    await tester.pumpAndSettle();

    repository.failure = const AppException('Token invalido');
    await tester.enterText(find.byType(TextFormField), '000000');
    // Short pumps on purpose: `pumpAndSettle` would run past the snackbar's
    // own four seconds and the message would be gone before it is checked.
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    expect(codeScreen, findsOneWidget);
    expect(newPasswordScreen, findsNothing);
    expect(find.text('Token invalido'), findsOneWidget);
  });

  testWidgets('an unknown e-mail keeps the user on the first screen',
      (tester) async {
    await pumpRecovery(tester);
    repository.failure = const AppException('Usuario nao encontrado');

    await tester.enterText(find.byType(TextFormField), 'ninguem@provedor.com');
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();

    expect(emailScreen, findsOneWidget);
    expect(codeScreen, findsNothing);
    expect(find.text('Usuario nao encontrado'), findsOneWidget);
  });

  testWidgets('the new password and its confirmation must match',
      (tester) async {
    await pumpRecovery(tester);
    await tester.enterText(find.byType(TextFormField), 'joao@provedor.com');
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.pumpAndSettle();

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Nova@2026y');
    await tester.enterText(fields.at(1), 'Nova@2026z');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Redefinir'));
    await tester.pumpAndSettle();

    expect(repository.resetWith, isEmpty);
    expect(find.text('As senhas devem ser iguais'), findsOneWidget);
    expect(newPasswordScreen, findsOneWidget);
  });

  testWidgets('a weak new password is refused before it is sent',
      (tester) async {
    await pumpRecovery(tester);
    await tester.enterText(find.byType(TextFormField), 'joao@provedor.com');
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.pumpAndSettle();

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'abcdefgh');
    await tester.enterText(fields.at(1), 'abcdefgh');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Redefinir'));
    await tester.pumpAndSettle();

    expect(repository.resetWith, isEmpty);
    expect(
      find.text('A senha deve conter pelo menos uma letra maiuscula'),
      findsOneWidget,
    );
  });
}

class _FakeAuthRepository implements AuthRepository {
  final sentTo = <String>[];
  final verifiedCodes = <String>[];
  final resetWith = <(String, String)>[];
  AppException? failure;

  void _maybeFail() {
    final error = failure;
    if (error != null) {
      throw error;
    }
  }

  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => null;

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
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

  @override
  Future<String?> sendResetPassword({required String email}) async {
    _maybeFail();
    sentTo.add(email);
    return 'Codigo enviado!';
  }

  @override
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  }) async {
    _maybeFail();
    verifiedCodes.add(verificationToken);
    return 'Codigo verificado!';
  }

  @override
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) async {
    _maybeFail();
    resetWith.add((verificationToken, newPassword));
    return 'Senha redefinida!';
  }

  @override
  Future<void> logout() async {}
}
