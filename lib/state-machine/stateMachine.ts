import type { ProcessingStatus } from '../types/domain';

const transitions: Record<ProcessingStatus, ProcessingStatus[]> = {
  RECEIVED: ['VALIDATING', 'FAILED'],
  VALIDATING: ['VALIDATED', 'FAILED'],
  VALIDATED: ['ROUTING'],
  ROUTING: ['PROCESSING', 'REQUIRES_REVIEW', 'FAILED'],
  PROCESSING: ['FILES_SAVED', 'DATA_SAVED', 'COMPLETED', 'PARTIAL', 'FAILED'],
  FILES_SAVED: ['COMPLETED', 'PARTIAL'],
  DATA_SAVED: ['COMPLETED', 'PARTIAL'],
  COMPLETED: ['CORRECTION_IN_PROGRESS'],
  FAILED: ['PROCESSING'],
  PARTIAL: ['PROCESSING'],
  REQUIRES_REVIEW: ['CORRECTION_IN_PROGRESS', 'PROCESSING'],
  CORRECTION_IN_PROGRESS: ['VALIDATING', 'PARTIAL', 'FAILED'],
};
export function transition(
  from: ProcessingStatus,
  to: ProcessingStatus,
): ProcessingStatus {
  if (!transitions[from].includes(to))
    throw new Error(`INVALID_TRANSITION:${from}:${to}`);
  return to;
}
