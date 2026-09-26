import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/opportunities/presentation/cubit/my_applications_cubit.dart';

Opportunity _opportunity({
  int id = 1,
  DateTime? dateEnd,
  bool saved = false,
}) {
  return Opportunity(
    id: id,
    title: 'Peneira sub-20 #$id',
    description: 'Descricao',
    companyName: 'Marca Teste',
    dateEnd: dateEnd ?? DateTime.utc(2026, 10, 17),
    isSubscribed: true,
    isSaved: saved,
  );
}

class _FakeOpportunityRepository implements OpportunityRepository {
  _FakeOpportunityRepository({this.failLoad = false, this.failToggle = false});

  final bool failLoad;
  final bool failToggle;
  List<Opportunity> subscriptions = [_opportunity()];
  bool subscribedResult = false;
  bool savedResult = true;
  int toggleSubscriptionCalls = 0;
  int toggleSavedCalls = 0;

  @override
  Future<List<Opportunity>> getMySubscriptions() async {
    if (failLoad) {
      throw const AppException('Nao foi possivel carregar as candidaturas.');
    }
    return subscriptions;
  }

  @override
  Future<List<Opportunity>> getSavedOpportunities() async => const [];

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async => const [];

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async {
    toggleSavedCalls++;
    if (failToggle) {
      throw const AppException('Nao foi possivel salvar a oportunidade.');
    }
    return savedResult;
  }

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async {
    toggleSubscriptionCalls++;
    if (failToggle) {
      throw const AppException('Nao foi possivel cancelar a candidatura.');
    }
    return subscribedResult;
  }
}

void main() {
  group('MyApplicationsCubit.load', () {
    blocTest<MyApplicationsCubit, MyApplicationsState>(
      'loads the applications, sorted by deadline (expired last)',
      build: () {
        final soon = _opportunity(id: 1, dateEnd: DateTime(2026, 12, 1));
        final expired = _opportunity(id: 2, dateEnd: DateTime(2020, 1, 1));
        final repository = _FakeOpportunityRepository()
          ..subscriptions = [expired, soon];
        return MyApplicationsCubit(repository);
      },
      act: (cubit) => cubit.load(),
      expect: () => [
        const MyApplicationsState(isLoading: true),
        isA<MyApplicationsState>()
            .having((state) => state.isLoading, 'isLoading', false)
            .having((state) => state.hasLoaded, 'hasLoaded', true)
            .having(
          (state) => state.opportunities.map((o) => o.id).toList(),
          'opportunity ids',
          [1, 2],
        ),
      ],
    );

    blocTest<MyApplicationsCubit, MyApplicationsState>(
      'reports a load error when there is nothing to show',
      build: () => MyApplicationsCubit(
        _FakeOpportunityRepository(failLoad: true),
      ),
      act: (cubit) => cubit.load(),
      expect: () => [
        const MyApplicationsState(isLoading: true),
        const MyApplicationsState(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: 'Nao foi possivel carregar as candidaturas.',
        ),
      ],
    );

    test('an empty subscriptions list yields an empty state', () async {
      final cubit = MyApplicationsCubit(
        _FakeOpportunityRepository()..subscriptions = const [],
      );
      await cubit.load();

      expect(cubit.state.opportunities, isEmpty);
      expect(cubit.state.hasLoaded, isTrue);
      expect(cubit.state.loadErrorMessage, isNull);

      await cubit.close();
    });
  });

  group('MyApplicationsCubit.toggleSubscription', () {
    blocTest<MyApplicationsCubit, MyApplicationsState>(
      'cancelling the application removes it from the list',
      build: () => MyApplicationsCubit(_FakeOpportunityRepository()),
      seed: () => MyApplicationsState(
        hasLoaded: true,
        opportunities: [_opportunity()],
      ),
      act: (cubit) => cubit.toggleSubscription(opportunityId: 1),
      expect: () => [
        MyApplicationsState(
          hasLoaded: true,
          opportunities: [_opportunity()],
          pendingIds: const {1},
        ),
        const MyApplicationsState(hasLoaded: true),
      ],
    );

    blocTest<MyApplicationsCubit, MyApplicationsState>(
      'keeps the item and reports the error when cancelling fails',
      build: () => MyApplicationsCubit(
        _FakeOpportunityRepository(failToggle: true),
      ),
      seed: () => MyApplicationsState(
        hasLoaded: true,
        opportunities: [_opportunity()],
      ),
      act: (cubit) => cubit.toggleSubscription(opportunityId: 1),
      expect: () => [
        MyApplicationsState(
          hasLoaded: true,
          opportunities: [_opportunity()],
          pendingIds: const {1},
        ),
        MyApplicationsState(
          hasLoaded: true,
          opportunities: [_opportunity()],
          actionErrorMessage: 'Nao foi possivel cancelar a candidatura.',
        ),
      ],
    );

    test('ignores a second cancel while the first is in flight', () async {
      final repository = _FakeOpportunityRepository();
      final cubit = MyApplicationsCubit(repository);
      await cubit.load();

      await Future.wait([
        cubit.toggleSubscription(opportunityId: 1),
        cubit.toggleSubscription(opportunityId: 1),
      ]);

      expect(repository.toggleSubscriptionCalls, 1);
      await cubit.close();
    });
  });
}
