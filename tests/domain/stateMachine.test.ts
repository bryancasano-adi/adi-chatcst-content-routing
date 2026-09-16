import { describe, expect, it } from 'vitest';
import { transition } from '../../lib/state-machine/stateMachine';

describe('submission state machine', () => {
  it('supports happy path and retry/correction entry points', () => {
    expect(transition('RECEIVED', 'VALIDATING')).toBe('VALIDATING');
    expect(transition('PARTIAL', 'PROCESSING')).toBe('PROCESSING');
    expect(transition('COMPLETED', 'CORRECTION_IN_PROGRESS')).toBe(
      'CORRECTION_IN_PROGRESS',
    );
    expect(transition('COMPLETED', 'DELETED')).toBe('DELETED');
  });
  it('rejects invalid transitions', () =>
    expect(() => transition('RECEIVED', 'COMPLETED')).toThrow(
      'INVALID_TRANSITION',
    ));
});
