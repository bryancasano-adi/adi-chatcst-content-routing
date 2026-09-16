var VettingResponseRepository=(function(){
  function save(submissionId,answers,user){var byKey={};VettingService.getActiveQuestions().forEach(function(q){byKey[q.key]=q;});Object.keys(answers).filter(function(k){return byKey[k];}).forEach(function(key){var q=byKey[key];AccessControlRepository.appendObject('VettingResponses',{response_id:uuid_(),submission_id:submissionId,question_id:q.questionId,question_key:q.key,answer:String(answers[key]),question_version:q.version,created_at:nowIso_(),created_by:user.email});});}
  function find(submissionId){return AccessControlRepository.readTable('VettingResponses').filter(function(r){return r.submission_id===submissionId;});}
  return {save:save,find:find};
})();
