var ConfigService = (function () {
  var defaults = {
    ENVIRONMENT: 'production', ALLOW_ACL_REMOVAL: 'false', MAX_FILE_COUNT: '5', MAX_FILE_SIZE_BYTES: '10485760', MAX_TOTAL_SIZE_BYTES: '26214400',
    ALLOWED_MIME_TYPES: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain', ALLOWED_EXTENSIONS: 'pdf,docx,xlsx,txt'
  };
  function get(key, fallback) { return PropertiesService.getScriptProperties().getProperty(key) || defaults[key] || fallback || ''; }
  function requireValue(key) { var value = get(key); if (!value) throw ErrorService.create('CONFIGURATION_ERROR', 'Missing Script Property: ' + key); return value; }
  function jsonSetting(key, fallback) { var settings = AccessControlRepository.readTable('Settings'); var found = settings.filter(function (row) { return row.key === key; })[0]; if (!found || !found.value) return fallback; try { return JSON.parse(found.value); } catch (e) { throw ErrorService.create('CONFIGURATION_ERROR', 'Invalid JSON setting: ' + key); } }
  return {
    get: get, require: requireValue,
    metadataFields: function () { return AccessControlRepository.readTable('MetadataFields').filter(function (row) { return String(row.active).toLowerCase() === 'true'; }).sort(function (a,b) { return Number(a.display_order)-Number(b.display_order); }).map(function (row) { var options=[];try{options=row.options_json?JSON.parse(row.options_json):[];}catch(e){throw ErrorService.create('CONFIGURATION_ERROR','Invalid metadata options for '+row.field_key);}if(!Array.isArray(options))throw ErrorService.create('CONFIGURATION_ERROR','Metadata options must be an array for '+row.field_key);return { key:String(row.field_key), label:String(row.label), type:String(row.field_type), required:String(row.required).toLowerCase()==='true', options:options, helpText:String(row.help_text||'') }; }); },
    filePolicy: function () { return { maxFileCount:Number(get('MAX_FILE_COUNT')), maxFileSizeBytes:Number(get('MAX_FILE_SIZE_BYTES')), maxTotalSizeBytes:Number(get('MAX_TOTAL_SIZE_BYTES')), allowedMimeTypes:get('ALLOWED_MIME_TYPES').split(','), allowedExtensions:get('ALLOWED_EXTENSIONS').split(',') }; },
    protectedEmails: function () { var configured=jsonSetting('PROTECTED_ACL_EMAILS', []);if(!Array.isArray(configured))throw ErrorService.create('CONFIGURATION_ERROR','PROTECTED_ACL_EMAILS must be a JSON array');return configured.map(normalizeEmail_); }
  };
})();

function normalizeEmail_(value) { return String(value || '').trim().toLowerCase(); }
function nowIso_() { return new Date().toISOString(); }
function uuid_() { return Utilities.getUuid(); }
function submissionId_() { return 'SUB-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + uuid_().slice(0, 8).toUpperCase(); }
function assertScriptEditor_() { var active=normalizeEmail_(Session.getActiveUser().getEmail());var effective=normalizeEmail_(Session.getEffectiveUser().getEmail());if(!active||active!==effective)throw ErrorService.create('AUTH_DENIED','Run setup from the Apps Script editor as the deployment owner'); }
