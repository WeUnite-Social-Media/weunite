# Class Diagram Refactor Plan

## Source Of Truth

- Reference: `Classe WeUnite.pdf`, shared on April 10, 2026.
- Scope: align the Spring Boot API with the class diagram while preserving the repo rule that the API owns domain logic, persistence, auth, moderation, and websocket behavior.
- Refactor goal: reshape the current codebase into the target domain model without turning the rewrite into an uncontrolled delete-and-rebuild effort.

## What The Diagram Defines

- `<<Entity>>`: `Usuario`, `Athlete`, `Company`, `Role`, `Follow`, `Post`, `Comment`, `Like`, `Opportunity`, `Subscriber`, `Skill`, `Conversation`, `Message`, and `Report`.
- `<<boundary>>`: endpoint-facing classes for auth, users, follow, posts, comments, likes, opportunities, subscribers, reports, conversations, and messages.
- `<<control>>`: use-case classes for auth, users, follow, posts, comments, likes, opportunities, subscribers, reports, conversations, and messages.

In implementation terms:

- `<<boundary>>` maps to controllers and request handlers.
- `<<control>>` maps to services or use-case coordinators.
- `<<Entity>>` maps to JPA-backed domain classes.

The diagram also contains a few naming inconsistencies such as `COVERSATION`, `MessagE`, and `birthDate : float`. The refactor should normalize those semantics instead of copying the typos literally.

## Current Baseline

The current backend already contains nearly all diagram aggregates:

- `users`: `User`, `Athlete`, `Company`, `Role`
- `follow`: `Follow`
- `posts`: `Post`, `Comment`, `Like`
- `opportunities`: `Opportunity`, `Subscriber`, `Skill`
- `chat`: `Conversation`, `Message`
- `reports`: `Report`

That means this effort should be treated as a controlled structural refactor, not as a full repository reset.

## Architecture Drift We Need To Fix

| Area | Current State | Target Decision |
| --- | --- | --- |
| Persistence strategy | `spring.jpa.hibernate.ddl-auto=update` is still active. | Replace implicit schema mutation with versioned database migrations before large entity/table changes. |
| User aggregate | `User` already has inheritance for `Athlete` and `Company`, but it also carries moderation and verification state not shown in the diagram. | Keep the inheritance model, then decide which auth/moderation fields stay in core profile state and which move behind explicit extension flows. |
| Role model | Current code stores roles as a `Set<Role>` entity relation. The diagram text is inconsistent, but it also shows a `Role` entity and a `Set<Role>` association. | Normalize on an explicit documented role model during the identity phase and keep the decision stable across auth, profile, and authorization code. |
| Posts module | `Post`, `Comment`, and `Like` exist, but `Repost` and soft-delete state extend beyond the diagram. | Keep the core content aggregate aligned with the diagram and treat repost behavior as either an extension or a removal candidate. |
| Opportunities module | `Opportunity`, `Subscriber`, and `Skill` exist, but `SavedOpportunity` extends beyond the diagram. | Keep the core aggregate aligned with the diagram and retire or isolate saved-opportunity behavior after usage audit. |
| Chat module | `Conversation` and `Message` exist, but presence, edit, delete, and read metadata extend beyond the diagram. | Preserve required product behavior, but isolate non-diagram chat features behind clear extension rules. |
| Reports module | `Report` exists, but moderation resolution data extends beyond the diagram. | Keep report submission aligned with the diagram and move advanced moderation concerns behind admin-specific flows when needed. |
| Cross-module duplication | `createdAt` and `updatedAt` are repeated across many entities. | Introduce a shared persistence primitive such as an auditable mapped superclass during the foundation phase. |

## Target Module Map

- `auth`: login, sign-up, email verification, password reset, and token flows around `User`, `Athlete`, `Company`, and `Role`
- `users`: profile aggregate and search/read/update use cases for `User`, `Athlete`, `Company`, and `Role`
- `follow`: follow request lifecycle for `Follow`
- `posts`: content aggregate for `Post`, `Comment`, and `Like`
- `opportunities`: opportunity aggregate for `Opportunity`, `Subscriber`, and `Skill`
- `chat`: messaging aggregate for `Conversation` and `Message`
- `reports`: report submission aggregate for `Report`

Modules that are not represented in the class diagram should not disappear blindly. They need an explicit decision:

- Keep as documented extensions
- Move behind one of the target aggregates
- Remove after client and data audit

Current likely extension candidates:

- `notifications`
- `admin` moderation/report resolution details
- `chat` presence state
- `SavedOpportunity`
- `Repost`

## Refactor Principles

- Keep the existing package-by-feature layout. Do not collapse the API into root-level layer buckets.
- Treat the class diagram as the canonical domain model, not as a mandate to rename every controller/service to match UML labels exactly.
- Migrate one aggregate at a time. Avoid multi-domain schema surgery in the same implementation PR.
- Do not delete current code until replacement behavior, API impact, and data migration paths are known.
- Anything absent from the diagram must be either retired, explicitly re-approved as an extension, or isolated from the canonical model.
- Add regression coverage before each destructive cut so we can prove that a cleanup PR is actually safe.

## PR Roadmap

### PR 0 - Architecture Baseline

This PR.

- Document the canonical model from the class diagram.
- Record the current codebase drift.
- Define deletion criteria and refactor sequencing.
- Make no runtime behavior changes.

### PR 1 - Persistence Foundation

- Introduce versioned database migrations.
- Add shared auditing primitives for `createdAt` and `updatedAt`.
- Snapshot current HTTP behavior with targeted tests for users, follow, posts, opportunities, chat, and reports.
- Define temporary compatibility rules for fields that will be removed or relocated.

### PR 2 - Identity And Profile Aggregate

- Normalize `User`, `Athlete`, `Company`, and `Role`.
- Lock the inheritance strategy and role ownership model.
- Separate auth-only concerns from core profile concerns where possible.
- Keep `AuthController` and `UserController` thin, with use-case logic in services.

### PR 3 - Social Graph And Reporting Input

- Stabilize `Follow` lifecycle against public/private account rules.
- Stabilize `Report` submission around the canonical aggregate.
- Keep moderation resolution concerns separate from base user profile behavior.

### PR 4 - Content Aggregate

- Rebuild `Post`, `Comment`, and `Like` around the canonical associations.
- Decide whether reposts stay as a documented extension or are removed.
- Standardize comment nesting and deletion semantics.

### PR 5 - Opportunity Aggregate

- Rebuild `Opportunity`, `Subscriber`, and `Skill`.
- Decide whether `SavedOpportunity` stays as an extension or is retired.
- Normalize athlete-skill and company-opportunity associations.

### PR 6 - Chat Aggregate

- Rebuild `Conversation` and `Message`.
- Decide whether presence and advanced message lifecycle flags remain extensions.
- Preserve websocket authorization and sender ownership rules while reshaping the model.

### PR 7 - Cleanup And Contract Reconciliation

- Remove obsolete entities, repositories, services, mappers, and endpoints.
- Update web/mobile contracts if API changes are intentional.
- Remove temporary compatibility shims.
- Update stable docs and AGENTS notes where ownership changed.

## When It Is Safe To Delete Existing Code

Delete immediately only when all of the following are true:

- The class or endpoint is not part of the class diagram.
- It has no active dependency from web, mobile, or another backend module.
- There is no data migration requirement.
- Regression coverage exists for the surrounding feature.

Migrate first and delete later when any of the following are true:

- The feature is absent from the diagram but still exposed to clients.
- The entity holds production data that needs a mapping or archival path.
- The current behavior is entangled with auth, moderation, notifications, or websocket flows.

Keep as a documented extension when the feature is still product-critical but intentionally outside the class diagram.

## Acceptance Criteria For The Full Refactor

- Every canonical diagram aggregate has a clear owning module in `apps/api`.
- Controllers remain thin and diagram control flows live in services/use cases.
- Non-diagram features are either removed or explicitly documented as extensions.
- Schema changes are handled by explicit migrations, not by `ddl-auto=update`.
- Web and mobile continue to consume the API instead of re-owning domain logic.

## Recommended First Implementation Sequence

1. Land this planning PR and agree that the class diagram is the canonical model.
2. Add migration support and regression coverage before moving entities.
3. Refactor identity first because `User`, `Athlete`, `Company`, and `Role` sit under most other aggregates.
4. Move outward from shared core to dependent domains: follow, posts, opportunities, chat, and reports.
5. Delete or isolate extension features only after their owning aggregate has been stabilized.
