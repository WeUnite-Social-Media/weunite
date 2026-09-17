import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/opportunities/presentation/cubit/opportunities_cubit.dart';
import 'package:weunite_mobile/features/opportunities/presentation/widgets/opportunity_card.dart';

Opportunity _opportunity({
  bool saved = false,
  bool subscribed = false,
  int subscribers = 2,
}) {
  return Opportunity(
    id: 1,
    title: 'Peneira sub-20',
    description: 'Descricao',
    companyName: 'Marca Teste',
    dateEnd: DateTime.utc(2026, 10, 17),
    subscribersCount: subscribers,
    isSaved: saved,
    isSubscribed: subscribed,
  );
}

class _FakeOpportunityRepository implements OpportunityRepository {
  _FakeOpportunityRepository({this.throwsOnToggle = false});

  final bool throwsOnToggle;
  List<Opportunity> opportunities = [_opportunity()];
  int toggleSavedCalls = 0;
  int toggleSubscriptionCalls = 0;
  bool savedResult = true;
  bool subscribedResult = true;

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async =>
      opportunities;

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async {
    toggleSavedCalls++;
    if (throwsOnToggle) {
      throw const AppException('Nao foi possivel salvar a oportunidade.');
    }
    return savedResult;
  }

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async {
    toggleSubscriptionCalls++;
    if (throwsOnToggle) {
      throw const AppException('Nao foi possivel enviar a candidatura.');
    }
    return subscribedResult;
  }
}

void main() {
  group('OpportunitiesCubit.toggleSaved', () {
    blocTest<OpportunitiesCubit, OpportunitiesState>(
      'marks the opportunity as saved and keeps what the API reports',
      build: () => OpportunitiesCubit(_FakeOpportunityRepository()),
      seed: () => OpportunitiesState(
        hasLoaded: true,
        opportunities: [_opportunity()],
      ),
      act: (cubit) => cubit.toggleSaved(opportunityId: 1),
      expect: () => [
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(saved: true)],
          pendingIds: const {1},
        ),
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(saved: true)],
        ),
      ],
    );

    blocTest<OpportunitiesCubit, OpportunitiesState>(
      'reverts and reports the error when the API call fails',
      build: () =>
          OpportunitiesCubit(_FakeOpportunityRepository(throwsOnToggle: true)),
      seed: () => OpportunitiesState(
        hasLoaded: true,
        opportunities: [_opportunity()],
      ),
      act: (cubit) => cubit.toggleSaved(opportunityId: 1),
      expect: () => [
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(saved: true)],
          pendingIds: const {1},
        ),
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity()],
          actionErrorMessage: 'Nao foi possivel salvar a oportunidade.',
        ),
      ],
    );

    test('ignores a second tap while the first is in flight', () async {
      final repository = _FakeOpportunityRepository();
      final cubit = OpportunitiesCubit(repository);
      await cubit.loadOpportunities();

      await Future.wait([
        cubit.toggleSaved(opportunityId: 1),
        cubit.toggleSaved(opportunityId: 1),
      ]);

      expect(repository.toggleSavedCalls, 1);
      await cubit.close();
    });
  });

  group('OpportunitiesCubit.toggleSubscription', () {
    blocTest<OpportunitiesCubit, OpportunitiesState>(
      'applies and bumps the applicant counter',
      build: () => OpportunitiesCubit(_FakeOpportunityRepository()),
      seed: () => OpportunitiesState(
        hasLoaded: true,
        opportunities: [_opportunity()],
      ),
      act: (cubit) => cubit.toggleSubscription(opportunityId: 1),
      expect: () => [
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(subscribed: true, subscribers: 3)],
          pendingIds: const {1},
        ),
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(subscribed: true, subscribers: 3)],
        ),
      ],
    );

    blocTest<OpportunitiesCubit, OpportunitiesState>(
      'withdrawing decreases the applicant counter',
      build: () => OpportunitiesCubit(
        _FakeOpportunityRepository()..subscribedResult = false,
      ),
      seed: () => OpportunitiesState(
        hasLoaded: true,
        opportunities: [_opportunity(subscribed: true, subscribers: 3)],
      ),
      act: (cubit) => cubit.toggleSubscription(opportunityId: 1),
      expect: () => [
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(subscribers: 2)],
          pendingIds: const {1},
        ),
        OpportunitiesState(
          hasLoaded: true,
          opportunities: [_opportunity(subscribers: 2)],
        ),
      ],
    );
  });

  group('isOpportunityClosed', () {
    final deadline = DateTime(2026, 10, 17);

    test('is open on the deadline day', () {
      expect(
        isOpportunityClosed(deadline, now: DateTime(2026, 10, 17, 20)),
        isFalse,
      );
    });

    test('is closed the day after', () {
      expect(
        isOpportunityClosed(deadline, now: DateTime(2026, 10, 18, 8)),
        isTrue,
      );
    });
  });
}
