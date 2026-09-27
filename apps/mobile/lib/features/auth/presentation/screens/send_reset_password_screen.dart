import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/auth_validation.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_action.dart';
import '../widgets/auth_scaffold.dart';

/// Step 1 of "Esqueceu sua senha?", the phone version of the web's
/// `SendResetPassword` page: one e-mail field, a "Confirmar" button and a
/// resend link behind a 60 second countdown (`useResendTimer`).
///
/// Unlike the verification screens, the web's resend here really does re-submit
/// the form, so the countdown is reproduced as is.
class SendResetPasswordScreen extends StatefulWidget {
  const SendResetPasswordScreen({super.key});

  @override
  State<SendResetPasswordScreen> createState() =>
      _SendResetPasswordScreenState();
}

class _SendResetPasswordScreenState extends State<SendResetPasswordScreen> {
  static const _resendCooldown = 60;

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  Timer? _timer;
  int _secondsLeft = 0;

  bool get _canResend => _secondsLeft == 0;

  @override
  void dispose() {
    _timer?.cancel();
    _emailController.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _secondsLeft = _resendCooldown);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) {
        timer.cancel();
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final cubit = context.read<AuthCubit>();
    final email = _emailController.text.trim();
    final sent = await runAuthAction(
      context,
      () => cubit.sendResetPassword(email: email),
    );
    if (!mounted) {
      return;
    }
    _startCooldown();
    if (sent) {
      context.push('/verify-reset-token/${Uri.encodeComponent(email)}');
    }
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
                      description: 'Insira seu e-mail para redefinir sua senha',
                    ),
                    const SizedBox(height: 28),
                    TextFormField(
                      controller: _emailController,
                      autocorrect: false,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.done,
                      enabled: !state.isLoading,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: const InputDecoration(
                        labelText: 'E-mail',
                        hintText: 'weunite@exemplo.com',
                        prefixIcon: Icon(Icons.alternate_email),
                        helperText: 'Você receberá um código de verificação',
                      ),
                      validator: validateEmail,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed:
                          state.isLoading || !_canResend ? null : _submit,
                      child: state.isLoading
                          ? const SizedBox.square(
                              dimension: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Confirmar'),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: TextButton(
                        onPressed:
                            state.isLoading || !_canResend ? null : _submit,
                        child: Text(
                          _canResend
                              ? 'Reenviar e-mail'
                              : 'Reenviar em ${_secondsLeft}s',
                          style: const TextStyle(
                            color: AppColors.mutedForeground,
                          ),
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
