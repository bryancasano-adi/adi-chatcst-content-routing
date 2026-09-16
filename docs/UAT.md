# UAT checklist

Use a Workspace-restricted test deployment and approved Workspace accounts.

- Authorized active employee loads the form; unknown, inactive, blank-identity, and unauthorized same-domain users are denied.
- The application never exposes identity switching.
- Every metadata type, required field, option, date, conditional vetting question, and mobile layout works.
- Metadata labels, order, required states, options, and Data Summary headers agree with active `MetadataFields` rows.
- Valid PDF/DOCX/XLSX/TXT attachments upload; bad MIME/extension, oversize, excess count, and excess total fail safely.
- Every configured route writes the intended Data Summary tab and configured folder.
- Unsupported and duplicate routes enter review/failure and never use the master folder.
- Registry, separate versioned VettingResponses, SubmissionFiles, and AuditLog agree with the receipt.
- A double click/network retry yields one logical submission.
- Simulate Drive success/Sheet failure and reverse; confirm PARTIAL and retry skips the completed side.
- Employee corrects own record; another employee cannot. Manager can inspect/correct broader records.
- Metadata-only correction increments version. Route-changing correction verifies new targets, moves by file ID, updates Data Summary, and audits before/after.
- Jira issue reference accepts an issue key and traces ticket → submission → answers → route → Data Summary → files → audit.
- Admin dashboard totals are correct; secrets/resource IDs are not exposed to ordinary users.
- An ordinary correction response exposes opaque file tokens but no target spreadsheet ID, folder ID, or technical error detail.
- Health check detects missing Sheet/tab/folder, malformed/duplicate routes, orphan ACL mappings, and invalid permissions without mutation.
- ACL preview has no side effects; sync adds viewer, changes role, conservatively protects obsolete/protected grants, and is idempotent.
- Two users submit concurrently without overwriting each other.
- Production-like `/exec` deployment retains its existing URL and is Workspace-restricted.

Record the deployment ID, configuration revision, tester identity/role, timestamp, result, submission reference, and evidence link for each executed case. An unchecked list is not release evidence.
