export type RoleId =
  | 'EMPLOYEE'
  | 'FINANCE_VIEWER'
  | 'OPERATIONS_VIEWER'
  | 'HR_VIEWER'
  | 'PROCUREMENT_VIEWER'
  | 'CONTENT_MANAGER'
  | 'ADMIN';
export type ProcessingStatus =
  | 'RECEIVED'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'ROUTING'
  | 'PROCESSING'
  | 'FILES_SAVED'
  | 'DATA_SAVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL'
  | 'REQUIRES_REVIEW'
  | 'CORRECTION_IN_PROGRESS';
export type OperationStatus = 'PENDING' | 'SAVED' | 'FAILED' | 'NOT_REQUIRED';
export type ErrorCode =
  | 'AUTH_DENIED'
  | 'VALIDATION_FAILED'
  | 'FILE_VALIDATION_FAILED'
  | 'ROUTE_NOT_FOUND'
  | 'TARGET_SHEET_UNAVAILABLE'
  | 'TARGET_TAB_UNAVAILABLE'
  | 'DRIVE_FOLDER_UNAVAILABLE'
  | 'DRIVE_UPLOAD_FAILED'
  | 'SHEET_WRITE_FAILED'
  | 'DUPLICATE_SUBMISSION'
  | 'ACL_SYNC_FAILED'
  | 'CONFIGURATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  active: boolean;
  roleId: RoleId;
}
export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'tags';
  required: boolean;
  options?: string[];
  helpText?: string;
}
export interface Condition {
  key: string;
  equals?: string;
  in?: string[];
}
export interface VettingQuestion {
  questionId: string;
  key: string;
  label: string;
  type: 'select' | 'text' | 'boolean';
  required: boolean;
  options?: string[];
  displayOrder: number;
  active: boolean;
  version: number;
  showWhen?: Condition;
}
export interface RouteConfig {
  routeKey: string;
  conditions: Condition[];
  dataSummarySpreadsheetId: string;
  dataSummaryTab: string;
  driveFolderId: string;
  allowedRoles: RoleId[];
  active: boolean;
  version: number;
}
export interface AttachmentInput {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
}
export interface SubmissionInput {
  idempotencyToken: string;
  submissionId?: string;
  submissionType: 'NEW' | 'CORRECTION';
  metadata: Record<string, string>;
  answers: Record<string, string>;
  attachments: AttachmentInput[];
}
export interface SubmissionRecord extends SubmissionInput {
  submissionId: string;
  submissionVersion: number;
  submittedAt: string;
  submittedBy: string;
  updatedAt: string;
  updatedBy: string;
  routeKey: string;
  targetSheetId: string;
  targetSheetTab: string;
  targetFolderId: string;
  validationStatus: OperationStatus;
  sheetStatus: OperationStatus;
  driveStatus: OperationStatus;
  aclStatus: OperationStatus;
  processingStatus: ProcessingStatus;
  retryCount: number;
  jiraIssueReference: string;
  lastErrorCode: ErrorCode | '';
  lastErrorMessage: string;
  completedAt: string;
}
export interface AuditEvent {
  auditId: string;
  submissionId: string;
  eventType: string;
  actorEmail: string;
  occurredAt: string;
  before: unknown;
  after: unknown;
  metadata: Record<string, unknown>;
  result: 'SUCCESS' | 'FAILURE';
  errorCode?: ErrorCode;
}
export interface FilePolicy {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFileSizeBytes: number;
  maxFileCount: number;
  maxTotalSizeBytes: number;
}
export interface AclGrant {
  email: string;
  folderId: string;
  permission: 'VIEWER' | 'EDITOR';
}
export interface AclDiff {
  add: AclGrant[];
  change: AclGrant[];
  remove: AclGrant[];
  protected: AclGrant[];
}
