import '../entities/opportunity.dart';

abstract class OpportunityRepository {
  Future<List<Opportunity>> getOpportunities({String? skill, int page = 0});
  Future<Opportunity> getOpportunity({required int opportunityId});
  Future<void> createOpportunity({
    required int companyId,
    required String title,
    required String description,
    required String location,
    required DateTime dateEnd,
    required List<String> skills,
  });
  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  });
  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  });
}
