# Requirements and acceptance traceability

This document compares the Jira reference ticket with the repository as reviewed on 2026-09-16. It is an implementation audit, not evidence that live Google Workspace UAT has passed.

Status meanings:

- **Implemented** — present in the codebase with relevant automated coverage.
- **Partial** — core capability exists, but a ticket detail, UI path, or production-level test remains.
- **External gate** — implementation exists but requires CST configuration or live Workspace verification.
- **Superseded** — a later business-owner instruction intentionally changed the ticket requirement.

## Scope decisions that supersede the Jira text

| Jira text                                                        | Current decision                                                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository `adi-chatcst-content-intake`                          | The actual repository is `adi-chatcst-content-routing`. Renaming is not part of this audit.                                                                                           |
| Product name implied ADI ownership                               | The CST-owned product name is **ChatCST Content Routing**. ADI is not shown in product titles.                                                                                        |
| Complete Sample Mode and bootstrap resources                     | Superseded by the explicit request to remove Sample/Dev behavior and make deployment production-only. The application now fails closed until real governed configuration is supplied. |
| `docs/SAMPLE_MODE.md` and a sample-to-production migration guide | Replaced by [PRODUCTION_CONFIGURATION.md](PRODUCTION_CONFIGURATION.md), which documents direct production provisioning.                                                               |

The Jira ticket should be updated so its acceptance criteria and Definition of Done no longer require the removed mode.

## Acceptance criteria

| Criterion                                                              | Status        | Evidence or remaining work                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository runs locally                                                | Implemented   | Vite/React scripts in `package.json`; rendered intake-flow tests. Repository name differs from the Jira text.                                                                                                  |
| Complete Sample Mode works end-to-end                                  | Superseded    | Removed by later owner instruction. Local React uses an isolated in-memory adapter for UX/domain work, but no Sample/Dev production mode or resource bootstrap exists.                                         |
| GAS application is deployable                                          | Implemented   | Structured `gas/` source, manifest, clasp configuration example, and deployment workflow.                                                                                                                      |
| Workspace employee authorization works                                 | External gate | `Session.getActiveUser().getEmail()`, allowlist, role checks, and fail-closed handling are implemented; domain deployment identity behavior requires Workspace UAT.                                            |
| Unauthorized/inactive users are denied                                 | Implemented   | Server authorization plus automated domain tests.                                                                                                                                                              |
| Metadata and vetting questions are configuration-driven                | Implemented   | `MetadataFields` and `VettingQuestions` control tables drive bootstrap and server validation. Local React keeps a checked-in configuration with aligned contracts.                                             |
| Server-side validation is implemented                                  | Implemented   | Metadata, options, dates, conditional questions, MIME/extension, count, per-file size, and total size are revalidated server-side.                                                                             |
| Routing is deterministic and configuration-driven                      | Implemented   | Exactly one active configured route must match; route JSON is health-checked.                                                                                                                                  |
| Data is stored in the correct Data Summary tab                         | External gate | Configured-ID upsert and header verification are implemented; every real route/tab requires live UAT.                                                                                                          |
| Vetting answers are stored separately                                  | Implemented   | Versioned append-only `VettingResponses`.                                                                                                                                                                      |
| Files upload to the configured Drive folder                            | External gate | Folder-ID upload is implemented; permissions and every real destination require live UAT.                                                                                                                      |
| Users cannot specify arbitrary destinations                            | Implemented   | Route and target IDs are server-resolved. Ordinary correction responses no longer disclose target IDs and use opaque file tokens.                                                                              |
| Unknown routes never fall back to root/master                          | Implemented   | No name search or root fallback; unknown/ambiguous routes become `REQUIRES_REVIEW`.                                                                                                                            |
| Submission Registry is implemented                                     | Implemented   | Stable ID, version, phase statuses, targets, retry, Jira reference, and errors are stored.                                                                                                                     |
| Audit trail is implemented                                             | Implemented   | Submission, validation, routing, persistence, correction, Jira, retry, and ACL events are recorded. `ADMIN_CONFIG_CHANGED` is not emitted because configuration editing is intentionally outside the app.      |
| Create workflow works                                                  | External gate | Implemented and locally tested; full GAS/Sheets/Drive path requires live UAT.                                                                                                                                  |
| Correction/update workflow works                                       | External gate | Ownership checks, versioning, file replacement, audit, and upsert are implemented; live route-migration UAT remains.                                                                                           |
| Submission deletion is authorized and auditable                        | External gate | Owner/privileged authorization, Data Summary removal, recoverable Drive trashing, retained registry history, partial status, and audit events are implemented; live Workspace deletion UAT remains.            |
| Route-changing corrections are safe                                    | Implemented   | New Sheet/folder targets are verified before file movement; old Data Summary data is removed only after the new write succeeds.                                                                                |
| Duplicate submissions are protected                                    | Implemented   | Idempotency token reservation occurs under `ScriptLock`.                                                                                                                                                       |
| Concurrent writes are protected                                        | Partial       | Duplicate create reservation is locked. A two-user live concurrency test is required, and simultaneous corrections to the same submission do not yet use optimistic version conflict detection.                |
| Partial failures are represented and retryable                         | Partial       | Independent Sheet/Drive statuses and retry service exist. The production UI does not yet expose a complete retry flow for Drive failures that require reattaching bytes.                                       |
| Jira issue references can be associated                                | Partial       | Privileged audited server method exists. A user-facing Admin/Content Manager action is still required.                                                                                                         |
| Role/user matrix is implemented                                        | Implemented   | Employees, Roles, RoleAssignments, and FolderAccessMatrix tables exist. ACL calculation excludes inactive or ineffective identities.                                                                           |
| ACL preview and synchronization are implemented                        | External gate | Read-only diff and audited sync exist; Advanced Drive API and live permissions require UAT.                                                                                                                    |
| Protected users retain access                                          | Implemented   | Settings, deployment owner, and active Admin/Content Manager identities are protected automatically; removals default off.                                                                                     |
| Admin/Content Manager interface is implemented                         | Partial       | Dashboard counts plus read-only visual Health, Configuration, Audit Log, and ACL Preview views exist. Search/filter, submission detail, correction history, Jira association, and operational retry UI remain. |
| Environment validation works                                           | Implemented   | Read-only checks cover tables, employees, metadata, vetting, routes, targets, headers, folders, ACL mappings, and protected identities.                                                                        |
| Sample bootstrap is safe and production-protected                      | Superseded    | Bootstrap was removed; production cannot create business destinations.                                                                                                                                         |
| Automated/domain tests are implemented and passing                     | Partial       | Domain, rendered UI, GAS syntax, and static invariants are covered. There is no automated Apps Script runtime integration harness for Sheets/Drive/Workspace identity.                                         |
| UAT documentation is provided                                          | Implemented   | [UAT.md](UAT.md); execution evidence is still required before release.                                                                                                                                         |
| Clasp deployment is documented                                         | Implemented   | README and [GOOGLE_APPS_SCRIPT.md](GOOGLE_APPS_SCRIPT.md).                                                                                                                                                     |
| GitHub deployment workflow is implemented                              | Implemented   | Tests, lint, build, secret checks, forced push, stable deployment update, and serialized production execution.                                                                                                 |
| Security documentation is provided                                     | Implemented   | [SECURITY.md](SECURITY.md).                                                                                                                                                                                    |
| Operations runbook is provided                                         | Implemented   | [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md).                                                                                                                                                                |
| Production migration/configuration guide is provided                   | Implemented   | [PRODUCTION_CONFIGURATION.md](PRODUCTION_CONFIGURATION.md).                                                                                                                                                    |
| Real CST configuration replaces temporary values without restructuring | Implemented   | Production metadata, vetting, routes, users, roles, ACLs, file policy, and immutable resource IDs are configuration-driven.                                                                                    |

## Open implementation backlog

These are the remaining code-level gaps against the non-superseded ticket:

1. Add Admin/Content Manager submission search, detail, correction-history, Jira-reference, and retry actions.
2. Add safe reattachment handling for a Drive-side retry; never cache attachment bytes in Sheets or logs.
3. Add optimistic version checking for simultaneous corrections to the same submission.
4. Expand automated coverage for GAS authorization wrappers, environment validation, correction failure phases, ACL role changes, and response redaction.
5. Consider bulk/range writes for high-volume Data Summary and audit workloads after expected volume is confirmed.

## External release gates

The implementation cannot be declared production-accepted until CST supplies and approves:

- final metadata and Data Summary schema;
- final vetting questions and route rules;
- real Data Summary spreadsheet/tab and Drive folder IDs;
- employee, role, and folder-access matrices;
- attachment policy and administrator assignments.

After configuration, execute every item in [UAT.md](UAT.md), retain evidence, and confirm `validateEnvironment()` returns both `valid: true` and `productionReady: true`.
