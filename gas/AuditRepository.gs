var AuditRepository=(function(){
  function record(eventType,actor,submissionId,before,after,metadata,result,errorCode){AccessControlRepository.appendObject('AuditLog',{audit_id:uuid_(),submission_id:submissionId||'',event_type:eventType,actor_email:actor,occurred_at:nowIso_(),before_json:before?JSON.stringify(before):'',after_json:after?JSON.stringify(after):'',metadata_json:JSON.stringify(metadata||{}),result:result||'SUCCESS',error_code:errorCode||''});}
  return {record:record};
})();
