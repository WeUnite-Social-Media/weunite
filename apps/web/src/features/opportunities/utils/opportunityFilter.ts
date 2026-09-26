import type { Opportunity } from "@/shared/types/opportunity.types";

/**
 * Filters opportunities by free text. The search box existed but was never
 * wired to anything, so nothing typed in it had any effect.
 *
 * The API has no opportunity search endpoint, so this filters the page that is
 * already loaded — the same rule the mobile app uses, so both clients answer
 * the same query with the same results: title, description, company name and
 * username, location and skills.
 */
export function filterOpportunities(
  opportunities: Opportunity[],
  searchTerm: string,
): Opportunity[] {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return opportunities;
  }

  return opportunities.filter((opportunity) => {
    const haystack = [
      opportunity.title,
      opportunity.description,
      opportunity.company?.name,
      opportunity.company?.username,
      opportunity.location,
      ...(opportunity.skills?.map((skill) => skill.name) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}
