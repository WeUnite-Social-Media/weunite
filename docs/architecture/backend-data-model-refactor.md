# Backend Data Model Refactor Plan

## Goal

Refactor the API data model behind the current feature modules so the backend can scale without moving business rules out of `apps/api` or breaking existing web/mobile HTTP contracts.

This work tracks project architecture issue `#6` and its class-focused sub-issues.

The target architecture keeps the current module ownership:

- `users`: account, profile, role, athlete, and company models.
- `posts`: posts, comments, likes, and reposts.
- `opportunities`: opportunities, skills, subscriptions, and saved opportunities.
- `follow`: user follow relationships.
- `chat`: conversations, messages, and presence.
- `notifications`: persisted notification delivery state.
- `reports`: report submission data and report review read models.
- `admin`: moderation and statistics orchestration over other modules.
- `common`: cross-cutting security, validation, error handling, storage, mail, config, and migration infrastructure.

## Design Principles

- Preserve API contracts unless a product/API change is explicit.
- Keep controllers thin and services transactional.
- Keep each feature's entities, repositories, DTOs, mappers, and services inside that feature module.
- Do not recreate root-level package-by-layer buckets.
- Prefer explicit DTOs and repository-backed projections over exposing entities or triggering lazy loads in mapper loops.
- Model cross-module relationships deliberately: store real foreign-key associations when lifecycle integrity matters, and store scalar IDs only for event snapshots or intentionally denormalized read data.
- Move schema evolution from `spring.jpa.hibernate.ddl-auto=update` to versioned migrations.
- Keep data migrations idempotent and separated from runtime request handling.

## Current Model Assessment

The current backend already follows the repository's module-by-feature direction, but the persistence model still has scalability risks:

- User subtype modeling uses `SINGLE_TABLE` inheritance for `User`, `Athlete`, and `Company`, which grows sparse columns and couples profile-specific fields to all users.
- Many entity graphs are bidirectional and cascade broadly, increasing accidental fetch/cascade blast radius.
- Several hot relationships use eager loading, including roles, conversation participants, and message senders.
- Reports preserve `(type, entityId)` storage and API fields while mapping them through the typed
  `ReportTarget` value object.
- Notifications store scalar actor/recipient IDs and actor snapshots, which is acceptable for notification history, but needs clear ownership and indexing.
- `Subscriber`, `SavedOpportunity`, `Like`, `Repost`, and follow relationships should be treated as first-class join entities with uniqueness, timestamps, and repository-owned queries.
- Schema ownership is enforced through Flyway migrations with Hibernate runtime validation; profile
  compatibility fields remain until the subtype split cleanup is complete.

## Class Diagram Surface

The refactor should preserve the class-diagram concepts already represented in the backend:

- Identity and access: `AccountCredentials`, `Email`, `Role`, `User`, `Athlete`, and `Company`.
- Social graph: `Follow`.
- Feed: `Post`, `Comment`, `Like`, and `Repost`.
- Opportunities: `Opportunity`, `Skill`, `Subscriber`, and `SavedOpportunity`.
- Communication: `Conversation`, `Message`, `UserStatus`, and persisted presence state.
- Platform events: `Notification`.
- Trust and safety: `Report` plus admin moderation/statistics services.

The persistence shape can change, but these concepts should remain visible in the API domain model and DTO contracts unless the product model changes.

## Issue Mapping

The first wave should reference the class issues below:

- `#6`: architecture parent issue for the class refactor.
- `#8`: `AccountCredentials`, currently represented inside `User` as email, password, verification token, reset token, and token expiry state.
- `#9`: `Email`, currently represented as a validated user field plus `common.mail` delivery infrastructure.
- `#10`: `Role`, represented by `users.domain.Role` with seed data owned by migrations.
- `#11`: `UserStatus`, currently exposed as `UserStatusDTO`/`UserStatusService` and persisted as `UserPresence`.
- `#12`: `User`, the account and shared profile aggregate root.
- `#13`: `Athlete`, currently modeled as a `User` subtype with athlete-specific profile fields and skills.
- `#14`: `Company`, currently modeled as a `User` subtype with company-specific profile fields and opportunities.
- `#15`: `Post`, the feed content aggregate root.

## Target Model Direction

### Shared Persistence Foundation

1. Add versioned database migrations under `apps/api/src/main/resources/db/migration`.
2. Introduce a small `common.persistence` foundation only for generic primitives such as auditable timestamps or base ID conventions.
3. Keep feature-specific base classes out of `common`.
4. Change application config toward migration-owned DDL after the first migration baseline is in place.

### Users

1. Keep `User` as the account aggregate root for authentication, identity, moderation status, privacy, and common profile fields.
2. Introduce `AccountCredentials` as the explicit owner of login email, password hash, verification/reset tokens, and credential lifecycle timestamps.
3. Treat `Email` as a value object or embeddable identity value, not as the mail-delivery service.
4. Keep role assignments explicit through `tb_user_roles`; role seed data now lives in migrations, and eager loading should be removed where services can fetch roles intentionally.
5. Move athlete-only and company-only fields into profile tables or explicit one-to-one profile entities owned by `users`.
6. Keep `Athlete` and `Company` API behavior stable through DTO/mappers during migration.

### Posts

1. Keep `Post`, `Comment`, `Like`, and `Repost` in the posts module.
2. Make soft-delete semantics consistent for posts and comments.
3. Treat post likes and reposts as independent interaction entities with database uniqueness,
   timestamps, and explicit repository-owned cleanup.
4. Keep feed pagination database-backed through projections that fetch required author/repost data explicitly.
5. Avoid serializing entities directly; remove Jackson cycle annotations once DTO boundaries cover responses.

### Opportunities

1. Keep `Opportunity`, `Skill`, `Subscriber`, and `SavedOpportunity` in the opportunities module.
2. Treat `Subscriber` and `SavedOpportunity` as first-class relationship entities with unique constraints over athlete/opportunity.
3. Keep opportunity skill membership as a join table owned by opportunities.
4. Preserve `OpportunityDTO` as the web/mobile/admin read model, including derived subscriber totals.

### Follow

1. Keep follow relationships in the follow module.
2. Enforce uniqueness for follower/followed pairs and prevent self-follow in the service layer.
3. Keep followers/following projections repository-backed.

### Chat

1. Keep conversations and messages in the chat module.
2. Avoid eager participant/sender loading in default entity mappings; fetch exactly what each endpoint needs.
3. Keep message deletion/edit/read semantics explicit in the domain model.
4. Keep websocket identity derived from authenticated session state.
5. Keep `UserStatus` as the API/domain concept for availability and decide whether the persisted class remains `UserPresence` or is renamed during the refactor.

### Notifications

1. Keep notifications as delivery records, not as the source of business decisions.
2. Retain actor snapshots for historical display.
3. Keep notification indexes around recipient/read state, recipient/creation time, type, actor, and related entity aligned with migration-owned schema changes.
4. Keep notification trigger decisions in the owning feature service.

### Reports And Admin

1. Keep `Report` ownership in the reports module.
2. Keep admin moderation orchestration in `admin`, using reports repositories/services instead of duplicating report logic.
3. Stabilize report targets through a small typed target value or polymorphic target table before replacing `(type, entityId)`.
4. Preserve lowercase status strings and resolution metadata in `ReportDTO`.

## Execution Plan

### Phase 1: Baseline And Safety

- Add migration tooling and baseline the current schema.
- Add repository/entity tests for high-risk invariants: unique joins, soft deletes, report status transitions, subscription rules, and role seeding.
- Document every intentional scalar-ID relationship before changing mappings.
- Keep the migration baseline covered by validation tests and require new schema evolution to land in
  versioned migrations.

### Phase 2: Relationship Hardening

- Add missing unique constraints and query indexes for relationship tables.
- Make relationship entities explicit where they are currently only join mechanics.
- Remove unnecessary eager fetches and replace them with repository queries or entity graphs.
- Tighten cascade/orphan-removal rules to match aggregate ownership.

### Phase 3: User Profile Split

- Introduce athlete and company profile tables while keeping the current single-table subtype model
  available during the compatibility step.
- Backfill profile data from the current single user table before moving repositories or mappers.
- Mirror writes into explicit athlete/company profile entities while existing DTO reads still use the
  compatibility subtype fields.
- Prefer explicit athlete profile entities in user DTO mapping while keeping legacy subtype fields as
  compatibility fallback.
- Fetch split athlete/company profile entities through user read-model queries that map profile DTOs.
- Route athlete profile updates through a profile-specific service boundary while keeping compatibility
  mirroring in the domain model.
- Route required company registration identifiers through a profile-specific service boundary so
  CNPJ writes reach the split company profile entity.
- Add profile-owned repositories so split profile persistence and lookup can move off user-only access
  paths incrementally.
- Centralize athlete profile read compatibility in the profile service instead of DTO mappers.
- Update repositories and mappers while preserving existing DTO responses.
- Keep auth and profile reads aligned through the shared user profile contract.

### Phase 4: Report Target Stabilization

- Add a stable report target representation while keeping current report endpoints.
- Map `ReportTarget` onto the existing `type` and `entity_id` columns first so DTO and database
  compatibility are preserved while repository paths migrate.
- If report targets later move into a dedicated table, backfill it from existing
  `(type, entityId)` values.
- Update admin/report queries to use the new target representation.
- Keep old fields available in DTOs until consumers no longer need them.

### Phase 5: Cleanup And Contract Verification

- Remove obsolete inheritance/discriminator assumptions once profile split is complete.
- Keep response serialization DTO-only; domain relationship entities should not carry Jackson cycle
  annotations for endpoint output.
- Keep runtime schema config on migration validation and remove remaining compatibility mappings only
  after their data migrations are proven.
- Run API build/test plus web typecheck for affected contracts.

## Proposed PR Scope

The PR from `refactor/architecture` should be split into reviewable commits:

1. `docs(api): define backend data model refactor plan`
2. `chore(api): add migration baseline`
3. `test(api): cover data model invariants`
4. `refactor(api): harden relationship entities and fetch plans`
5. `refactor(api): split user subtype persistence`
6. `refactor(api): stabilize report targets`
7. `chore(api): enforce migration-owned schema validation`

Each commit should keep HTTP contracts stable or include the matching web/mobile contract update in the same PR.

## Validation

Run these before requesting review:

```bash
pnpm --filter @weunite/api lint
pnpm --filter @weunite/api test
pnpm --filter @weunite/api build
pnpm --filter @weunite/web typecheck
```

Run full validation before merge:

```bash
pnpm check
```

## PR Description Draft

Title:

```text
refactor(api): prepare scalable backend data model architecture
```

Body:

```markdown
## Summary

- documents the target backend data model architecture for the class-diagram-driven refactor
- keeps the current module-by-feature boundaries and API-as-domain-owner rule
- defines phased work for migrations, relationship hardening, user profile split, report target stabilization, and validation

## Principles

- preserve current HTTP contracts unless explicitly changed
- keep controllers thin and services transactional
- keep feature-owned domain/repository/DTO/mapper code inside each module
- move schema evolution from `ddl-auto=update` to versioned migrations

## Validation

- [ ] pnpm --filter @weunite/api lint
- [ ] pnpm --filter @weunite/api test
- [ ] pnpm --filter @weunite/api build
- [ ] pnpm --filter @weunite/web typecheck
- [ ] pnpm check
```

## Keep This Updated When

- Backend module ownership changes.
- Database migration strategy changes.
- The class diagram or persistence model changes in a durable way.
