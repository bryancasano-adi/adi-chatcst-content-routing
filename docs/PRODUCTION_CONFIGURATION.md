# Production configuration

ChatCST Content Routing is intentionally fail-closed. The deployment requires approved Workspace identities and existing governed Google resources; it never generates business configuration or destination resources.

## Required configuration

1. Set `ENVIRONMENT=production` and `CONTROL_SPREADSHEET_ID` in Script Properties.
2. Run `setupSheets()` as the Apps Script deployment owner.
3. Populate `Employees` with approved, active Workspace identities.
4. Populate `Roles` and `RoleAssignments` using stable role IDs.
5. Populate `VettingQuestions`, including valid JSON option lists and conditional rules.
6. Populate `Routes` with exactly one match for every supported answer combination. Every active route must contain an existing Data Summary spreadsheet ID, tab name, Drive folder ID, allowed-role list, and version.
7. Populate `FolderAccessMatrix` with approved `VIEWER` or `EDITOR` grants.
8. Add `PROTECTED_ACL_EMAILS` to `Settings` as a JSON array containing the deployment owner and identities whose access must never be removed.

## Release gate

Run `validateEnvironment()` before deployment and after every configuration change. Production is ready only when `valid` and `productionReady` are both `true`. The check verifies the environment flag, required tabs, active employees, active and uniquely keyed routes, JSON fields, destination Sheets/tabs, Drive folders, ACL mappings, and protected identities.

Use `previewAclChanges()` before `syncDriveAcl()`. Keep `ALLOW_ACL_REMOVAL=false` unless an approved access-removal change has been reviewed and the protected-identity list has been verified.
