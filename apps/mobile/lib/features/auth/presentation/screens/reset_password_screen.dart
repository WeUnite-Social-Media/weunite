import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../domain/auth_validation.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_action.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/password_form_field.dart';
import '../widgets/password_strength_indicator.dart';

/// Step 3 of the recovery flow: the web's `ResetPassword` page. New password,
/// confirmation, eye toggle on both, and the strength bar — all from the same
/// rules the sign-ups use.
///
/// `POST /auth/reset-password/{verificationToken}` returns no session, so this
/// ends on the login screen, exactly as the web navigates back to `/auth`.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({required this.verificationToken, super.key});

  final String verificationToken;

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();
  String _password = '';

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final cubit = context.read<AuthCubit>();
    final done = await runAuthAction(
      context,
      () => cubit.resetPassword(
        verificationToken: widget.verificationToken,
        newPassword: _passwordController.text,
      ),
    );
    if (!done || !mounted) {
      return;
    }
    // Drops the whole recovery stack: the code is spent, so going back into it
    // would only produce "Token invalido".
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Redefinição de senha')),
      body: SafeArea(
        child: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AuthStepHeader(
                      title: 'Redefinição de senha',
                      description: 'Insira sua nova senha',
                    ),
                    const SizedBox(height: 28),
                    PasswordFormField(
                      controller: _passwordController,
                      label: 'Nova senha',
                      enabled: !state.isLoading,
                      validator: validatePassword,
                      onChanged: (value) => setState(() => _password = value),
                    ),
                    const SizedBox(height: 16),
                    PasswordFormField(
                      controller: _confirmationController,
                      label: 'Confirme sua nova senha',
                      enabled: !state.isLoading,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      validator: (value) => validatePasswordConfirmation(
                        value,
                        _passwordController.text,
                      ),
                    ),
                    const SizedBox(height: 16),
                    PasswordStrengthIndicator(password: _password),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: state.isLoading ? null : _submit,
                      child: state.isLoading
                          ? const SizedBox.square(
                              dimension: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Redefinir'),
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
