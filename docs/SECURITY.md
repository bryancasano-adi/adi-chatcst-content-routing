# Security

Google Workspace authenticates users; the application has no passwords. `Session.getActiveUser().getEmail()` is normalized and joined to the active Employees allowlist. Blank, unknown, and inactive identities are denied. Admin functions require ADMIN or CONTENT_MANAGER on the server.

The browser cannot choose actor, role, route, folder, Sheet/tab, permission, status, or audit data. All strings/options/dates/files are revalidated server-side. File extension and MIME type must both be allowed; size/count/total limits are enforced. HTML renders user values through text encoding. Client failures receive stable, friendly messages, while technical details remain in server logs and the registry.

Secrets belong in Script Properties or GitHub environment secrets, never Sheets/client JavaScript/Git. Resource IDs are withheld from ordinary bootstrap and correction responses; file-removal requests use opaque submission-file tokens scoped to the authorized submission. Audit records avoid file contents and credentials.

The deployment owner needs only access required to open configured resources, create/move submitted files, write governed Sheets, and manage folder ACLs if sync is enabled. Ordinary employees generally receive viewer access only where the approved matrix requires it. Protected identities cannot be removed; destructive ACL removal defaults off.

Submission deletion is server-authorized for the original submitter or a privileged role. The browser supplies only the stable submission ID. Files are moved to Drive Trash rather than permanently erased, while registry and audit records remain available for traceability.

Review OAuth scopes, owner access, protected emails, route allowed roles, and GitHub environment approvals before release. Retain audit logs according to company policy and restrict direct edits to control resources.
