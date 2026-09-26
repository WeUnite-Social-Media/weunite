import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/verification_code_field.dart';

/// Step 2 of the recovery flow: the web's `VerifyResetToken` page.
///
/// `POST /auth/verify-reset-token/{email}` only checks the code — it does not
/// consume it — and the code itself is then the path segment of
/// `POST /auth/reset-password/{verificationToken}`, which is why the next screen
/// is reached with the code in the route, exactly as the web does.
class VerifyResetTokenScreen extends StatefulWidget {
  const VerifyResetTokenScreen({required this.email, super.key});

  final String email;

  @override
  State<VerifyResetTokenScreen> createState() => _VerifyResetTokenScreenState();
}

class _VerifyResetTokenScreenState extends State<VerifyResetTokenScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    context.read<AuthCubit>().verifyResetToken(
          email: widget.email,
          verificationToken: _codeController.text.trim(),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Redefinição de senha')),
      body: SafeArea(
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            final message = state.errorMessage ?? state.successMessage;
            if (message != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(message)),
              );
            }
            final verified = state.successMessage != null;
            if (message != null) {
              context.read<AuthCubit>().clearMessages();
            }
            if (verified) {
              context.push(
                '/reset-password/'
                '${Uri.encodeComponent(_codeController.text.trim())}',
              );
            }
          },
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
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton(
                        onPressed: state.isLoading ? null : () => context.pop(),
                        child: const Text(
                          'Não recebeu o código? Reenviar',
                          style: TextStyle(color: AppColors.mutedForeground),
                        ),
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
