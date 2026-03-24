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
- Preserve existing HTTP contracts unless explicitly requested.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Opportunity/subscription/saved API contracts change.
- Skill, subscription, or saved-opportunity ownership moves across modules.
