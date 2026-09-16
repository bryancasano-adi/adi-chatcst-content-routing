var SetupService = (function () {
  var schema = {
    Employees: ['employee_id', 'name', 'email', 'active', 'role_id', 'created_at', 'updated_at'],
    Roles: ['role_id', 'role_name', 'description', 'active', 'is_content_manager'],
    RoleAssignments: ['employee_email', 'role_id', 'active', 'effective_from', 'effective_to'],
    FolderAccessMatrix: ['role_id', 'route_key', 'folder_id', 'permission', 'active'],
    MetadataFields: ['field_key', 'label', 'field_type', 'required', 'options_json', 'display_order', 'active', 'help_text'],
    VettingQuestions: ['question_id', 'question_key', 'label', 'question_type', 'required', 'options_json', 'display_order', 'active', 'version', 'show_when_json'],
    Routes: ['route_key', 'conditions_json', 'data_summary_spreadsheet_id', 'data_summary_tab', 'drive_folder_id', 'allowed_roles_json', 'active', 'version'],
    VettingResponses: ['response_id', 'submission_id', 'question_id', 'question_key', 'answer', 'question_version', 'created_at', 'created_by'],
    SubmissionRegistry: ['submission_id', 'submission_version', 'idempotency_token', 'submitted_at', 'submitted_by', 'updated_at', 'updated_by', 'submission_type', 'route_key', 'target_sheet_id', 'target_sheet_tab', 'target_folder_id', 'validation_status', 'sheet_status', 'drive_status', 'acl_status', 'processing_status', 'attachment_count', 'retry_count', 'jira_issue_reference', 'last_error_code', 'last_error_message', 'completed_at', 'metadata'],
    SubmissionFiles: ['submission_file_id', 'submission_id', 'drive_file_id', 'original_filename', 'stored_filename', 'mime_type', 'size_bytes', 'folder_id', 'uploaded_at', 'uploaded_by', 'active'],
    AuditLog: ['audit_id', 'submission_id', 'event_type', 'actor_email', 'occurred_at', 'before_json', 'after_json', 'metadata_json', 'result', 'error_code'],
    Settings: ['key', 'value', 'description']
  };

  function ensureSheet_(book, name, headers) {
    var sheet = book.getSheetByName(name) || book.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#123f75').setFontColor('#ffffff');
      return sheet;
    }

    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
    var missing = headers.filter(function (header) { return existing.indexOf(header) < 0; });
    if (missing.length) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
    return sheet;
  }

  function setupSheets() {
    assertScriptEditor_();
    var book = AccessControlRepository.controlBook();
    Object.keys(schema).forEach(function (name) { ensureSheet_(book, name, schema[name]); });
    return { spreadsheetId: book.getId(), tabs: Object.keys(schema) };
  }

  return { schemas: function () { return schema; }, setupSheets: setupSheets };
})();

/** Adds missing control tabs and headers without replacing governed data. */
function setupSheets() { return SetupService.setupSheets(); }
