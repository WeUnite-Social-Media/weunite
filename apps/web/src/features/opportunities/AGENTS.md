## Scope

This feature owns opportunity browsing, creation, saving, and subscriber views on the web client in `apps/web/src/features/opportunities`.

## Responsibilities

- Render opportunity feeds, detail pages, creation/edit forms, and subscriber screens.
- Hold opportunity-specific API adapters, schemas, and feature state.
- Keep skill-selection UI for opportunities aligned with the API contract.

## Does not own

- Backend opportunity rules, ranking, or persistence.
- Profile ownership of company identity and follow data.
- Shared UI primitives or generic search shells.

## Key entrypoints

- `routes/OpportunityRoutes.tsx`
- `pages/Opportunity.tsx`
- `pages/MyOpportunities.tsx`
- `pages/SavedOpportunitiesPage.tsx`
- `pages/OpportunitySubscribersPage.tsx`
- `api/opportunityService.ts`
- `state/useOpportunities.ts`
- `components/CreateOpportunity.tsx`
- `components/EditOpportunity.tsx`
- `components/OpportunityDetailModal.tsx`
- `components/skill/SelectedSkills.tsx`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Opportunity routes or pages change ownership.
- Skill-selection or save/subscribe flows change contract boundaries.
- Opportunity state moves between feature and shared layers.
