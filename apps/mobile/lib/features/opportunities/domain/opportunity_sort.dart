import 'entities/opportunity.dart';

/// Mirrors apps/web's `features/opportunities/utils/opportunityDates.ts`
/// (`compareOpportunityDeadlineAsc`): expired opportunities always sort
/// after open ones; within the same group, the earliest deadline comes
/// first. Used by "Minhas candidaturas" and "Oportunidades salvas", exactly
/// like the web pages that share that helper.
int compareOpportunityDeadlineAsc(Opportunity first, Opportunity second) {
  final firstExpired = isOpportunityDeadlineExpired(first.dateEnd);
  final secondExpired = isOpportunityDeadlineExpired(second.dateEnd);

  if (firstExpired != secondExpired) {
    return firstExpired ? 1 : -1;
  }

  return first.dateEnd.compareTo(second.dateEnd);
}

/// Whether [dateEnd] is before today, compared by calendar day — the same
/// rule as the web's `isOpportunityExpired`/`isDateOnOrAfterToday` pair (a
/// deadline that falls today is not expired yet).
bool isOpportunityDeadlineExpired(DateTime dateEnd, {DateTime? now}) {
  final today = now ?? DateTime.now();
  final endDay = DateTime(dateEnd.year, dateEnd.month, dateEnd.day);
  final todayDay = DateTime(today.year, today.month, today.day);
  return endDay.isBefore(todayDay);
}
