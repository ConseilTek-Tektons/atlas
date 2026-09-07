# Atlas operations

`GET /api/health` reports application and dependency readiness without returning secret values. App Runner and App Service consume it for unhealthy-instance replacement.

## Managed-service model

Managed web compute, PostgreSQL, Redis, and private object storage reduce host, orchestrator, database-patch, backup, replacement, and scaling maintenance. Operators remain responsible for permission design, content governance, restore testing, costs, dependencies, and final provider configuration.

## Release sequence

1. Pass code, test, infrastructure, and container gates; scan/sign one image and deploy by digest.
2. Back up PostgreSQL and apply forward-compatible migrations.
3. Verify OIDC, page/version creation, review flow, and attachment access.
4. Run a no-leak test: a restricted page must not affect search titles, snippets, counts, or an assistant answer.
5. Shift traffic and monitor access denials, search latency, stale review count, PostgreSQL connections, and IdP callbacks.

Test point-in-time recovery and attachment restoration quarterly. Rebuild search indexes from PostgreSQL, preserve version history, and audit all temporary access grants.
