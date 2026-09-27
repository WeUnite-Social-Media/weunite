import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/auth/domain/auth_validation.dart';

/// These lock the rules to what the web enforces: `user.schema.ts`,
/// `signUp.schema.ts`, `recovery.schema.ts`, `cnpjValidator.ts` and
/// `usePasswordStrength.ts`. If one of them ever changes on the web, the
/// matching test here should fail rather than the two clients drifting apart.
void main() {
  group('validateName', () {
    test('rejects fewer than 5 characters, like nameSchema', () {
      expect(validateName('Ana'), 'O nome deve ter no minimo 5 caracteres');
    });

    test('rejects more than 100 characters', () {
      expect(
        validateName('a' * 101),
        'O nome deve ter no maximo 100 caracteres',
      );
    });

    test('accepts a normal name', () {
      expect(validateName('Joao da Silva'), isNull);
    });
  });

  group('validateUsername', () {
    test('rejects fewer than 5 characters', () {
      expect(
        validateUsername('bob'),
        'O nome de usuario deve ter no minimo 5 caracteres',
      );
    });

    test('rejects more than 30 characters', () {
      expect(
        validateUsername('u' * 31),
        'O nome de usuario deve ter no maximo 30 caracteres',
      );
    });

    test('login reuses the same rule, as loginSchema does', () {
      expect(validateLoginUsername('bob'), isNotNull);
      expect(validateLoginUsername('joaosilva'), isNull);
    });
  });

  group('validateLoginPassword', () {
    test('only requires a value: an older account must still get in', () {
      expect(validateLoginPassword(''), 'A senha e obrigatoria');
      expect(validateLoginPassword('short'), isNull);
    });
  });

  group('validateEmail', () {
    test('rejects an empty value', () {
      expect(validateEmail(''), 'O e-mail e obrigatorio');
    });

    test('rejects a value without a dotted domain', () {
      const expected = 'E-mail invalido (ex. valido: exemplo@provedor.com)';
      expect(validateEmail('joao@provedor'), expected);
      expect(validateEmail('joao'), expected);
      expect(validateEmail('joao silva@provedor.com'), expected);
    });

    test('accepts a valid address', () {
      expect(validateEmail('joaosilva@provedor.com'), isNull);
      expect(validateEmail('joao.silva+tag@mail.co.uk'), isNull);
    });
  });

  group('validatePassword', () {
    test('names the first unmet rule, in the schema order', () {
      expect(
        validatePassword('Ab1!'),
        'A senha deve ter pelo menos 8 caracteres',
      );
      expect(
        validatePassword('abcdefg1!'),
        'A senha deve conter pelo menos uma letra maiuscula',
      );
      expect(
        validatePassword('ABCDEFG1!'),
        'A senha deve conter pelo menos uma letra minuscula',
      );
      expect(
        validatePassword('Abcdefgh!'),
        'A senha deve conter pelo menos um numero',
      );
      expect(
        validatePassword('Abcdefg1'),
        r'A senha deve conter pelo menos um simbolo (ex: !@#$%^&*)',
      );
    });

    test('accepts a password that satisfies all five criteria', () {
      expect(validatePassword('Abcdefg1!'), isNull);
    });

    test('rejects a symbol the API does not accept', () {
      // Zod would take this one; ValidPasswordValidator would not.
      expect(validatePassword('Abcdefg1~'), isNotNull);
    });

    test('rejects more than 30 characters, as the API does', () {
      expect(
        validatePassword('Abcdefg1!${'a' * 25}'),
        'A senha deve ter no maximo 30 caracteres',
      );
    });
  });

  group('validatePasswordConfirmation', () {
    test('uses the web message when the two differ', () {
      expect(
        validatePasswordConfirmation('Abcdefg1!', 'Abcdefg2!'),
        'As senhas devem ser iguais',
      );
    });

    test('asks for a value when it is empty', () {
      const expected = 'Confirme sua senha';
      expect(validatePasswordConfirmation('', 'Abcdefg1!'), expected);
    });

    test('passes when they match', () {
      expect(validatePasswordConfirmation('Abcdefg1!', 'Abcdefg1!'), isNull);
    });
  });

  group('passwordStrength', () {
    test('scores 20 per criterion, like usePasswordStrength', () {
      expect(passwordStrength(''), 0);
      expect(passwordStrength('abc'), 20); // lowercase only
      expect(passwordStrength('abcdefgh'), 40); // length + lowercase
      expect(passwordStrength('Abcdefgh'), 60);
      expect(passwordStrength('Abcdefg1'), 80);
      expect(passwordStrength('Abcdefg1!'), 100);
    });

    test('a full score always means the validator accepts it', () {
      const password = 'Abcdefg1!';
      expect(passwordStrength(password), 100);
      expect(validatePassword(password), isNull);
    });
  });

  group('validateVerificationCode', () {
    test('requires six digits, like verifyResetTokenSchema', () {
      expect(validateVerificationCode(''), 'Informe o codigo');
      expect(validateVerificationCode('123'), 'O codigo deve ter 6 digitos');
      expect(validateVerificationCode('123456'), isNull);
    });
  });

  group('CNPJ', () {
    test('accepts a CNPJ with valid check digits', () {
      // Brazilian federal revenue's own published example.
      expect(isValidCnpj('11.222.333/0001-81'), isTrue);
      expect(validateCnpj('11.222.333/0001-81'), isNull);
    });

    test('rejects wrong check digits, short values and repeated digits', () {
      expect(validateCnpj('11.222.333/0001-82'), 'CNPJ invalido');
      expect(validateCnpj('11222333'), 'CNPJ invalido');
      expect(validateCnpj('11.111.111/1111-11'), 'CNPJ invalido');
      expect(validateCnpj(''), 'O CNPJ e obrigatorio');
    });

    test('formats progressively while typing, like formatCNPJ', () {
      expect(formatCnpj('1'), '1');
      expect(formatCnpj('112'), '11.2');
      expect(formatCnpj('11222'), '11.222');
      expect(formatCnpj('11222333'), '11.222.333');
      expect(formatCnpj('112223330001'), '11.222.333/0001');
      expect(formatCnpj('11222333000181'), '11.222.333/0001-81');
    });

    test('ignores extra digits past the fourteenth', () {
      expect(formatCnpj('112223330001819'), '11.222.333/0001-81');
    });
  });
}
