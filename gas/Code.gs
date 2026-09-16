/** Serves the authorized intake application. */
function doGet() {
  try {
    var user = AuthService.authorize(false);
    var template = HtmlService.createTemplateFromFile('Index');
    template.bootstrap = JSON.stringify(getBootstrapData_()).replace(/<\//g, '<\\/');
    template.user = JSON.stringify(user).replace(/<\//g, '<\\/');
    return template.evaluate().setTitle('ChatCST Content Routing').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  } catch (error) {
    var denied = HtmlService.createTemplateFromFile('AccessDenied');
    denied.message = ErrorService.safeMessage(error);
    return denied.evaluate().setTitle('Access Denied');
  }
}

/** Returns non-sensitive form configuration to an authorized user. */
function getBootstrapData() { AuthService.authorize(false); return getBootstrapData_(); }
function getBootstrapData_() {
  return { metadataFields: ConfigService.metadataFields(), vettingQuestions: VettingService.getActiveQuestions(), filePolicy: ConfigService.filePolicy() };
}

/** HTML include helper. */
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }

/** Client-safe callable wrapper for submission creation. */
function submitContent(payload) { try { return SubmissionService.create(payload); } catch (error) { throw ErrorService.forClient(error); } }
/** Client-safe callable wrapper for lookup. */
function getSubmission(submissionId) { try { return SubmissionService.getAuthorized(submissionId); } catch (error) { throw ErrorService.forClient(error); } }
/** Client-safe callable wrapper for corrections. */
function correctSubmission(submissionId, payload) { try { return SubmissionService.correct(submissionId, payload); } catch (error) { throw ErrorService.forClient(error); } }
/** Soft-deletes routed content while preserving its registry and audit trail. */
function deleteSubmission(submissionId) { try { return SubmissionService.remove(submissionId); } catch (error) { throw ErrorService.forClient(error); } }
/** Retries only failed/incomplete persistence operations. */
function retrySubmission(submissionId, attachments) { try { return SubmissionService.retry(submissionId, attachments || []); } catch (error) { throw ErrorService.forClient(error); } }
/** Adds a Jira issue reference; privileged roles only. */
function addJiraReference(submissionId, issueReference) { try { return SubmissionService.addJiraReference(submissionId, issueReference); } catch (error) { throw ErrorService.forClient(error); } }
/** Returns administrative dashboard data. */
function getAdminDashboard() { AuthService.authorize(true); return SubmissionRepository.dashboard(); }
/** Lists records visible to the current user. */
function listSubmissions() { var user=AuthService.authorize(false); return SubmissionRepository.listAuthorized(user); }
/** Lists recent audit events for privileged users. */
function listAuditEvents() { AuthService.authorize(true); return AccessControlRepository.readTable('AuditLog').slice(-200).reverse(); }
/** Returns non-secret governed configuration for privileged inspection. */
function getAdminConfiguration() { AuthService.authorize(true); return { questions:VettingService.getActiveQuestions(), routes:AccessControlRepository.readTable('Routes').map(function(r){return {routeKey:r.route_key,conditions:r.conditions_json,dataSummaryTab:r.data_summary_tab,active:r.active,version:r.version};}), roles:AccessControlRepository.readTable('Roles'), roleAssignments:AccessControlRepository.readTable('RoleAssignments').map(function(r){return {employeeEmail:r.employee_email,roleId:r.role_id,active:r.active};}) }; }
/** Returns a non-mutating ACL reconciliation preview. */
function previewAclChanges() { return AccessControlService.preview(); }
/** Applies a privileged, audited ACL reconciliation. */
function syncDriveAcl() { return AccessControlService.sync(); }
