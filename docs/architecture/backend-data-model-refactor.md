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

- User subtype modeling still uses `SINGLE_TABLE` discrimination for role-specific opportunity
  relationships, while profile fields live only in explicit profile tables and classification
  metrics use assigned roles.
- Many entity graphs are bidirectional and cascade broadly, increasing accidental fetch/cascade blast radius.
- Several hot relationships use eager loading, including roles, conversation participants, and message senders.
- Reports preserve `(type, entityId)` storage and API fields while mapping them through the typed
  `ReportTarget` value object.
- Notifications store scalar actor/recipient IDs and actor snapshots, which is acceptable for notification history, but needs clear ownership and indexing.
- `Subscriber`, `SavedOpportunity`, `Like`, `Repost`, and follow relationships should be treated as first-class join entities with uniqueness, timestamps, and repository-owned queries.
- Schema ownership is enforced through Flyway migrations with Hibernate runtime validation; profile
  DTO reads and profile-field persistence now use explicit profile entities.

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

- `#5`: broader scalability and API/Admin/Chat/profile backlog touched by relationship and
  authorization hardening slices.
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
4. Keep role assignments explicit through `tb_user_roles`; role seed data now lives in migrations,
   user-type metrics should classify accounts through roles rather than subtype discrimination, and
   eager loading should be removed where services can fetch roles intentionally.
5. Move athlete-only and company-only fields into profile tables or explicit one-to-one profile entities owned by `users`.
6. Keep `Athlete` and `Company` API behavior stable through DTO/mappers during migration.

### Posts

1. Keep `Post`, `Comment`, `Like`, and `Repost` in the posts module.
2. Make soft-delete semantics consistent for posts and comments.
3. Treat post likes and reposts as independent interaction entities with database uniqueness,
   timestamps, and explicit repository-owned cleanup.
4. Keep feed and comment pagination database-backed; feed projections should fetch required author/repost data explicitly.
5. Avoid serializing entities directly; remove Jackson cycle annotations once DTO boundaries cover responses.

### Opportunities

1. Keep `Opportunity`, `Skill`, `Subscriber`, and `SavedOpportunity` in the opportunities module.
2. Treat `Subscriber` and `SavedOpportunity` as first-class relationship entities with unique constraints over athlete/opportunity.
3. Keep opportunity skill membership as a join table owned by opportunities.
4. Preserve `OpportunityDTO` as the web/mobile/admin read model, including derived subscriber totals.

### Follow

1. Keep follow relationships in the follow module.
2. Enforce uniqueness for follower/followed pairs and prevent self-follow in the service layer.
3. Keep followers/following projections repository-backed, paginated, and counted explicitly.

### Chat

1. Keep conversations and messages in the chat module.
2. Avoid eager participant/sender loading in default entity mappings; fetch exactly what each endpoint needs.
3. Keep message deletion/edit/read semantics explicit in the domain model.
4. Keep websocket identity derived from authenticated session state.
5. Keep `UserStatus` as the API/domain availability value and retain `UserPresence` as the
   persistence record for the user's latest status and timestamp.

### Notifications

1. Keep notifications as delivery records, not as the source of business decisions.
2. Retain actor snapshots for historical display.
3. Keep notification indexes around recipient/read state, recipient/creation time, type, actor, and related entity aligned with migration-owned schema changes.
4. Keep notification trigger decisions in the owning feature service.
5. Scope notification delivery-record access and read-state mutations to the authenticated recipient.

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
- Bind actor-owned follow mutations to authenticated identity before changing relationship state.
- Bind report submissions to the authenticated reporter and keep report queues admin-only.
- Bind user profile mutations to the authenticated account identity while leaving public reads intact.

### Phase 3: User Profile Split

- Introduce athlete and company profile tables while keeping the current single-table subtype model
  available during the compatibility step.
- Backfill profile data from the current single user table before moving repositories or mappers.
- Move writes into explicit athlete/company profile entities after migration-backed backfill has
  established their initial rows.
- Prefer explicit athlete profile entities in user DTO mapping and retire subtype-column read
  fallbacks once profile-table backfill and write coverage are established.
- Fetch split athlete/company profile entities through user read-model queries that map profile DTOs.
- Route athlete profile updates through a profile-specific service boundary while keeping compatibility
  mirroring in the domain model.
- Route required company registration identifiers through a profile-specific service boundary so
  CNPJ writes reach the split company profile entity.
- Add profile-owned repositories so split profile persistence and lookup can move off user-only access
  paths incrementally.
- Centralize athlete profile read compatibility in the profile service instead of DTO mappers.
- Centralize company CNPJ read compatibility in the company profile service while exposing it through
  the existing user response contract.
- Remove unused subtype-only update requests after editable profile fields are consolidated on the
  routed shared user request contract.
- Update repositories and mappers while preserving existing DTO responses.
- Keep auth and profile reads aligned through the shared user profile contract.

### Phase 4: Report Target Stabilization

- Add a stable report target representation while keeping current report endpoints.
- Map `ReportTarget` onto the existing `type` and `entity_id` columns first so DTO and database
  compatibility are preserved while repository paths migrate.
- Route single-target report and moderation lookups through `ReportTarget`, while retaining
  projection-oriented batched queries for admin list views.
- If report targets later move into a dedicated table, backfill it from existing
  `(type, entityId)` values.
- Update admin/report queries to use the new target representation.
- Keep old fields available in DTOs until consumers no longer need them.

### Phase 5: Cleanup And Contract Verification

- Remove obsolete inheritance/discriminator assumptions once profile split is complete, while
  retaining documented subtype mappings required by typed opportunity relationships.
- Keep response serialization DTO-only; domain relationship entities should not carry Jackson cycle
  annotations for endpoint output.
- Keep runtime schema config on migration validation and remove remaining compatibility mappings only
  after their data migrations are proven.
- Run API build/test plus web typecheck for affected contracts.

## Delivery Status

This plan is delivered incrementally so each persistence or authorization boundary can be reviewed
and validated without waiting for the full subtype migration.

### Delivered In PR #16

PR `#16` is merged and delivered the architecture foundation:

- migration baseline, migration smoke coverage, runtime schema transition groundwork, and
  migration-owned role seed data;
- explicit `AccountCredentials`, `Email`, and initial `UserStatus` modeling;
- repository/entity coverage and ownership/query hardening for relationships, feed interactions,
  opportunities, notifications, chat participants, roles, and follows;
- the compatibility-first start of athlete/company profile tables, repositories, services, mirrored
  writes, and athlete profile reads.

### Delivered In PR #17

PR `#17` is merged and delivered:

- migration-owned schema validation and DTO-only entity response cleanup;
- `ReportTarget` compatibility mapping plus typed single-target report/admin queries;
- typed persisted presence status through `UserStatus`;
- company CNPJ validation, persistence, read exposure, and web profile presentation;
- authoritative athlete/company profile DTO reads without legacy subtype-column fallback;
- migration-owned removal of legacy athlete/company profile columns from `tb_user`;
- role-backed athlete/company dashboard counts independent of JPA subtype discrimination;
- lazy default loading for opportunity/company and subscriber associations, with repository-owned read-model graphs;
- removal of company-collection orphan deletion so opportunity lifecycle remains module-owned;
- soft-deleted posts/comments retained as stored content while public reads and new interactions reject deleted content;
- paginated public comment reads for post and profile activity surfaces;
- removal of the unused athlete-only update request;
- authenticated ownership enforcement for follow, report, notification, and user profile mutations.

### In Progress In PR #18

PR `#18` continues the architecture cleanup and manual E2E hardening:

- company opportunity collections remain read-only, so opportunity lifecycle stays owned by the
  opportunities module;
- comment and opportunity public reads use automatic infinite loading instead of manual pagination
  buttons on the main web surfaces;
- public opportunity list endpoints accept bounded `page`/`size` parameters and keep repository-owned
  read-model graphs;
- company opportunity, athlete subscription, and saved-opportunity lists also accept bounded
  pagination and use automatic incremental loading on their web surfaces;
- opportunity subscriber lists accept bounded pagination and load candidates incrementally on the
  owner-facing web surface;
- reported-opportunity admin details load opportunity read models in bulk to avoid lazy-loading failures
  in moderation queues;
- closed report rows remain inspectable but no longer expose pending moderation actions;
- persisted presence treats stale ONLINE rows as offline, clears ONLINE rows when the backend starts,
  and marks websocket disconnects offline;
- protected web routes validate the authenticated account and route back to auth when the backend is
  unavailable or the stored account no longer exists.
- profile follower/following lists reuse the paginated follow API and load additional pages
  automatically inside the modal/drawer surfaces.

### Phase Status

| Phase                                | Status                              | Remaining Work                                                                                 |
| ------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1. Baseline And Safety               | Substantially delivered in PR `#16` | Keep new schema changes migration-owned and retain invariant coverage.                         |
| 2. Relationship Hardening            | Advanced in PRs `#16` through `#18` | Continue remaining cascade/eager-loading audit after moderation and opportunity hardening.     |
| 3. User Profile Split                | Profile-field cutover in PR `#17`   | Retain discriminator only for typed opportunity relationships; classification is role-backed.  |
| 4. Report Target Stabilization       | Hardened further in PR `#18`        | Decide whether a dedicated target table is warranted after current representation is reviewed. |
| 5. Cleanup And Contract Verification | In progress in PR `#18`             | Run final full validation and finish any remaining manual web checks.                          |

## Next Delivery Scope

Continue after PR `#18` with a bounded profile-split and cleanup tranche:

1. Preserve `Athlete` and `Company` discriminator entities for typed opportunity,
   subscription, and saved-opportunity relationships until those contracts are intentionally
   remodeled.
2. Remove any further discriminator assumptions only where replacement paths and data migration
   coverage are proven.
3. Complete remaining profile-contract verification after profile-field persistence moves.
4. Revisit remaining eager fetch/cascade findings from Phase 2 while touching affected aggregates.
5. Run final contract verification only after the compatibility cleanup is complete.
6. Manually verify the web flows hardened in PR `#18`: infinite comment loading, opportunity infinite
   loading across public/company/my/saved/subscriber/follow surfaces, reported opportunities, closed
   report actions, presence expiry, and auth fallback when the API/account is unavailable.

## Commit And Issue Traceability

- Before each new commit, review open issues and include applicable `Refs #...` entries in the commit
  body.
- Use `Closes #...` only after the complete acceptance scope of that issue has been delivered and
  verified.
- PR `#16` is already merged, so its delivered work is linked through issue progress updates rather
  than history rewrites.
- The open commits in PR `#18` carry references to `#5`, `#6`, and the applicable class issues
  (`#11` through `#15`).

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

## Keep This Updated When

- Backend module ownership changes.
- Database migration strategy changes.
- The class diagram or persistence model changes in a durable way.
