var VettingService = (function () {
  function getActiveQuestions() { return AccessControlRepository.readTable('VettingQuestions').filter(function (r) { return String(r.active).toLowerCase() === 'true'; }).sort(function (a,b) { return Number(a.display_order)-Number(b.display_order); }).map(function (r) { return { questionId:r.question_id, key:r.question_key, label:r.label, type:r.question_type, required:String(r.required).toLowerCase()==='true', options:safeJson_(r.options_json, []), displayOrder:Number(r.display_order), active:true, version:Number(r.version), showWhen:safeJson_(r.show_when_json, null) }; }); }
  function safeJson_(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch (e) { throw ErrorService.create('CONFIGURATION_ERROR', 'Malformed vetting configuration'); } }
  return { getActiveQuestions:getActiveQuestions };
})();
