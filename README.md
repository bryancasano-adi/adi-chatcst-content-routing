# ChatCST Content Routing

Production content intake for governed ChatCST ingestion. Employees submit metadata, configuration-driven vetting answers, and attachments through a Workspace-restricted Google Apps Script web app. The server validates each request, resolves one approved route, writes the configured Data Summary tab, uploads to the configured Drive folder, and records the workflow.

The repository has two maintained surfaces:

- `app/` and `lib/`: the locally runnable React interface and testable domain logic.
- `gas/`: the deployable production application using Workspace identity, Sheets, Drive, LockService, and the Advanced Drive service.

No ChatCST API or AI routing is assumed. Governed resource IDs and rules are configuration, not browser input.

## Local development

Requires Node 22 or 24.

```bash
npm install
npm run dev
npm run format:check
npm run lint
npm test
npm run build
```

The local interface starts with an empty in-memory registry and a configured employee identity. It never calls Google resources. Rendered interaction tests cover navigation, visible validation feedback, and a complete routed submission.

## Production provisioning

1. Create the governed control spreadsheet, Data Summary spreadsheet/tabs, and destination folders.
2. Create a standalone Apps Script project and enable the Advanced Drive API service.
3. Set `ENVIRONMENT=production` and `CONTROL_SPREADSHEET_ID` in Script Properties.
4. Copy `.clasp.json.example` to `.clasp.json`, enter the script ID, and run `npx clasp push`.
5. From the Apps Script editor, run `setupSheets()` once. It adds missing tabs and headers without replacing data.
6. Populate approved employees, roles, role assignments, vetting questions, routes, ACL mappings, and settings.
7. Run `validateEnvironment()` and resolve every failed check.
8. Deploy a Workspace-restricted `/exec` web app that executes as the deployment owner.

The application does not create placeholder destinations or fall back to a master folder. Missing or inaccessible production configuration fails closed. See [production configuration](docs/PRODUCTION_CONFIGURATION.md).

## Script Properties

| Property                 | Required | Purpose                                                     |
| ------------------------ | -------: | ----------------------------------------------------------- |
| `ENVIRONMENT`            |      yes | Must be `production`                                        |
| `CONTROL_SPREADSHEET_ID` |      yes | Governed application/configuration workbook                 |
| `ALLOW_ACL_REMOVAL`      |       no | Defaults to `false`; enable only through an approved change |
| `MAX_FILE_COUNT`         |       no | Defaults to 5                                               |
| `MAX_FILE_SIZE_BYTES`    |       no | Defaults to 10 MiB                                          |
| `MAX_TOTAL_SIZE_BYTES`   |       no | Defaults to 25 MiB                                          |
| `ALLOWED_MIME_TYPES`     |       no | Comma-separated server allowlist                            |
| `ALLOWED_EXTENSIONS`     |       no | Comma-separated server allowlist                            |

Do not store OAuth credentials, deployment tokens, or secrets in Sheets or Git.

## Project map

```text
app/                 React application shell and entry point
app/components/      focused workflow, registry, and admin components
lib/                 shared configuration, types, validation, routing, ACL, state machine
gas/                 Apps Script services, repositories, HTML/CSS/client JavaScript
tests/domain/        pure domain tests
tests/ui/            rendered user-flow tests
tests/integration/   Apps Script syntax and deployment-invariant tests
docs/                architecture, contracts, security, deployment, UAT, operations
.github/workflows/   tested clasp production deployment
```

Detailed guidance: [architecture](docs/ARCHITECTURE.md), [data contract](docs/DATA_CONTRACT.md), [Apps Script setup](docs/GOOGLE_APPS_SCRIPT.md), [security](docs/SECURITY.md), [operations](docs/OPERATIONS_RUNBOOK.md).
