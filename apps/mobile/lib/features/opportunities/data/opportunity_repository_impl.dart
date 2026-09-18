import '../../../core/session/current_user_provider.dart';
import '../domain/entities/opportunity.dart';
import '../domain/repositories/opportunity_repository.dart';
import 'opportunity_remote_data_source.dart';

class OpportunityRepositoryImpl implements OpportunityRepository {
  const OpportunityRepositoryImpl({
    required OpportunityRemoteDataSource remoteDataSource,
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _currentUserProvider = currentUserProvider;

  final OpportunityRemoteDataSource _remoteDataSource;
  final CurrentUserProvider _currentUserProvider;

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async {
    final opportunities = await _remoteDataSource.getOpportunities(page: page);
    return _withViewerFlags(
      opportunities.map((item) => item.toEntity()).toList(),
    );
  }

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async {
    final opportunities = await _remoteDataSource.getCompanyOpportunities(
      companyId: companyId,
      page: page,
    );
    // Same flags as the main listing, so saving and applying work from a
    // company profile exactly like they do on the Opportunities tab.
    return _withViewerFlags(
      opportunities.map((item) => item.toEntity()).toList(),
    );
  }

  Future<List<Opportunity>> _withViewerFlags(
    List<Opportunity> entities,
  ) async {
    final athleteId = _currentUserProvider.currentUserId;
    if (athleteId == null) {
      return entities;
    }

    // The listing endpoint knows nothing about the viewer, so the saved and
    // applied sets are fetched once and merged in here. Both are athlete-only
    // on the API: for a company account they fail, which is not a listing
    // error — the flags just stay false.
    final savedIds = await _idsOrEmpty(
      () async => (await _remoteDataSource.getSavedOpportunities(
        athleteId: athleteId,
      ))
          .map((item) => item.opportunity.id)
          .toSet(),
    );
    final subscribedIds = await _idsOrEmpty(
      () async => (await _remoteDataSource.getSubscriptions(
        athleteId: athleteId,
      ))
          .map((item) => item.opportunity.id)
          .toSet(),
    );

    return entities
        .map(
          (opportunity) => opportunity.copyWith(
            isSaved: savedIds.contains(opportunity.id),
            isSubscribed: subscribedIds.contains(opportunity.id),
          ),
        )
        .toList();
  }

  Future<Set<int>> _idsOrEmpty(Future<Set<int>> Function() load) async {
    try {
      return await load();
    } catch (_) {
      return const <int>{};
    }
  }

  @override
  Future<bool> toggleSaved({required int opportunityId}) async {
    final athleteId = _currentUserProvider.requireUserId();
    await _remoteDataSource.toggleSaved(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
    return _remoteDataSource.isSaved(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
  }

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async {
    final athleteId = _currentUserProvider.requireUserId();
    await _remoteDataSource.toggleSubscription(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
    return _remoteDataSource.isSubscribed(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
  }
}
