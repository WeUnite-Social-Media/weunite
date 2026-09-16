import '../domain/entities/opportunity.dart';
import '../domain/repositories/opportunity_repository.dart';
import 'opportunity_remote_data_source.dart';

class OpportunityRepositoryImpl implements OpportunityRepository {
  const OpportunityRepositoryImpl({
    required OpportunityRemoteDataSource remoteDataSource,
  }) : _remoteDataSource = remoteDataSource;

  final OpportunityRemoteDataSource _remoteDataSource;

  @override
  Future<List<Opportunity>> getOpportunities({
    String? skill,
    int page = 0,
  }) async {
    final opportunities = await _remoteDataSource.getOpportunities(
      skill: skill,
      page: page,
    );
    return opportunities.map((item) => item.toEntity()).toList();
  }

  @override
  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  }) {
    return _remoteDataSource.toggleSaved(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
  }

  @override
  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  }) {
    return _remoteDataSource.toggleSubscription(
      athleteId: athleteId,
      opportunityId: opportunityId,
    );
  }
}
