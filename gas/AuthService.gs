var AuthService = (function () {
  function currentEmail() { var email = normalizeEmail_(Session.getActiveUser().getEmail()); if (!email) throw ErrorService.create('AUTH_DENIED', 'Workspace identity unavailable'); return email; }
  function authorize(privileged) {
    var email = currentEmail(); var employee = AccessControlRepository.employeeByEmail(email);
    if (!employee || String(employee.active).toLowerCase() !== 'true') throw ErrorService.create('AUTH_DENIED', 'Inactive or unknown employee');
    var roles = AccessControlRepository.activeRolesFor(email); var allowed = roles.indexOf('ADMIN') >= 0 || roles.indexOf('CONTENT_MANAGER') >= 0;
    if (privileged && !allowed) throw ErrorService.create('AUTH_DENIED', 'Privileged role required');
    return { email:email, name:employee.name, employeeId:employee.employee_id, roles:roles, privileged:allowed };
  }
  function canEdit(user, record) { return user.privileged || normalizeEmail_(record.submitted_by) === user.email; }
  return { authorize:authorize, canEdit:canEdit };
})();
