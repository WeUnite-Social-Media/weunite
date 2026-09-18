import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/profile/presentation/screens/edit_profile_screen.dart';

void main() {
  group('footDomainOptionsFor', () {
    test('offers the three web options when nothing is set', () {
      expect(footDomainOptionsFor(''), kFootDomainOptions);
    });

    test('keeps the three options when the value is one of them', () {
      expect(footDomainOptionsFor('Esquerdo'), kFootDomainOptions);
    });

    test('keeps a legacy value so editing never drops it', () {
      expect(
        footDomainOptionsFor('Destro'),
        ['Destro', 'Direito', 'Esquerdo', 'Ambos'],
      );
    });
  });
}
