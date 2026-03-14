# Admin And Moderation

## Web admin surface

The web app owns the admin dashboard, admin route tree, moderation views, and admin-only client calls under `apps/web/src/features/admin`.

Primary responsibilities:

- dashboard overview and statistics views
- user management views
- report review and moderation flows
- admin-only route protection on the web side

## Backend admin surface

The API owns admin-only orchestration under `com.weunite.api.admin`.

Primary responsibilities:

- admin-only endpoints
- moderation actions that resolve or dismiss reported content
- coordination with reporting data owned by the reports module

## Boundaries

- The web admin feature does not own moderation business rules.
- The API admin module does not own report submission persistence.
- Shared reporting entities and DTOs live in the reports module, not in the web app.
