import { describe, expect, it } from 'vitest';
import { diffAcl } from '../../lib/acl/acl';
import type { AclGrant } from '../../lib/types/domain';

describe('ACL diff', () => {
  const current: AclGrant[] = [
    { email: 'owner@example.com', folderId: 'F1', permission: 'EDITOR' },
    { email: 'old@example.com', folderId: 'F1', permission: 'VIEWER' },
  ];
  const desired: AclGrant[] = [
    { email: 'owner@example.com', folderId: 'F1', permission: 'EDITOR' },
    { email: 'new@example.com', folderId: 'F1', permission: 'VIEWER' },
  ];
  it('previews additions without side effects or conservative removals', () => {
    const result = diffAcl(desired, current, ['owner@example.com']);
    expect(result.add).toHaveLength(1);
    expect(result.remove).toHaveLength(0);
    expect(result.protected).toHaveLength(1);
    expect(current).toHaveLength(2);
  });
  it('removes obsolete viewers only when enabled', () =>
    expect(
      diffAcl(desired, current, ['owner@example.com'], true).remove[0].email,
    ).toBe('old@example.com'));
  it('protects designated identities', () =>
    expect(
      diffAcl([], current, ['owner@example.com'], true).protected[0].email,
    ).toBe('owner@example.com'));
  it('is idempotent when current matches desired', () =>
    expect(diffAcl(desired, desired, [], true)).toEqual({
      add: [],
      change: [],
      remove: [],
      protected: [],
    }));
});
