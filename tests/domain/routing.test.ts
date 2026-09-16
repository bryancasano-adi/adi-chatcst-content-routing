import { describe, expect, it } from 'vitest';
import { routes } from '../../lib/config/applicationConfig';
import { resolveRoute } from '../../lib/routing/routing';

describe('routing', () => {
  it.each([
    ['Finance', 'Financial Statement', 'FINANCE_FINANCIAL_STATEMENT'],
    ['Finance', 'Input', 'FINANCE_INPUT'],
    ['Finance', 'Output', 'FINANCE_OUTPUT'],
    ['Operations', 'Input', 'OPERATIONS_INPUT'],
    ['Operations', 'Output', 'OPERATIONS_OUTPUT'],
    ['HR', 'Policy / Procedure', 'HR_POLICY'],
    ['Procurement', 'Input', 'PROCUREMENT_INPUT'],
    ['Operations', 'Policy / Procedure', 'GENERAL_POLICY'],
  ])('routes %s / %s', (fn, type, expected) =>
    expect(
      resolveRoute(
        { business_function: fn, document_type: type },
        'EMPLOYEE',
        routes,
      ).routeKey,
    ).toBe(expected),
  );
  it('rejects unknown routes rather than falling back', () =>
    expect(() =>
      resolveRoute(
        { business_function: 'HR', document_type: 'Output' },
        'EMPLOYEE',
        routes,
      ),
    ).toThrow('ROUTE_NOT_FOUND'));
  it('rejects disabled and incomplete targets', () => {
    expect(() =>
      resolveRoute(
        { business_function: 'Finance', document_type: 'Input' },
        'EMPLOYEE',
        routes.map((r) =>
          r.routeKey === 'FINANCE_INPUT' ? { ...r, active: false } : r,
        ),
      ),
    ).toThrow('ROUTE_NOT_FOUND');
    expect(() =>
      resolveRoute(
        { business_function: 'Finance', document_type: 'Input' },
        'EMPLOYEE',
        routes.map((r) =>
          r.routeKey === 'FINANCE_INPUT' ? { ...r, driveFolderId: '' } : r,
        ),
      ),
    ).toThrow('MISSING_TARGET');
  });
  it('detects duplicate matching rules', () =>
    expect(() =>
      resolveRoute(
        { business_function: 'Finance', document_type: 'Input' },
        'EMPLOYEE',
        [...routes, { ...routes[1], routeKey: 'DUPLICATE' }],
      ),
    ).toThrow('DUPLICATE_ROUTE'));
});
