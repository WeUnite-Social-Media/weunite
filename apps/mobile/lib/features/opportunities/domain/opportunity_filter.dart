import 'entities/opportunity.dart';

/// Filters opportunities by free text.
///
/// The API has no opportunity search endpoint, so this filters whichever page
/// is already loaded — a pure mirror of apps/web's
/// `features/opportunities/utils/opportunityFilter.ts` (`filterOpportunities`),
/// so both clients answer the same query with the same results: title,
/// description, company name, company username, location and skills, matched
/// case-insensitively against the trimmed search term.
List<Opportunity> filterOpportunities(
  List<Opportunity> opportunities,
  String searchTerm,
) {
  final term = searchTerm.trim().toLowerCase();

  if (term.isEmpty) {
    return opportunities;
  }

  return opportunities.where((opportunity) {
    final haystack = [
      opportunity.title,
      opportunity.description,
      opportunity.companyName,
      opportunity.companyUsername,
      opportunity.location,
      ...opportunity.skills,
    ]
        .whereType<String>()
        .where((value) => value.isNotEmpty)
        .join(' ')
        .toLowerCase();

    return haystack.contains(term);
  }).toList();
}
