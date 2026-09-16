var ValidationService = (function () {
  function validate(payload) {
    if (!payload || typeof payload !== 'object') throw ErrorService.create('VALIDATION_FAILED', 'Payload required');
    var metadata = payload.metadata || {}; var answers = payload.answers || {}; var errors = {};
    ConfigService.metadataFields().forEach(function (field) { var value = String(metadata[field.key] || '').trim(); if (field.required && !value) errors['metadata.'+field.key] = 'Required'; if (value && field.options.length && field.options.indexOf(value) < 0) errors['metadata.'+field.key] = 'Invalid option'; if (value && field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors['metadata.'+field.key] = 'Invalid date'; });
    VettingService.getActiveQuestions().forEach(function (q) { var visible = !q.showWhen || answers[q.showWhen.key] === q.showWhen.equals; var value = String(answers[q.key] || '').trim(); if (visible && q.required && !value) errors['answers.'+q.key] = 'Required'; if (visible && value && q.options.length && q.options.indexOf(value) < 0) errors['answers.'+q.key] = 'Invalid option'; });
    if (Object.keys(errors).length) throw ErrorService.create('VALIDATION_FAILED', JSON.stringify(errors)); validateFiles(payload.attachments || []); return { metadata:metadata, answers:answers, attachments:payload.attachments || [] };
  }
  function validateFiles(files) { var p = ConfigService.filePolicy(); var total = 0; if (files.length > p.maxFileCount) throw ErrorService.create('FILE_VALIDATION_FAILED','Too many files'); files.forEach(function (f) { var ext = String(f.name || '').split('.').pop().toLowerCase(); total += Number(f.size || 0); if (p.allowedMimeTypes.indexOf(f.type) < 0 || p.allowedExtensions.indexOf(ext) < 0 || Number(f.size) > p.maxFileSizeBytes || !String(f.dataBase64 || '')) throw ErrorService.create('FILE_VALIDATION_FAILED','Invalid file: '+String(f.name)); }); if (total > p.maxTotalSizeBytes) throw ErrorService.create('FILE_VALIDATION_FAILED','Total size exceeded'); }
  return { validate:validate, validateFiles:validateFiles };
})();
