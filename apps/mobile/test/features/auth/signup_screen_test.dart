import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/auth/presentation/screens/signup_screen.dart';

/// The sign-up form end to end at phone size: what it refuses to send, and what
/// it sends when everything is filled in.
void main() {
  late _RecordingAuthRepository repository;
  late SessionEvents sessionEvents;
  late AuthCubit cubit;

  setUp(() {
    repository = _RecordingAuthRepository();
    sessionEvents = SessionEvents();
    cubit = AuthCubit(repository, sessionEvents);
  });

  tearDown(() async {
    await cubit.close();
    sessionEvents.dispose();
  });

  Future<void> pumpSignUp(
    WidgetTester tester, {
    SignUpTab tab = SignUpTab.athlete,
  }) async {
    // Phone width, because that is where a row can run out of space, but a
    // tall viewport so the whole form is reachable without scrolling mid-test.
    tester.view.physicalSize = const Size(360, 1600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    final router = GoRouter(
      initialLocation: '/signup',
      routes: [
        GoRoute(
          path: '/signup',
          builder: (context, state) => SignUpScreen(initialTab: tab),
        ),
        GoRoute(
          path: '/verify-email/:email',
          builder: (context, state) => Scaffold(
            body: Text('verificar ${state.pathParameters['email']}'),
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

  Future<void> fillAthleteForm(
    WidgetTester tester, {
    String password = 'Abcdefg1!',
    String? confirmation,
  }) async {
    await tester.enterText(_field('Nome'), 'Joao da Silva');
    await tester.enterText(_field('Username'), 'joaosilva');
    await tester.enterText(_field('Email'), 'joao@provedor.com');
    await tester.enterText(_field('Senha'), password);
    await tester.enterText(
      _field('Confirme sua senha'),
      confirmation ?? password,
    );
    await tester.pump();
  }

  Future<void> tapSubmit(WidgetTester tester) async {
    await tester.ensureVisible(find.text('Cadastrar'));
    await tester.tap(find.text('Cadastrar'));
    await tester.pumpAndSettle();
  }

  testWidgets('does not send the sign-up while the terms are not accepted',
      (tester) async {
    await pumpSignUp(tester);
    await fillAthleteForm(tester);

    await tapSubmit(tester);

    expect(repository.athleteCalls, isEmpty);
    expect(find.text('Aceite os termos para criar sua conta.'), findsOneWidget);
  });

  testWidgets('does not send the sign-up when the two passwords differ',
      (tester) async {
    await pumpSignUp(tester);
    await fillAthleteForm(tester, confirmation: 'Abcdefg2!');
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tapSubmit(tester);

    expect(repository.athleteCalls, isEmpty);
    expect(find.text('As senhas devem ser iguais'), findsOneWidget);
  });

  testWidgets('rejects a weak password with the web message', (tester) async {
    await pumpSignUp(tester);
    await fillAthleteForm(tester, password: 'abcdefgh');
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tapSubmit(tester);

    expect(repository.athleteCalls, isEmpty);
    expect(
      find.text('A senha deve conter pelo menos uma letra maiuscula'),
      findsOneWidget,
    );
  });

  testWidgets('registers the athlete and moves to the verification screen',
      (tester) async {
    await pumpSignUp(tester);
    await fillAthleteForm(tester);
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tapSubmit(tester);

    expect(repository.athleteCalls, hasLength(1));
    expect(repository.athleteCalls.single['email'], 'joao@provedor.com');
    expect(repository.athleteCalls.single['password'], 'Abcdefg1!');
    expect(find.text('verificar joao@provedor.com'), findsOneWidget);
  });

  testWidgets('the club sign-up sends the password and the CNPJ digits',
      (tester) async {
    await pumpSignUp(tester, tab: SignUpTab.company);
    await tester.enterText(_field('Nome'), 'Clube Teste');
    await tester.enterText(_field('Username'), 'clubeteste');
    await tester.enterText(_field('Email'), 'clube@provedor.com');
    await tester.enterText(_field('Senha'), 'Abcdefg1!');
    await tester.enterText(_field('Confirme sua senha'), 'Abcdefg1!');
    await tester.enterText(_field('CNPJ'), '11222333000181');
    await tester.pump();
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tapSubmit(tester);

    expect(repository.companyCalls, hasLength(1));
    final call = repository.companyCalls.single;
    expect(call['cnpj'], '11222333000181');
    expect(call['password'], 'Abcdefg1!');
    expect(find.text('verificar clube@provedor.com'), findsOneWidget);
  });

  testWidgets('the CNPJ field shows the mask while typing', (tester) async {
    await pumpSignUp(tester, tab: SignUpTab.company);

    await tester.enterText(_field('CNPJ'), '11222333000181');
    await tester.pump();

    expect(find.text('11.222.333/0001-81'), findsOneWidget);
  });

  testWidgets('a rejected club sign-up keeps the user on the form',
      (tester) async {
    repository.companyFailure = 'Este CNPJ já está cadastrado';
    await pumpSignUp(tester, tab: SignUpTab.company);
    await tester.enterText(_field('Nome'), 'Clube Teste');
    await tester.enterText(_field('Username'), 'clubeteste');
    await tester.enterText(_field('Email'), 'clube@provedor.com');
    await tester.enterText(_field('Senha'), 'Abcdefg1!');
    await tester.enterText(_field('Confirme sua senha'), 'Abcdefg1!');
    await tester.enterText(_field('CNPJ'), '11222333000181');
    await tester.pump();
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tester.ensureVisible(find.text('Cadastrar'));
    await tester.tap(find.text('Cadastrar'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Este CNPJ já está cadastrado'), findsOneWidget);
    expect(find.text('verificar clube@provedor.com'), findsNothing);
  });
}

Finder _field(String label) {
  return find.ancestor(
    of: find.text(label),
    matching: find.byType(TextFormField),
  );
}

class _RecordingAuthRepository implements AuthRepository {
  final athleteCalls = <Map<String, String>>[];
  final companyCalls = <Map<String, String>>[];
  String? companyFailure;

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
  }) async {
    athleteCalls.add({
      'name': name,
      'username': username,
      'email': email,
      'password': password,
    });
    return 'Cadastro concluído! Verifique seu email';
  }

  @override
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) async {
    companyCalls.add({
      'name': name,
      'username': username,
      'email': email,
      'cnpj': cnpj,
      'password': password,
    });
    final failure = companyFailure;
    if (failure != null) {
      throw AppException(failure);
    }
    return 'Cadastro concluído! Verifique seu email';
  }

  @override
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

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
