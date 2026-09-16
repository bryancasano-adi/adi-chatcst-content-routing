var IdempotencyService=(function(){
  function withLock(callback){var lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw ErrorService.create('DUPLICATE_SUBMISSION','Another operation is in progress');try{return callback();}finally{lock.releaseLock();}}
  function existing(token){return token?SubmissionRepository.findByToken(token):null;}
  return {withLock:withLock,existing:existing};
})();
