/// The one place the app keeps authentication rules and their messages.
///
/// Every rule here is a port of what the web already enforces, so a field the
/// browser rejects is rejected on the phone with the *same* text:
///
/// - `apps/web/src/shared/schemas/common/user.schema.ts` (name, username,
///   e-mail, password)
/// - `apps/web/src/features/auth/schemas/login.schema.ts`
/// - `apps/web/src/features/auth/schemas/signUp.schema.ts`
/// - `apps/web/src/features/auth/schemas/recovery.schema.ts`
/// - `apps/web/src/shared/validators/cnpjValidator.ts`
/// - `apps/web/src/features/auth/hooks/usePasswordStrength.ts`
///
/// Sign-up (athlete), club sign-up and password recovery all call into this
/// file — there is deliberately no second copy of the password rule.
library;

/// One row of the requirement checklist shown under a password field.
class PasswordRequirement {
  const PasswordRequirement(this.label, this._test);

  final String label;
  final bool Function(String password) _test;

  bool isMetBy(String password) => _test(password);
}

bool _hasMinLength(String value) => value.length >= 8;
bool _isWithinMaxLength(String value) => value.length <= 30;
bool _hasUpperCase(String value) => RegExp(r'[A-Z]').hasMatch(value);
bool _hasLowerCase(String value) => RegExp(r'[a-z]').hasMatch(value);
bool _hasDigit(String value) => RegExp(r'[0-9]').hasMatch(value);

/// Exactly the symbols `ValidPasswordValidator` accepts. Zod's
/// `/[^A-Za-z0-9]/` is wider, so a password whose only symbol is, say, `~`
/// passes the browser form and is then rejected by the API with a 400. Using
/// the server's set means the phone says what is wrong before sending it.
final RegExp _symbolPattern =
    RegExp(r'''[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]''');

bool _hasSymbol(String value) => _symbolPattern.hasMatch(value);

/// The five criteria the web checks, in the web's order. `passwordSchema`
/// rejects on exactly these, and `usePasswordStrength` scores 20 points each.
const List<PasswordRequirement> kPasswordRequirements = [
  PasswordRequirement('Pelo menos 8 caracteres', _hasMinLength),
  PasswordRequirement('Uma letra maiuscula', _hasUpperCase),
  PasswordRequirement('Uma letra minuscula', _hasLowerCase),
  PasswordRequirement('Um numero', _hasDigit),
  PasswordRequirement('Um simbolo', _hasSymbol),
];

/// Password strength as a percentage, same scoring as `usePasswordStrength`:
/// 20 points per satisfied criterion, 0 for an empty password.
int passwordStrength(String password) {
  if (password.isEmpty) {
    return 0;
  }
  var score = 0;
  for (final requirement in kPasswordRequirements) {
    if (requirement.isMetBy(password)) {
      score += 20;
    }
  }
  return score;
}

/// Name: `nameSchema` (5..100).
String? validateName(String? value) {
  final name = value?.trim() ?? '';
  if (name.length < 5) {
    return 'O nome deve ter no minimo 5 caracteres';
  }
  if (name.length > 100) {
    return 'O nome deve ter no maximo 100 caracteres';
  }
  return null;
}

/// Username: `usernameSchema` (5..30).
String? validateUsername(String? value) {
  final username = value?.trim() ?? '';
  if (username.length < 5) {
    return 'O nome de usuario deve ter no minimo 5 caracteres';
  }
  if (username.length > 30) {
    return 'O nome de usuario deve ter no maximo 30 caracteres';
  }
  return null;
}

/// Login username: `loginSchema` reuses `usernameSchema`, so the same minimum
/// applies before anything is sent.
String? validateLoginUsername(String? value) => validateUsername(value);

/// Login password: `loginSchema` only requires it to be filled — an account
/// created before the current strength rule must still be able to log in, so
/// this must not be stricter than the web.
String? validateLoginPassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'A senha e obrigatoria';
  }
  return null;
}

/// E-mail: `emailSchema`. Zod's e-mail check is a single regex; this is the
/// practical equivalent (a local part, an `@`, a dotted domain, no spaces).
final RegExp _emailPattern = RegExp(
  r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$",
);

String? validateEmail(String? value) {
  final email = value?.trim() ?? '';
  if (email.isEmpty) {
    return 'O e-mail e obrigatorio';
  }
  if (!_emailPattern.hasMatch(email)) {
    return 'E-mail invalido (ex. valido: exemplo@provedor.com)';
  }
  return null;
}

/// New password: `passwordSchema`. The message names the first unmet rule, the
/// same way zod reports the first failing check.
String? validatePassword(String? value) {
  final password = value ?? '';
  if (!_hasMinLength(password)) {
    return 'A senha deve ter pelo menos 8 caracteres';
  }
  if (!_hasUpperCase(password)) {
    return 'A senha deve conter pelo menos uma letra maiuscula';
  }
  if (!_hasLowerCase(password)) {
    return 'A senha deve conter pelo menos uma letra minuscula';
  }
  if (!_hasDigit(password)) {
    return 'A senha deve conter pelo menos um numero';
  }
  if (!_hasSymbol(password)) {
    return 'A senha deve conter pelo menos um simbolo (ex: !@#\$%^&*)';
  }
  // Only the API enforces a ceiling (`ValidPasswordValidator.MAX_LENGTH`); the
  // web's schema has none, so a 31-character password is accepted by the
  // browser form and rejected by the server.
  if (!_isWithinMaxLength(password)) {
    return 'A senha deve ter no maximo 30 caracteres';
  }
  return null;
}

/// Password confirmation. The message is the web's `resetPasswordSchema`
/// refinement. The web sign-up form has no confirmation field at all; a phone
/// keyboard makes a typo much easier to miss, so both sign-ups ask for it here
/// and reuse that same text instead of inventing another one.
String? validatePasswordConfirmation(String? value, String password) {
  if (value == null || value.isEmpty) {
    return 'Confirme sua senha';
  }
  if (value != password) {
    return 'As senhas devem ser iguais';
  }
  return null;
}

/// Verification code: `verifyResetTokenSchema` (6 digits). Used by both the
/// e-mail verification and the password-reset code screens, exactly as the web
/// reuses that one schema in `VerifyEmail` and `VerifyResetToken`.
String? validateVerificationCode(String? value) {
  final code = value?.trim() ?? '';
  if (code.isEmpty) {
    return 'Informe o codigo';
  }
  if (code.length < 6) {
    return 'O codigo deve ter 6 digitos';
  }
  return null;
}

String onlyDigits(String value) => value.replaceAll(RegExp(r'[^\d]'), '');

/// CNPJ: `signUpCompanySchema` + `cnpjValidator`. The API also rejects
/// anything that is not 14 digits (`CreateUserRequestDTO.cnpj`).
String? validateCnpj(String? value) {
  final digits = onlyDigits(value ?? '');
  if (digits.isEmpty) {
    return 'O CNPJ e obrigatorio';
  }
  if (!isValidCnpj(digits)) {
    return 'CNPJ invalido';
  }
  return null;
}

/// Faithful port of the web's `cnpjValidator`: 14 digits, not all the same,
/// and both check digits must match.
bool isValidCnpj(String value) {
  final cnpj = onlyDigits(value);
  if (cnpj.length != 14) {
    return false;
  }
  if (RegExp(r'^(\d)\1+$').hasMatch(cnpj)) {
    return false;
  }

  bool matchesCheckDigit(int length, int digitIndex) {
    final numbers = cnpj.substring(0, length);
    final checkDigits = cnpj.substring(cnpj.length - 2);
    var sum = 0;
    var pos = length - 7;
    for (var i = length; i >= 1; i--) {
      sum += int.parse(numbers[length - i]) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    final result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result == int.parse(checkDigits[digitIndex]);
  }

  return matchesCheckDigit(12, 0) && matchesCheckDigit(13, 1);
}

/// Progressive CNPJ mask, same shape as the web's `formatCNPJ`
/// (`XX.XXX.XXX/0000-XX`), applied while the user types.
String formatCnpj(String value) {
  final numbers = onlyDigits(value);
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 5) {
    return '${numbers.substring(0, 2)}.${numbers.substring(2)}';
  }
  if (numbers.length <= 8) {
    return '${numbers.substring(0, 2)}.${numbers.substring(2, 5)}'
        '.${numbers.substring(5)}';
  }
  if (numbers.length <= 12) {
    return '${numbers.substring(0, 2)}.${numbers.substring(2, 5)}'
        '.${numbers.substring(5, 8)}/${numbers.substring(8)}';
  }
  final capped = numbers.substring(0, 14);
  return '${capped.substring(0, 2)}.${capped.substring(2, 5)}'
      '.${capped.substring(5, 8)}/${capped.substring(8, 12)}'
      '-${capped.substring(12)}';
}
