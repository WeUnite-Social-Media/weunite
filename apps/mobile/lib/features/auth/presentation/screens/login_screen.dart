import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/auth_validation.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_action.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/password_form_field.dart';

/// Login, following the web's `Login.tsx`: the WeUnite wordmark, the
/// "Bem-Vindo a WeUnite" heading, a username + password pair with the eye
/// toggle, the "Esqueceu sua senha?" link next to the password label, and the
/// club/athlete sign-up links at the bottom.
///
/// The web also shows a "Continue com Google" button. It has no handler, no
/// provider and no endpoint behind it — `/api/auth` has seven routes and none
/// of them is social login — so there is nothing to reuse here and no button is
/// shown rather than a second dead one. See HANDOFF.md.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final cubit = context.read<AuthCubit>();
    // A successful login authenticates the session and the router moves on by
    // itself, so nothing to do here besides reporting a failure.
    await runAuthAction(
      context,
      () => cubit.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AuthWordmark(),
                    const SizedBox(height: 24),
                    Text(
                      'Bem-Vindo a WeUnite',
                      textAlign: TextAlign.center,
                      style: textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Entre para acompanhar atletas, marcas e oportunidades.',
                      textAlign: TextAlign.center,
                      style: textTheme.bodyMedium
                          ?.copyWith(color: AppColors.mutedForeground),
                    ),
                    const SizedBox(height: 28),
                    TextFormField(
                      controller: _usernameController,
                      autocorrect: false,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'Username',
                        hintText: 'WeUnite',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      validator: validateLoginUsername,
                    ),
                    const SizedBox(height: 16),
                    PasswordFormField(
                      controller: _passwordController,
                      label: 'Senha',
                      validator: validateLoginPassword,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: state.isLoading
                            ? null
                            : () => context.push('/send-reset-password'),
                        child: const Text('Esqueceu sua senha?'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: state.isLoading ? null : _submit,
                      child: state.isLoading
                          ? const SizedBox.square(
                              dimension: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Entrar'),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Não tem uma conta?',
                      textAlign: TextAlign.center,
                      style: textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          'Cadastre-se como ',
                          style: textTheme.bodyMedium
                              ?.copyWith(color: AppColors.mutedForeground),
                        ),
                        _SignUpLink(
                          label: 'clube',
                          enabled: !state.isLoading,
                          onTap: () => context.push('/signup?tab=company'),
                        ),
                        Text(
                          ' ou ',
                          style: textTheme.bodyMedium
                              ?.copyWith(color: AppColors.mutedForeground),
                        ),
                        _SignUpLink(
                          label: 'atleta',
                          enabled: !state.isLoading,
                          onTap: () => context.push('/signup'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SignUpLink extends StatelessWidget {
  const _SignUpLink({
    required this.label,
    required this.onTap,
    required this.enabled,
  });

  final String label;
  final VoidCallback onTap;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              decoration: TextDecoration.underline,
            ),
      ),
    );
  }
}
