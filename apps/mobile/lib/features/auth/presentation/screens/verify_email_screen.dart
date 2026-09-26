import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_action.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/verification_code_field.dart';

/// E-mail verification, the phone version of the web's `VerifyEmail` page.
///
/// `POST /auth/verify-email/{email}` answers with a jwt and the user, so a
/// verified account is logged in straight away and the router moves to the feed
/// — the same behaviour as the web, whose store sets `isAuthenticated` here.
///
/// There is no resend: the API has no endpoint for it. The web shows a
/// "Reenviar código" button, but its handler only restarts a countdown and
/// sends no request, so copying it would give the phone a button that lies.
/// What is shown instead is where to look for the message.
class VerifyEmailScreen extends StatefulWidget {
  const VerifyEmailScreen({required this.email, super.key});

  final String email;

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final cubit = context.read<AuthCubit>();
    // A verified account is authenticated, so the router leaves this screen on
    // its own; only a failure needs reporting.
    await runAuthAction(
      context,
      () => cubit.verifyEmail(
        email: widget.email,
        verificationToken: _codeController.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verificação de email')),
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
                      title: 'Verificação de email',
                      description:
                          'Um código de seis digitos foi enviado ao seu e-mail',
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.email,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 28),
                    VerificationCodeField(
                      controller: _codeController,
                      enabled: !state.isLoading,
                      onCompleted: _submit,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: state.isLoading ? null : _submit,
                      child: state.isLoading
                          ? const SizedBox.square(
                              dimension: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Verificar código'),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Não recebeu o código? Procure também na caixa de spam.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.mutedForeground,
                          ),
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
