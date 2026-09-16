import type { Employee, RoleId } from '../types/domain';
import { normalizeEmail } from './constants';

export function authorize(
  email: string,
  employees: Employee[],
  privileged = false,
): Employee {
  const employee = employees.find(
    (item) => normalizeEmail(item.email) === normalizeEmail(email),
  );
  if (!employee?.active) throw new Error('AUTH_DENIED');
  if (
    privileged &&
    !(['CONTENT_MANAGER', 'ADMIN'] as RoleId[]).includes(employee.roleId)
  )
    throw new Error('AUTH_DENIED');
  return employee;
}
