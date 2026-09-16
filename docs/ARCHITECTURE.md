# Architecture

## Submission path

```text
Workspace user
  → GAS HTML form
  → AuthService (Workspace identity + Employees allowlist + roles)
  → ConfigService + VettingService (versioned metadata/question configuration)
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

## UI parity contract

The repository intentionally keeps two UI implementations: React for local iteration and native HTML/CSS/JavaScript for Apps Script production. They share one product contract rather than one runtime bundle:

- the same top bar, primary navigation, page hierarchy, workflow steps, field labels, validation messages, status treatments, and responsive breakpoints;
- the same simple-modern design tokens, including the ChatCST red brand color and standalone lightbulb logo;
- the same user-visible intake progression and correction/success states;
- production-only controls may appear in GAS when they require live Workspace services, but they use the same components and visual language.

`tests/integration/gasProject.test.ts` protects the shared class, copy, and token contract. A UI change is incomplete until both `app/` and `gas/` are updated and the React interaction tests plus GAS contract tests pass.

## Consistency model

Sheets and Drive cannot share a transaction. The registry is created first, then independent `sheet_status` and `drive_status` values record progress. A successful half produces `PARTIAL`; privileged retry skips work already marked `SAVED`. Idempotency tokens are checked inside a script lock so duplicate clicks return the original logical submission.

Corrections retain `submission_id`, increment `submission_version`, snapshot before/after state in audit, validate the new route before movement, and use Drive file IDs internally. The browser receives an opaque submission-file token rather than target resource IDs. Old audit/vetting history is append-only. A route-changing correction never falls back to a master folder.

## Storage migration seam

Repositories isolate Sheets/Drive access from orchestration. A later database migration can replace repository implementations without changing validation, routing, authorization, or UI contracts.

An optional future `ChatCSTIntegrationAdapter` may be introduced at the post-completion boundary. No endpoint, credential, or AI behavior exists today.
