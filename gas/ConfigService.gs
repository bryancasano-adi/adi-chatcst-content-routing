var ConfigService = (function () {
  var defaults = {
    ENVIRONMENT: 'production', ALLOW_ACL_REMOVAL: 'false', MAX_FILE_COUNT: '5', MAX_FILE_SIZE_BYTES: '10485760', MAX_TOTAL_SIZE_BYTES: '26214400',
    ALLOWED_MIME_TYPES: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain', ALLOWED_EXTENSIONS: 'pdf,docx,xlsx,txt'
  };
  var metadata = [
    ['document_title','Document title','text',true],['document_description','Description','textarea',true],['document_date','Document date','date',true],['business_unit','Business unit','select',true,['Finance','Operations','HR','Procurement']],['process_name','Process name','text',true],['document_owner','Document owner','text',true],['source_system','Source system','text',true],['confidentiality','Confidentiality','select',true,['Internal','Confidential','Restricted']],['effective_date','Effective date','date',true],['tags','Tags','tags',false]
  ];
  function get(key, fallback) { return PropertiesService.getScriptProperties().getProperty(key) || defaults[key] || fallback || ''; }
  function requireValue(key) { var value = get(key); if (!value) throw ErrorService.create('CONFIGURATION_ERROR', 'Missing Script Property: ' + key); return value; }
  function jsonSetting(key, fallback) { var settings = AccessControlRepository.readTable('Settings'); var found = settings.filter(function (row) { return row.key === key; })[0]; if (!found || !found.value) return fallback; try { return JSON.parse(found.value); } catch (e) { throw ErrorService.create('CONFIGURATION_ERROR', 'Invalid JSON setting: ' + key); } }
  return {
    get: get, require: requireValue,
    metadataFields: function () { return metadata.map(function (x) { return { key:x[0], label:x[1], type:x[2], required:x[3], options:x[4] || [] }; }); },
    filePolicy: function () { return { maxFileCount:Number(get('MAX_FILE_COUNT')), maxFileSizeBytes:Number(get('MAX_FILE_SIZE_BYTES')), maxTotalSizeBytes:Number(get('MAX_TOTAL_SIZE_BYTES')), allowedMimeTypes:get('ALLOWED_MIME_TYPES').split(','), allowedExtensions:get('ALLOWED_EXTENSIONS').split(',') }; },
    protectedEmails: function () { return jsonSetting('PROTECTED_ACL_EMAILS', []).map(normalizeEmail_); }
  };
})();

function normalizeEmail_(value) { return String(value || '').trim().toLowerCase(); }
function nowIso_() { return new Date().toISOString(); }
function uuid_() { return Utilities.getUuid(); }
function submissionId_() { return 'SUB-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + uuid_().slice(0, 8).toUpperCase(); }
function assertScriptEditor_() { var active=normalizeEmail_(Session.getActiveUser().getEmail());var effective=normalizeEmail_(Session.getEffectiveUser().getEmail());if(!active||active!==effective)throw ErrorService.create('AUTH_DENIED','Run setup from the Apps Script editor as the deployment owner'); }
