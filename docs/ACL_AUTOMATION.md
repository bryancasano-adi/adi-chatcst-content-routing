# ACL automation

Active, effective `RoleAssignments` join to active employees, roles, and `FolderAccessMatrix` rows to produce desired `(email, folder ID, permission)` grants. Allowed permissions are `VIEWER` and `EDITOR`; ordinary viewers should remain read-only.

`previewAclChanges()` reads current permissions through the Advanced Drive service and returns add/change/remove/protected lists without mutation. Run it after every matrix or role change. `syncDriveAcl()` applies the same diff and audits start, each mutation, completion, and failure.

Safeguards:

- ADMIN/CONTENT_MANAGER authorization is mandatory.
- `PROTECTED_ACL_EMAILS` must include required service identities and explicitly protected accounts. The service also protects the deployment owner and active ADMIN/CONTENT_MANAGER identities automatically.
- removal is reported as protected unless `ALLOW_ACL_REMOVAL=true`.
- configured folder IDs are used directly; the master/root folder is never a fallback.
- preview before enabling removals and preserve its output with the change ticket.

Rollback is a forward reconciliation: restore the previous role/matrix rows, preview, then sync. Do not manually strip owner access. If sync partially fails, leave removal disabled, inspect AuditLog, correct permissions/configuration, and rerun; operations are naturally idempotent.
