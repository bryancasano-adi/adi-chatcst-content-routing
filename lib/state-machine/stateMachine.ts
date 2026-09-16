import type { ProcessingStatus } from '../types/domain';

const transitions: Record<ProcessingStatus, ProcessingStatus[]> = {
  RECEIVED: ['VALIDATING', 'FAILED', 'DELETED'],
  VALIDATING: ['VALIDATED', 'FAILED', 'DELETED'],
  VALIDATED: ['ROUTING', 'DELETED'],
  ROUTING: ['PROCESSING', 'REQUIRES_REVIEW', 'FAILED', 'DELETED'],
  PROCESSING: [
    'FILES_SAVED',
    'DATA_SAVED',
    'COMPLETED',
    'PARTIAL',
    'FAILED',
    'DELETED',
  ],
  FILES_SAVED: ['COMPLETED', 'PARTIAL', 'DELETED'],
  DATA_SAVED: ['COMPLETED', 'PARTIAL', 'DELETED'],
  COMPLETED: ['CORRECTION_IN_PROGRESS', 'DELETED'],
  FAILED: ['PROCESSING', 'DELETED'],
  PARTIAL: ['PROCESSING', 'DELETED'],
  REQUIRES_REVIEW: ['CORRECTION_IN_PROGRESS', 'PROCESSING', 'DELETED'],
  CORRECTION_IN_PROGRESS: ['VALIDATING', 'PARTIAL', 'FAILED', 'DELETED'],
  DELETED: [],
};
export function transition(
  from: ProcessingStatus,
  to: ProcessingStatus,
): ProcessingStatus {
  if (!transitions[from].includes(to))
    throw new Error(`INVALID_TRANSITION:${from}:${to}`);
  return to;
}
