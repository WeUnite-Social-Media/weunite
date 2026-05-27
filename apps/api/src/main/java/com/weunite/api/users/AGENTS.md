# API Users Agent Notes

## Scope

This module owns user account and profile domain flows in `com.weunite.api.users`.

## Responsibilities

- Expose user profile endpoints and user lookup flows.
- Manage user domain models and role-aware mappings.
- Persist user data and search/list operations.

## Does not own

- Authentication/token lifecycle.
- Follow relationship ownership.
- Report and moderation orchestration.

## Key entrypoints

- `controller/UserController.java`
- `service/UserService.java`
- `service/AthleteProfileService.java`
- `service/CompanyProfileService.java`
- `repository/AthleteProfileRepository.java`
- `repository/CompanyProfileRepository.java`

## Core use cases

- Query current and public user profiles.
- Update user profile data.
- Search and list users.

## Working rules

- Keep profile business rules in service layer.
- Bind profile updates, banner removal, and account deletion to the authenticated user's current
  username resolved from the token user id.
- Keep athlete-specific profile update rules in `AthleteProfileService` while the profile split is
  migrating.
- Keep company registration profile assignment in `CompanyProfileService` and require CNPJ in the
  registration contract while the profile split is migrating.
- Keep athlete and company profile reads sourced from their explicit profile entities through profile
  services; do not reintroduce DTO mapping fallbacks to legacy subtype columns.
- Keep user DTOs, repositories, and mappers in this module.
- Keep editable athlete profile fields on the routed `UpdateUserRequestDTO` contract; CPF is not
  part of the current public profile update request.
- Preserve user API contracts unless explicitly requested.
- Keep athlete characteristics, skills, and company CNPJ in the shared user profile contract so
  auth and profile reads stay aligned.
- Keep the in-progress athlete/company profile split backward-compatible for persistence until
  discriminator and legacy subtype-column removal is intentionally migrated.
- Keep athlete/company profile writes mirrored between current subtype fields and explicit profile
  entities until reads fully move to the profile tables.
- Use profile repositories for direct split-profile persistence or lookup instead of hiding all profile
  access behind `UserRepository`.
- Keep roles lazy by default and use repository-owned role fetch plans for auth, admin, and DTO flows that need them.
- Keep cross-module relationship collections as read views unless users truly own the child lifecycle.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- User/profile contracts change.
- Ownership boundaries with auth/follow/admin change.
