# Production configuration

ChatCST Content Routing is fail-closed. It requires approved Workspace identities and existing governed Google resources; it does not generate business destinations or fall back to a root folder.

## Provisioning order

1. Create a control spreadsheet and grant the Apps Script deployment owner Editor access.
2. Set Script Properties `ENVIRONMENT=production`, `CONTROL_SPREADSHEET_ID=<raw spreadsheet ID>`, and `ALLOW_ACL_REMOVAL=false`.
3. Push the Apps Script source and run `setupSheets()` as the deployment owner. Run it again after any release that adds a control-table column or tab; it only adds missing structure.
4. Populate the configuration tables below.
5. Create the approved Data Summary tabs and Drive destination folders. Grant the deployment owner the required access.
6. Deploy the web app as the deployment owner with access restricted to the company Workspace organization.
7. Open the app as an `ADMIN` or `CONTENT_MANAGER`, run **Validate environment**, and release only when `valid` and `productionReady` are both `true`.

## Minimum administrator configuration

The first administrator must exist before the web app can open its privileged interface.

`Employees`:

| employee_id        | name         | email                 | active | role_id | created_at         | updated_at         |
| ------------------ | ------------ | --------------------- | ------ | ------- | ------------------ | ------------------ |
| stable employee ID | display name | exact Workspace email | `TRUE` | `ADMIN` | ISO-8601 timestamp | ISO-8601 timestamp |

`Roles`:

| role_id | role_name     | description                      | active | is_content_manager |
| ------- | ------------- | -------------------------------- | ------ | ------------------ |
| `ADMIN` | Administrator | Manages configuration and access | `TRUE` | `TRUE`             |

`RoleAssignments`:

| employee_email        | role_id | active | effective_from        | effective_to          |
| --------------------- | ------- | ------ | --------------------- | --------------------- |
| exact Workspace email | `ADMIN` | `TRUE` | optional `YYYY-MM-DD` | optional `YYYY-MM-DD` |

`Settings`:

| key                    | value                                   | description                                    |
| ---------------------- | --------------------------------------- | ---------------------------------------------- |
| `PROTECTED_ACL_EMAILS` | JSON array of protected email addresses | Identities never removed by ACL reconciliation |

The ACL service also protects the deployment owner and active `ADMIN`/`CONTENT_MANAGER` identities automatically. The setting remains mandatory as an explicit operational safeguard.

## MetadataFields

Metadata is production configuration, not source-code configuration.

| Column          | Contract                                         |
| --------------- | ------------------------------------------------ |
| `field_key`     | Stable unique key; becomes a Data Summary header |
| `label`         | User-facing label                                |
| `field_type`    | `text`, `textarea`, `date`, `select`, or `tags`  |
| `required`      | Boolean                                          |
| `options_json`  | JSON array; required and non-empty for `select`  |
| `display_order` | Numeric sort order                               |
| `active`        | Boolean                                          |
| `help_text`     | Optional user guidance                           |

Every Data Summary destination tab must contain these four system headers followed by every active metadata `field_key`:

```text
submission_id,submission_version,updated_at,updated_by,<active metadata keys...>
```

Changing an active metadata key requires coordinated Data Summary header migration before the configuration row is activated.

## VettingQuestions

| Column           | Contract                                                          |
| ---------------- | ----------------------------------------------------------------- |
| `question_id`    | Stable unique question ID                                         |
| `question_key`   | Stable unique key used by routing conditions                      |
| `label`          | User-facing question                                              |
| `question_type`  | `text`, `textarea`, `date`, or `select`                           |
| `required`       | Boolean                                                           |
| `options_json`   | JSON array of allowed values                                      |
| `display_order`  | Numeric sort order                                                |
| `active`         | Boolean                                                           |
| `version`        | Positive integer retained with every response                     |
| `show_when_json` | Empty or JSON such as `{"key":"document_type","equals":"Policy"}` |

Do not reuse a `question_id` or `question_key` for a different meaning. Create a new version when wording or allowed answers change in a way that affects interpretation.

## Routes

Every supported answer combination must resolve to exactly one active route.

| Column                        | Contract                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| `route_key`                   | Stable unique route key                                     |
| `conditions_json`             | JSON array referencing active vetting `question_key` values |
| `data_summary_spreadsheet_id` | Existing governed spreadsheet ID                            |
| `data_summary_tab`            | Existing tab with all required headers                      |
| `drive_folder_id`             | Existing governed Drive folder ID                           |
| `allowed_roles_json`          | Non-empty JSON role-ID array                                |
| `active`                      | Boolean                                                     |
| `version`                     | Positive integer                                            |

Example JSON shapes:

```json
[
  { "key": "business_function", "equals": "Finance" },
  { "key": "document_type", "equals": "Input" }
]
```

```json
["EMPLOYEE", "CONTENT_MANAGER", "ADMIN"]
```

The deployment owner must be able to write the Data Summary and create/move files in every active destination.

## FolderAccessMatrix

| Column       | Contract                                       |
| ------------ | ---------------------------------------------- |
| `role_id`    | Active role assigned through `RoleAssignments` |
| `route_key`  | Existing active route                          |
| `folder_id`  | Must equal that route's `drive_folder_id`      |
| `permission` | `VIEWER` or `EDITOR`                           |
| `active`     | Boolean                                        |

ACL calculation excludes inactive employees, inactive roles, inactive/expired assignments, and inactive matrix rows. Always run `previewAclChanges()` before `syncDriveAcl()`. Keep removal disabled unless an approved access-removal change explicitly enables it.

## File policy

Optional Script Properties override the secure defaults:

| Property               | Default                                    |
| ---------------------- | ------------------------------------------ |
| `MAX_FILE_COUNT`       | `5`                                        |
| `MAX_FILE_SIZE_BYTES`  | `10485760`                                 |
| `MAX_TOTAL_SIZE_BYTES` | `26214400`                                 |
| `ALLOWED_EXTENSIONS`   | `pdf,docx,xlsx,txt`                        |
| `ALLOWED_MIME_TYPES`   | PDF, DOCX, XLSX, and plain text MIME types |

Extension and MIME type must both pass server validation.

## Release gate

`validateEnvironment()` is read-only. It checks the production flag, control tabs, employee uniqueness, metadata and vetting configuration, route JSON and targets, Data Summary headers, Drive folders, ACL mappings, and protected identities.

After it passes:

1. Submit without attachments and verify Registry, VettingResponses, Data Summary, and AuditLog.
2. Submit with each allowed file type and verify SubmissionFiles and the Drive destination.
3. Perform metadata-only and route-changing corrections.
4. Exercise partial-failure retry under an approved test plan.
5. Preview ACL changes, review every diff, then synchronize only if approved.
