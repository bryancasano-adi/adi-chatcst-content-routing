import type { ErrorCode, ProcessingStatus } from '../types/domain';

export const PROCESSING_STATUSES: ProcessingStatus[] = [
  'RECEIVED',
  'VALIDATING',
  'VALIDATED',
  'ROUTING',
  'PROCESSING',
  'FILES_SAVED',
  'DATA_SAVED',
  'COMPLETED',
  'FAILED',
  'PARTIAL',
  'REQUIRES_REVIEW',
  'CORRECTION_IN_PROGRESS',
];
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_DENIED: 'You are not authorized to use this application.',
  VALIDATION_FAILED: 'Please correct the highlighted information.',
  FILE_VALIDATION_FAILED:
    'One or more attachments do not meet the upload policy.',
  ROUTE_NOT_FOUND:
    'No approved destination matches this submission. It has been held for review.',
  TARGET_SHEET_UNAVAILABLE: 'The configured Data Summary is unavailable.',
  TARGET_TAB_UNAVAILABLE: 'The configured Data Summary tab is unavailable.',
  DRIVE_FOLDER_UNAVAILABLE: 'The configured destination folder is unavailable.',
  DRIVE_UPLOAD_FAILED:
    'Attachments could not be saved. Support can retry this operation.',
  SHEET_WRITE_FAILED:
    'Metadata could not be saved. Support can retry this operation.',
  DUPLICATE_SUBMISSION: 'This request was already received.',
  ACL_SYNC_FAILED: 'Drive access reconciliation did not complete.',
  CONFIGURATION_ERROR: 'The application configuration is incomplete.',
  UNKNOWN_ERROR:
    'An unexpected error occurred. Contact support with the submission reference.',
};

export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();
export const isoNow = (): string => new Date().toISOString();
export const createSubmissionId = (uuid = crypto.randomUUID()): string =>
  `SUB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${uuid.slice(0, 8).toUpperCase()}`;
