import { describe, expect, it } from 'vitest';
import { authorize } from '../../lib/domain/auth';
import { employees } from '../../lib/config/applicationConfig';

describe('authorization', () => {
  it('allows and normalizes an active employee', () =>
    expect(
      authorize(' CONTENT.EMPLOYEE@ABOITIZ.COM ', employees).employeeId,
    ).toBe('E001'));
  it.each(['inactive.employee@aboitiz.com', 'unknown@aboitiz.com', ''])(
    'denies inactive, unknown, or blank identity',
    (email) => expect(() => authorize(email, employees)).toThrow('AUTH_DENIED'),
  );
  it('allows content managers and admins into privileged workflows', () => {
    expect(
      authorize('content.manager@aboitiz.com', employees, true).roleId,
    ).toBe('CONTENT_MANAGER');
    expect(authorize('content.admin@aboitiz.com', employees, true).roleId).toBe(
      'ADMIN',
    );
  });
  it('denies ordinary employees from privileged workflows', () =>
    expect(() =>
      authorize('content.employee@aboitiz.com', employees, true),
    ).toThrow('AUTH_DENIED'));
});
