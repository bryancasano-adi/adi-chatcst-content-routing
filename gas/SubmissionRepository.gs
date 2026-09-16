var SubmissionRepository = (function () {
  var tab='SubmissionRegistry';
  function headers_(){var s=sheet_();return s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(String);}
  function sheet_(){var s=AccessControlRepository.controlBook().getSheetByName(tab);if(!s)throw ErrorService.create('CONFIGURATION_ERROR','Missing '+tab);return s;}
  function serialize_(r){return headers_().map(function(h){var value=r[h];return typeof value==='object'?JSON.stringify(value):value===undefined?'':value;});}
  function find(submissionId){return AccessControlRepository.readTable(tab).filter(function(r){return String(r.submission_id)===String(submissionId);})[0]||null;}
  function findByToken(token){return AccessControlRepository.readTable(tab).filter(function(r){return String(r.idempotency_token)===String(token);})[0]||null;}
  function create(record){sheet_().appendRow(serialize_(record));return record;}
  function update(record){var s=sheet_();var values=s.getDataRange().getValues();for(var i=1;i<values.length;i++){if(String(values[i][0])===String(record.submission_id)){s.getRange(i+1,1,1,headers_().length).setValues([serialize_(record)]);return record;}}throw ErrorService.create('UNKNOWN_ERROR','Registry record missing');}
  function dashboard(){var rows=AccessControlRepository.readTable(tab);var counts={total:rows.length,completed:0,failed:0,partial:0,requiresReview:0};rows.forEach(function(r){if(r.processing_status==='COMPLETED')counts.completed++;if(r.processing_status==='FAILED')counts.failed++;if(r.processing_status==='PARTIAL')counts.partial++;if(r.processing_status==='REQUIRES_REVIEW')counts.requiresReview++;});return {counts:counts,recent:rows.slice(-50).reverse()};}
  function listAuthorized(user){return AccessControlRepository.readTable(tab).filter(function(r){return user.privileged||normalizeEmail_(r.submitted_by)===user.email;}).slice(-200).reverse().map(function(r){return {submissionId:r.submission_id,submittedBy:r.submitted_by,updatedAt:r.updated_at,documentTitle:(function(){try{return JSON.parse(r.metadata).document_title||'';}catch(e){return '';}})(),routeKey:r.route_key,processingStatus:r.processing_status,sheetStatus:r.sheet_status,driveStatus:r.drive_status,submissionVersion:r.submission_version,jiraIssueReference:r.jira_issue_reference};});}
  return {find:find,findByToken:findByToken,create:create,update:update,dashboard:dashboard,listAuthorized:listAuthorized};
})();
