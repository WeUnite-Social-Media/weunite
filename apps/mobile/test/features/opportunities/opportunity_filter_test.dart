import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/opportunity_filter.dart';

Opportunity _opportunity({
  required int id,
  String title = 'Peneira sub-20',
  String? description = 'Selecao para atletas de base',
  String companyName = 'Clube Teste',
  String? companyUsername = 'clubeteste',
  String? location = 'Sao Paulo',
  List<String> skills = const ['Velocidade'],
}) {
  return Opportunity(
    id: id,
    title: title,
    description: description,
    companyName: companyName,
    companyUsername: companyUsername,
    location: location,
    dateEnd: DateTime.utc(2026, 10, 17),
    skills: skills,
  );
}

void main() {
  group('filterOpportunities', () {
    test('returns everything for an empty (or blank) search term', () {
      final opportunities = [_opportunity(id: 1), _opportunity(id: 2)];

      expect(filterOpportunities(opportunities, ''), opportunities);
      expect(filterOpportunities(opportunities, '   '), opportunities);
    });

    test('matches the title, case-insensitively', () {
      final opportunity = _opportunity(id: 1, title: 'Peneira Sub-20');

      expect(
        filterOpportunities([opportunity], 'peneira'),
        [opportunity],
      );
    });

    test('matches the description', () {
      final opportunity = _opportunity(
        id: 1,
        description: 'Vagas para lateral direito',
      );

      expect(
        filterOpportunities([opportunity], 'lateral direito'),
        [opportunity],
      );
    });

    test('matches the company name', () {
      final opportunity = _opportunity(id: 1, companyName: 'Vasco da Gama');

      expect(filterOpportunities([opportunity], 'vasco'), [opportunity]);
    });

    test('matches the company username', () {
      final opportunity = _opportunity(id: 1, companyUsername: 'vascodagama');

      expect(filterOpportunities([opportunity], 'vascodagama'), [opportunity]);
    });

    test('matches the location', () {
      final opportunity = _opportunity(id: 1, location: 'Rio de Janeiro');

      expect(filterOpportunities([opportunity], 'rio de janeiro'), [
        opportunity,
      ]);
    });

    test('matches a skill', () {
      final opportunity =
          _opportunity(id: 1, skills: const ['Chute de longa distancia']);

      expect(
        filterOpportunities([opportunity], 'chute de longa'),
        [opportunity],
      );
    });

    test('excludes opportunities that match nothing', () {
      final matching = _opportunity(id: 1, title: 'Peneira sub-20');
      final other = _opportunity(id: 2, title: 'Vaga de analista');

      expect(
        filterOpportunities([matching, other], 'peneira'),
        [matching],
      );
    });

    test('trims the search term before matching', () {
      final opportunity = _opportunity(id: 1, title: 'Peneira sub-20');

      expect(
        filterOpportunities([opportunity], '  peneira  '),
        [opportunity],
      );
    });
  });
}
