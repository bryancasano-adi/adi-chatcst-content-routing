# Operations runbook

## Triage

Start with the receipt/submission ID. Find its SubmissionRegistry row, then correlate VettingResponses, SubmissionFiles, and AuditLog. Add the Jira issue key through the privileged workflow. Never ask a user to resubmit blindly when a retry or correction is appropriate.

## Failed or partial processing

- `FAILED`: neither destination is confirmed. Correct the configuration/root cause, then privileged retry.
- `PARTIAL`: one of `sheet_status` or `drive_status` is `SAVED`. Retry performs only the incomplete side; verify no duplicate Data Summary row or file.
- `REQUIRES_REVIEW`: routing was unknown/ambiguous. Correct answers/configuration through the audited correction workflow; never manually route to the master folder.

Technical detail is in `last_error_code`, `last_error_message`, server logs, and AuditLog. Browser messages are deliberately safe.

## Wrong routing correction

Open the authorized correction flow, verify the new route and both targets, then submit. The service increments the version, writes before/after audit, moves files by Drive ID, and upserts the new Data Summary destination. If migration becomes partial, do not delete old state; resolve the recorded phase and retry under a Jira change record.

## Configuration drift

Run `validateEnvironment()` after configuration change and on a schedule/manual operational check. Missing/inaccessible Sheets, tabs, folders, malformed/duplicate routes, orphan mappings, and bad ACL permissions are reported read-only. Restore the governed resource or update its approved immutable ID; do not create a production destination during submission.

## Submission deletion

Users may delete submissions they own; Admin and Content Manager roles may delete authorized records. A successful deletion removes the Data Summary row, moves active Drive files to Trash, and leaves a `DELETED` registry row plus `SUBMISSION_DELETED` audit event. If deletion becomes `PARTIAL`, inspect the recorded phase and retry the same Delete action. Restore a trashed Drive file only through an approved support process and correlate it with the submission audit trail.

## ACL failure

Keep `ALLOW_ACL_REMOVAL=false`, validate protected identities, run preview, and inspect permission/audit errors. Fix owner/API/access issues before syncing again. Reconciliation is idempotent.

## Jira trace

Jira key → registry `jira_issue_reference` → `submission_id` → versioned responses → route and configured targets → Drive file IDs → ordered AuditLog. Jira API integration is intentionally disabled/not implemented.
