import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/opportunities/presentation/cubit/company_opportunities_cubit.dart';

Opportunity _opportunity(int id) => Opportunity(
      id: id,
      title: 'Peneira sub-20',
      description: 'Descricao',
      dateEnd: DateTime.utc(2026, 10, 17),
      companyName: 'Marca Teste',
      companyId: 3,
    );

class _FakeOpportunityRepository implements OpportunityRepository {
  List<Opportunity> companyOpportunities = [];
  AppException? failure;
  final companyIds = <int>[];

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async {
    companyIds.add(companyId);
    if (failure != null) {
      throw failure!;
    }
    return companyOpportunities;
  }

  @override
  Future<List<Opportunity>> getSavedOpportunities() async => const [];

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async => const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async => false;

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async => false;
}

void main() {
  group('CompanyOpportunitiesCubit', () {
    test('loads the opportunities of that company only', () async {
      final repository = _FakeOpportunityRepository()
        ..companyOpportunities = [_opportunity(1), _opportunity(2)];
      final cubit = CompanyOpportunitiesCubit(repository, companyId: 3);

      await cubit.load();

      expect(repository.companyIds, [3]);
      expect(cubit.state.opportunities.map((item) => item.id), [1, 2]);
      expect(cubit.state.hasLoaded, isTrue);
      expect(cubit.state.isLoading, isFalse);
      await cubit.close();
    });

    test('an empty listing still counts as loaded', () async {
      final cubit = CompanyOpportunitiesCubit(
        _FakeOpportunityRepository(),
        companyId: 3,
      );

      await cubit.load();

      expect(cubit.state.opportunities, isEmpty);
      expect(cubit.state.hasLoaded, isTrue);
      expect(cubit.state.loadErrorMessage, isNull);
      await cubit.close();
    });

    test('reports the failure message', () async {
      final repository = _FakeOpportunityRepository()
        ..failure = const AppException('Nao foi possivel carregar.');
      final cubit = CompanyOpportunitiesCubit(repository, companyId: 3);

      await cubit.load();

      expect(cubit.state.loadErrorMessage, 'Nao foi possivel carregar.');
      expect(cubit.state.isLoading, isFalse);
      await cubit.close();
    });
  });
}
