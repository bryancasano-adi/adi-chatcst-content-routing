# Architecture

## Submission path

```text
Workspace user
  → GAS HTML form
  → AuthService (Workspace identity + Employees allowlist + roles)
  → ValidationService (metadata, question options, dates, attachments)
  → VettingService (versioned question configuration)
  → RoutingService (exactly one enabled rule; configured IDs only)
  → SubmissionRegistry + state transitions
  → ┬ DataSummaryRepository → configured Sheet/tab
    └ DriveRepository       → configured folder
  → VettingResponses + SubmissionFiles + AuditLog
  → receipt
```

ACL reconciliation is separate: `RoleAssignments → FolderAccessMatrix → AccessControlService → Advanced Drive permissions`. Preview reads and diffs only. Sync requires ADMIN/CONTENT_MANAGER, protects configured identities, and removes obsolete access only when `ALLOW_ACL_REMOVAL=true`.

## Trust boundaries

The browser supplies metadata, answers, and file bytes. It never supplies actor identity, role, route, spreadsheet, tab, folder, permission, or audit outcome. Every callable workflow authorizes on the server. Client validation improves UX; server validation decides acceptance.

## Consistency model

Sheets and Drive cannot share a transaction. The registry is created first, then independent `sheet_status` and `drive_status` values record progress. A successful half produces `PARTIAL`; privileged retry skips work already marked `SAVED`. Idempotency tokens are checked inside a script lock so duplicate clicks return the original logical submission.

Corrections retain `submission_id`, increment `submission_version`, snapshot before/after state in audit, validate the new route before movement, and use Drive file IDs. Old audit/vetting history is append-only. A route-changing correction never falls back to the master folder.

## Storage migration seam

Repositories isolate Sheets/Drive access from orchestration. A later database migration can replace repository implementations without changing validation, routing, authorization, or UI contracts.

An optional future `ChatCSTIntegrationAdapter` may be introduced at the post-completion boundary. No endpoint, credential, or AI behavior exists today.
