# Google Apps Script setup and deployment

## Prerequisites

- Workspace-owned standalone Apps Script project
- deployment owner with edit access to governed Sheets/folders and permission-management authority
- Advanced Drive API service enabled in Apps Script and its backing Google Cloud project
- organization policy permitting a domain-restricted web app

Install clasp: `npm install --global @google/clasp@3.3.0`, then `clasp login`. Copy `.clasp.json.example` to the ignored `.clasp.json`, set the script ID, and run `clasp push`.

Configure the Script Properties listed in the README. For a fresh production control Sheet, set `CONTROL_SPREADSHEET_ID`, run `setupSheets()` in the editor, then populate the allowlist and configuration. Rerun `setupSheets()` after releases that add a control-table tab or column; it is additive and does not replace governed rows. Setup requires the active user to equal the effective/deployment owner, preventing invocation by ordinary web-app users.

## Test deployment

Use **Deploy → Test deployments → Web app** for release verification. Execute as the deployment owner and restrict access to the company Workspace organization. Verify `Session.getActiveUser().getEmail()` using a real, non-owner employee; Workspace/admin policy can affect identity availability. Test an unauthorized same-domain employee and a content manager.

## Production

Use a stable existing deployment ID so releases retain the `/exec` URL. Do not edit production in the browser after clasp/CI becomes authoritative. Set the Apps Script timezone to `Asia/Manila`.

Required scopes permit Sheets, Drive file/permission operations, and active-user email. Ordinary employees need no direct edit access to the control/Data Summary Sheets and no broad Drive write permission; the execute-as deployment identity performs application operations.

The GitHub workflow requires protected `production` environment secrets: `CLASPRC_JSON`, `GAS_SCRIPT_ID`, and `GAS_DEPLOYMENT_ID`.
