import type { AclDiff, AclGrant } from '../types/domain';

const key = (grant: AclGrant) =>
  `${grant.folderId}:${grant.email.toLowerCase()}`;
export function diffAcl(
  desired: AclGrant[],
  current: AclGrant[],
  protectedEmails: string[],
  allowRemoval = false,
): AclDiff {
  const desiredByKey = new Map(desired.map((grant) => [key(grant), grant]));
  const currentByKey = new Map(current.map((grant) => [key(grant), grant]));
  const protectedSet = new Set(
    protectedEmails.map((email) => email.toLowerCase()),
  );
  const result: AclDiff = { add: [], change: [], remove: [], protected: [] };
  desired.forEach((grant) => {
    const existing = currentByKey.get(key(grant));
    if (!existing) result.add.push(grant);
    else if (existing.permission !== grant.permission)
      result.change.push(grant);
  });
  current.forEach((grant) => {
    if (!desiredByKey.has(key(grant))) {
      if (protectedSet.has(grant.email.toLowerCase()) || !allowRemoval)
        result.protected.push(grant);
      else result.remove.push(grant);
    }
  });
  return result;
}
