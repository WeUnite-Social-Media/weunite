# API Opportunities Agent Notes

## Scope

This module owns opportunities, skills association, subscriptions, and saved opportunity flows in `com.weunite.api.opportunities`.

## Responsibilities

- Expose CRUD endpoints for opportunities.
- Expose subscription flows for opportunities.
- Expose save/unsave flows for opportunities.
- Manage opportunity-skill relationships.

## Does not own

- User auth/session.
- Reporting/moderation orchestration.

## Key entrypoints

- `controller/OpportunityController.java`
- `controller/SkillController.java`
- `controller/SubscriberController.java`
- `controller/SavedOpportunityController.java`
- `service/OpportunityService.java`
- `service/SubscribersService.java`
- `service/SavedOpportunityService.java`
- `service/SkillService.java`

## Core use cases

- Create, update, delete, and list opportunities.
- Subscribe/unsubscribe users to opportunities.
- Save/unsave opportunities for athletes.
- Associate skills with opportunities.

## Working rules

- Keep controllers thin and services transactional.
- Keep opportunity domain/repository/mapper logic within this module.
- Keep entity relationships out of transport serialization; expose opportunities and skills through DTO mappings.
- Preserve existing HTTP contracts unless explicitly requested.
- Keep `OpportunityDTO` as the read model for web/mobile/admin opportunity responses, including derived subscriber totals when available.
- Keep opportunity and relationship read-model fetch plans repository-owned so DTO mapping does not rely on lazy-load side effects.
- Keep default company, athlete, and opportunity associations lazy; load read-model graphs only through repository methods that declare their required associations.
- Keep subscription lifecycle service-owned; athlete/opportunity subscription collections are read views, not aggregate owners.
- Keep opportunity lifecycle in this module; company-side collections are read views and must not orphan-remove opportunities.
- Delete subscription rows explicitly before deleting an opportunity instead of relying on collection cascades.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Opportunity/subscription/saved API contracts change.
- Skills listing/search contracts change.
- Skill, subscription, or saved-opportunity ownership moves across modules.
