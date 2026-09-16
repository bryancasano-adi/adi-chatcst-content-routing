import type { RoleId, RouteConfig } from '../types/domain';

const matches = (answers: Record<string, string>, route: RouteConfig) =>
  route.conditions.every((condition) =>
    condition.equals
      ? answers[condition.key] === condition.equals
      : condition.in?.includes(answers[condition.key]) === true,
  );
export function resolveRoute(
  answers: Record<string, string>,
  role: RoleId,
  routes: RouteConfig[],
): RouteConfig {
  const matchesFound = routes.filter(
    (route) => route.active && matches(answers, route),
  );
  if (matchesFound.length !== 1)
    throw new Error(
      matchesFound.length ? 'DUPLICATE_ROUTE' : 'ROUTE_NOT_FOUND',
    );
  const route = matchesFound[0];
  if (!route.allowedRoles.includes(role)) throw new Error('AUTH_DENIED');
  if (
    !route.driveFolderId ||
    !route.dataSummarySpreadsheetId ||
    !route.dataSummaryTab
  )
    throw new Error('MISSING_TARGET');
  return route;
}
