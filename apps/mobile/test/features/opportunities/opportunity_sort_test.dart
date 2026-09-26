import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/opportunity_sort.dart';

Opportunity _opportunity({required int id, required DateTime dateEnd}) {
  return Opportunity(
    id: id,
    title: 'Oportunidade $id',
    description: 'Descricao $id',
    companyName: 'Clube Teste',
    dateEnd: dateEnd,
  );
}

void main() {
  group('isOpportunityDeadlineExpired', () {
    final now = DateTime(2026, 10, 17, 20);

    test('is not expired on the deadline day', () {
      expect(
        isOpportunityDeadlineExpired(DateTime(2026, 10, 17), now: now),
        isFalse,
      );
    });

    test('is not expired for a future deadline', () {
      expect(
        isOpportunityDeadlineExpired(DateTime(2026, 10, 18), now: now),
        isFalse,
      );
    });

    test('is expired the day after', () {
      expect(
        isOpportunityDeadlineExpired(DateTime(2026, 10, 16), now: now),
        isTrue,
      );
    });
  });

  group('compareOpportunityDeadlineAsc', () {
    test('sorts open opportunities by soonest deadline first', () {
      final soon = _opportunity(id: 1, dateEnd: DateTime(2026, 10, 20));
      final later = _opportunity(id: 2, dateEnd: DateTime(2026, 11, 1));

      final sorted = [later, soon]..sort(compareOpportunityDeadlineAsc);

      expect(sorted, [soon, later]);
    });

    test('always puts expired opportunities last, regardless of date', () {
      final expiredButLaterDate =
          _opportunity(id: 1, dateEnd: DateTime(2020, 1, 1));
      final openWithFarDeadline =
          _opportunity(id: 2, dateEnd: DateTime(2030, 1, 1));

      final sorted = [expiredButLaterDate, openWithFarDeadline]
        ..sort(compareOpportunityDeadlineAsc);

      expect(sorted, [openWithFarDeadline, expiredButLaterDate]);
    });

    test('sorts several expired opportunities by ascending deadline too', () {
      final expiredOlder = _opportunity(id: 1, dateEnd: DateTime(2020, 1, 1));
      final expiredNewer = _opportunity(id: 2, dateEnd: DateTime(2021, 1, 1));
      final open = _opportunity(id: 3, dateEnd: DateTime(2030, 1, 1));

      final sorted = [expiredNewer, open, expiredOlder]
        ..sort(compareOpportunityDeadlineAsc);

      expect(sorted, [open, expiredOlder, expiredNewer]);
    });
  });
}
