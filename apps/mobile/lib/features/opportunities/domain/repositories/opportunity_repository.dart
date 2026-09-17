import '../entities/opportunity.dart';

abstract class OpportunityRepository {
  /// Opportunities already flagged with whether the signed-in athlete saved
  /// them (`isSaved`) or applied to them (`isSubscribed`).
  Future<List<Opportunity>> getOpportunities({int page = 0});

  /// Saves or unsaves the opportunity for the signed-in athlete; returns the
  /// resulting state (`true` = saved), read back from the API.
  Future<bool> toggleSaved({required int opportunityId});

  /// Applies to or withdraws from the opportunity for the signed-in athlete;
  /// returns the resulting state (`true` = applied), read back from the API.
  Future<bool> toggleSubscription({required int opportunityId});
}
