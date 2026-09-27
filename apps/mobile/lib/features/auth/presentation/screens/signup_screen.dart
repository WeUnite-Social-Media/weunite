import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/auth_validation.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_action.dart';

import '../widgets/password_form_field.dart';
import '../widgets/password_strength_indicator.dart';
import '../widgets/terms_acceptance_field.dart';

/// Sign-up, covering both of the web's tabs in one screen: `SignUp.tsx`
/// (athlete) and `SignUpCompany.tsx` (club). The web switches between them with
/// the `/auth/signup` and `/auth/signupcompany` routes; the phone keeps one
/// screen with a segmented control so the data typed so far survives a switch.
///
/// Fields, order, labels, placeholders and validation messages are the web's.
/// Two things differ on purpose, both flagged in HANDOFF.md:
///
/// - a password confirmation field, which the web sign-up lacks (the web only
///   confirms when resetting). A typo on a phone keyboard is easy to make and
///   impossible to spot behind the dots, and the account cannot be used until
///   the password is right.
/// - the terms checkbox is actually enforced. The web marks it `required`, but
///   that attribute does nothing on its button-based checkbox.
class SignUpScreen extends StatefulWidget {
  const SignUpScreen({this.initialTab = SignUpTab.athlete, super.key});

  final SignUpTab initialTab;

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

enum SignUpTab { athlete, company }

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordConfirmationController = TextEditingController();
  final _cnpjController = TextEditingController();

  late SignUpTab _tab = widget.initialTab;
  bool _acceptedTerms = false;
  bool _termsTouched = false;
  String _password = '';

  bool get _isCompany => _tab == SignUpTab.company;

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _passwordConfirmationController.dispose();
    _cnpjController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _termsTouched = true);
    final isFormValid = _formKey.currentState!.validate();
    if (!isFormValid || !_acceptedTerms) {
      return;
    }

    final cubit = context.read<AuthCubit>();
    final email = _emailController.text.trim();
    final created = await runAuthAction(
      context,
      () => _isCompany
          ? cubit.signUpCompany(
              name: _nameController.text.trim(),
              username: _usernameController.text.trim(),
              email: email,
              // The API wants the 14 digits, not the mask.
              cnpj: onlyDigits(_cnpjController.text),
              password: _passwordController.text,
            )
          : cubit.signUpAthlete(
              name: _nameController.text.trim(),
              username: _usernameController.text.trim(),
              email: email,
              password: _passwordController.text,
            ),
    );
    if (!created || !mounted) {
      return;
    }
    // Replaces the sign-up screen, as the web replaces the tab with
    // `/auth/verify-email/:email`: the account exists now, so going back to a
    // filled-in form would only invite a duplicate attempt.
    context.pushReplacement('/verify-email/${Uri.encodeComponent(email)}');
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Crie sua conta')),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Preencha os dados abaixo para começar',
                    textAlign: TextAlign.center,
                    style: textTheme.bodyMedium
                        ?.copyWith(color: AppColors.mutedForeground),
                  ),
                  const SizedBox(height: 20),
                  SegmentedButton<SignUpTab>(
                    segments: const [
                      ButtonSegment(
                        value: SignUpTab.athlete,
                        label: Text('Atleta'),
                        icon: Icon(Icons.person_outline),
                      ),
                      ButtonSegment(
                        value: SignUpTab.company,
                        label: Text('Clube'),
                        icon: Icon(Icons.apartment_outlined),
                      ),
                    ],
                    selected: {_tab},
                    onSelectionChanged: state.isLoading
                        ? null
                        : (value) => setState(() => _tab = value.first),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _nameController,
                    textInputAction: TextInputAction.next,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Nome',
                      hintText: 'João da Silva',
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                    validator: validateName,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _usernameController,
                    autocorrect: false,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Username',
                      hintText: 'JoaoSilva',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: validateUsername,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    autocorrect: false,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      hintText: 'joaosilva@provedor.com',
                      prefixIcon: Icon(Icons.alternate_email),
                    ),
                    validator: validateEmail,
                  ),
                  const SizedBox(height: 16),
                  PasswordFormField(
                    controller: _passwordController,
                    label: 'Senha',
                    validator: validatePassword,
                    onChanged: (value) => setState(() => _password = value),
                  ),
                  const SizedBox(height: 16),
                  PasswordFormField(
                    controller: _passwordConfirmationController,
                    label: 'Confirme sua senha',
                    validator: (value) => validatePasswordConfirmation(
                      value,
                      _passwordController.text,
                    ),
                  ),
                  const SizedBox(height: 14),
                  PasswordStrengthIndicator(password: _password),
                  if (_isCompany) ...[
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _cnpjController,
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.done,
                      inputFormatters: [_CnpjInputFormatter()],
                      decoration: const InputDecoration(
                        labelText: 'CNPJ',
                        hintText: 'XX.XXX.XXX/0000-XX',
                        prefixIcon: Icon(Icons.apartment_outlined),
                        helperText: 'Digite apenas números. A formatação será '
                            'aplicada automaticamente.',
                        helperMaxLines: 2,
                      ),
                      validator: validateCnpj,
                    ),
                  ],
                  const SizedBox(height: 20),
                  TermsAcceptanceField(
                    value: _acceptedTerms,
                    onChanged: (value) => setState(() {
                      _acceptedTerms = value;
                      _termsTouched = true;
                    }),
                    errorText: _termsTouched && !_acceptedTerms
                        ? 'Aceite os termos para criar sua conta.'
                        : null,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: state.isLoading ? null : _submit,
                    child: state.isLoading
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Cadastrar'),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: TextButton(
                      onPressed: state.isLoading ? null : () => context.pop(),
                      child: const Text('Já se cadastrou? Login'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Applies the web's progressive CNPJ mask while typing and keeps the caret at
/// the end, so the punctuation appearing mid-word never moves the cursor back.
class _CnpjInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final formatted = formatCnpj(newValue.text);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
