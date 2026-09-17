import '../entities/opportunity.dart';

abstract class OpportunityRepository {
  Future<List<Opportunity>> getOpportunities({int page = 0});
  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  });
  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  });
}
