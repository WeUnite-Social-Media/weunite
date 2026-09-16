import '../domain/entities/opportunity.dart';
import '../domain/repositories/opportunity_repository.dart';
import 'opportunity_remote_data_source.dart';

class OpportunityRepositoryImpl implements OpportunityRepository {
  const OpportunityRepositoryImpl({
    required OpportunityRemoteDataSource remoteDataSource,
  })
      : _remoteDataSource = remoteDataSource;

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
  Future<Opportunity> getOpportunity({required int opportunityId}) async {
    final opportunity = await _remoteDataSource.getOpportunity(
      opportunityId: opportunityId,
    );
    return opportunity.toEntity();
  }

  @override
  Future<void> createOpportunity({
    required int companyId,
    required String title,
    required String description,
    required String location,
    required DateTime dateEnd,
    required List<String> skills,
  }) {
    return _remoteDataSource.createOpportunity(
      companyId: companyId,
      title: title,
      description: description,
      location: location,
      dateEnd: dateEnd,
      skills: skills,
    );
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
