var EnvironmentService = (function () {
  function validate() {
    AuthService.authorize(true);
    var report = { checkedAt: nowIso_(), environment: ConfigService.get('ENVIRONMENT'), checks: [], valid: true };

    function check(name, operation) {
      try {
        operation();
        report.checks.push({ name: name, ok: true });
      } catch (error) {
        report.valid = false;
        report.checks.push({ name: name, ok: false, code: error.code || 'UNKNOWN_ERROR', message: String(error.message) });
      }
    }

    check('Production environment', function () {
      if (ConfigService.get('ENVIRONMENT') !== 'production') {
        throw ErrorService.create('CONFIGURATION_ERROR', 'ENVIRONMENT must be production');
      }
    });

    check('Control spreadsheet', function () {
      var book = AccessControlRepository.controlBook();
      Object.keys(SetupService.schemas()).forEach(function (name) {
        if (!book.getSheetByName(name)) throw ErrorService.create('CONFIGURATION_ERROR', 'Missing tab ' + name);
      });
    });

    check('Authorized employees', function () {
      var employees = AccessControlRepository.readTable('Employees').filter(function (row) { return String(row.active).toLowerCase() === 'true'; });
      if (!employees.length) throw ErrorService.create('CONFIGURATION_ERROR', 'At least one active employee is required');
      var emails = {};
      employees.forEach(function (employee) {
        var email = normalizeEmail_(employee.email);
        if (!email || emails[email]) throw ErrorService.create('CONFIGURATION_ERROR', 'Active employee emails must be unique and non-empty');
        emails[email] = true;
      });
    });

    check('Metadata configuration', function () {
      var fields = ConfigService.metadataFields();
      if (!fields.length) throw ErrorService.create('CONFIGURATION_ERROR', 'At least one active metadata field is required');
      var keys = {};
      fields.forEach(function (field) {
        if (!field.key || !field.label || keys[field.key]) throw ErrorService.create('CONFIGURATION_ERROR', 'Metadata keys and labels must be unique and non-empty');
        if (['text', 'textarea', 'date', 'select', 'tags'].indexOf(field.type) < 0) throw ErrorService.create('CONFIGURATION_ERROR', 'Unsupported metadata type ' + field.type);
        if (field.type === 'select' && !field.options.length) throw ErrorService.create('CONFIGURATION_ERROR', 'Select metadata requires options: ' + field.key);
        keys[field.key] = true;
      });
    });

    var questionKeys = {}, questionIds = {};
    check('Vetting configuration', function () {
      var questions = VettingService.getActiveQuestions();
      if (!questions.length) throw ErrorService.create('CONFIGURATION_ERROR', 'At least one active vetting question is required');
      questions.forEach(function (question) {
        if (!question.questionId || !question.key || !question.label || questionKeys[question.key] || questionIds[question.questionId]) throw ErrorService.create('CONFIGURATION_ERROR', 'Vetting IDs, keys, and labels must be unique and non-empty');
        if (!question.version || question.version < 1) throw ErrorService.create('CONFIGURATION_ERROR', 'Invalid question version for ' + question.key);
        questionKeys[question.key] = true;
        questionIds[question.questionId] = true;
      });
      questions.forEach(function (question) { if (question.showWhen && !questionKeys[question.showWhen.key]) throw ErrorService.create('CONFIGURATION_ERROR', 'Conditional question uses unknown key ' + question.showWhen.key); });
    });

    var routes = [];
    check('Route configuration', function () {
      routes = AccessControlRepository.readTable('Routes').filter(function (row) { return String(row.active).toLowerCase() === 'true'; });
      if (!routes.length) throw ErrorService.create('CONFIGURATION_ERROR', 'At least one active route is required');
      var seen = {};
      routes.forEach(function (route) {
        if (!route.route_key || seen[route.route_key]) throw ErrorService.create('CONFIGURATION_ERROR', 'Route keys must be unique and non-empty');
        seen[route.route_key] = true;
        var conditions = JSON.parse(route.conditions_json);
        var allowedRoles = JSON.parse(route.allowed_roles_json);
        if (!Array.isArray(conditions) || !Array.isArray(allowedRoles) || !allowedRoles.length) throw ErrorService.create('CONFIGURATION_ERROR', 'Route JSON must contain condition and role arrays: ' + route.route_key);
        conditions.forEach(function (condition) {
          if (!questionKeys[condition.key]) throw ErrorService.create('CONFIGURATION_ERROR', 'Route uses unknown question key ' + condition.key);
        });
        if (!route.data_summary_spreadsheet_id || !route.data_summary_tab || !route.drive_folder_id) {
          throw ErrorService.create('CONFIGURATION_ERROR', 'Incomplete route ' + route.route_key);
        }
      });
    });

    routes.forEach(function (route) {
      check('Sheet target ' + route.route_key, function () { DataSummaryRepository.verify(route); });
      check('Drive target ' + route.route_key, function () { DriveRepository.verify(route.drive_folder_id); });
    });

    check('ACL mappings', function () {
      var routeKeys = {};
      routes.forEach(function (route) { routeKeys[route.route_key] = true; });
      var routeByKey = {};
      routes.forEach(function (route) { routeByKey[route.route_key] = route; });
      AccessControlRepository.readTable('FolderAccessMatrix').forEach(function (mapping) {
        if (!routeKeys[mapping.route_key]) throw ErrorService.create('CONFIGURATION_ERROR', 'Orphan ACL route ' + mapping.route_key);
        if (String(routeByKey[mapping.route_key].drive_folder_id) !== String(mapping.folder_id)) throw ErrorService.create('CONFIGURATION_ERROR', 'ACL folder does not match route ' + mapping.route_key);
        if (['VIEWER', 'EDITOR'].indexOf(String(mapping.permission).toUpperCase()) < 0) {
          throw ErrorService.create('CONFIGURATION_ERROR', 'Invalid ACL permission');
        }
      });
    });

    check('Protected identities', function () {
      if (!ConfigService.protectedEmails().length) {
        throw ErrorService.create('CONFIGURATION_ERROR', 'PROTECTED_ACL_EMAILS must contain at least one identity');
      }
    });

    report.productionReady = report.valid;
    return report;
  }

  return { validate: validate };
})();

/** Read-only resource and configuration health check. */
function validateEnvironment() { return EnvironmentService.validate(); }
