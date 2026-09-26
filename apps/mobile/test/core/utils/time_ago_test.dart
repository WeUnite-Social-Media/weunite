import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/utils/time_ago.dart';

void main() {
  // Same cases the web's getTimeAgo produces, so both clients read alike.
  final now = DateTime(2026, 9, 26, 12);

  String ago(Duration elapsed) => timeAgo(now.subtract(elapsed), now: now);

  group('timeAgo', () {
    test('under a minute is "agora"', () {
      expect(ago(const Duration(seconds: 59)), 'agora');
    });

    test('minutes, singular and plural', () {
      expect(ago(const Duration(minutes: 1)), '1 minuto');
      expect(ago(const Duration(minutes: 59)), '59 minutos');
    });

    test('hours, singular and plural', () {
      expect(ago(const Duration(hours: 1)), '1 hora');
      expect(ago(const Duration(hours: 23)), '23 horas');
    });

    test('days, singular and plural', () {
      expect(ago(const Duration(days: 1)), '1 dia');
      expect(ago(const Duration(days: 6)), '6 dias');
    });

    test('weeks', () {
      expect(ago(const Duration(days: 7)), '1 semana');
      expect(ago(const Duration(days: 21)), '3 semanas');
    });

    test('months', () {
      expect(ago(const Duration(days: 30)), '1 mês');
      expect(ago(const Duration(days: 120)), '4 meses');
    });

    test('years', () {
      expect(ago(const Duration(days: 365)), '1 ano');
      expect(ago(const Duration(days: 365 * 3)), '3 anos');
    });
  });
}
