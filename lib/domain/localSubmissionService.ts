import {
  employees,
  filePolicy,
  metadataFields,
  routes,
  vettingQuestions,
} from '../config/applicationConfig';
import { resolveRoute } from '../routing/routing';
import type {
  AuditEvent,
  SubmissionInput,
  SubmissionRecord,
} from '../types/domain';
import { validateFiles, validateSubmission } from '../validation/validation';
import { authorize } from './auth';
import { createSubmissionId, isoNow } from './constants';

const submissions: SubmissionRecord[] = [];
const auditEvents: AuditEvent[] = [];

export const localSubmissionService = {
  list: () => [...submissions],
  audits: () => [...auditEvents],

  submit(input: SubmissionInput, email: string): SubmissionRecord {
    const employee = authorize(email, employees);
    const existing = submissions.find(
      (item) => item.idempotencyToken === input.idempotencyToken,
    );
    if (existing) return existing;

    const validation = validateSubmission(
      input.metadata,
      input.answers,
      metadataFields,
      vettingQuestions,
    );
    const fileValidation = validateFiles(input.attachments, filePolicy);
    if (!validation.valid || !fileValidation.valid) {
      throw new Error(
        JSON.stringify({
          ...validation.errors,
          ...fileValidation.errors,
        }),
      );
    }

    const route = resolveRoute(input.answers, employee.roleId, routes);
    const now = isoNow();
    const submissionId = input.submissionId ?? createSubmissionId();
    const record: SubmissionRecord = {
      ...input,
      submissionId,
      submissionVersion: 1,
      submittedAt: now,
      submittedBy: employee.email,
      updatedAt: now,
      updatedBy: employee.email,
      routeKey: route.routeKey,
      targetSheetId: route.dataSummarySpreadsheetId,
      targetSheetTab: route.dataSummaryTab,
      targetFolderId: route.driveFolderId,
      validationStatus: 'SAVED',
      sheetStatus: 'SAVED',
      driveStatus: input.attachments.length ? 'SAVED' : 'NOT_REQUIRED',
      aclStatus: 'NOT_REQUIRED',
      processingStatus: 'COMPLETED',
      retryCount: 0,
      jiraIssueReference: '',
      lastErrorCode: '',
      lastErrorMessage: '',
      completedAt: now,
    };
    submissions.push(record);
    auditEvents.push({
      auditId: crypto.randomUUID(),
      submissionId,
      eventType: 'SUBMISSION_CREATED',
      actorEmail: employee.email,
      occurredAt: now,
      before: null,
      after: record,
      metadata: { routeKey: route.routeKey },
      result: 'SUCCESS',
    });
    return record;
  },

  correct(
    submissionId: string,
    input: SubmissionInput,
    email: string,
  ): SubmissionRecord {
    const employee = authorize(email, employees);
    const index = submissions.findIndex(
      (item) => item.submissionId === submissionId,
    );
    if (index < 0) throw new Error('NOT_FOUND');

    const previous = submissions[index];
    if (
      previous.submittedBy !== employee.email &&
      !['CONTENT_MANAGER', 'ADMIN'].includes(employee.roleId)
    ) {
      throw new Error('AUTH_DENIED');
    }

    const next = this.submit(
      {
        ...input,
        submissionId,
        idempotencyToken: `${input.idempotencyToken}:v${previous.submissionVersion + 1}`,
      },
      email,
    );
    next.submissionVersion = previous.submissionVersion + 1;
    next.submittedAt = previous.submittedAt;
    next.submittedBy = previous.submittedBy;
    submissions.splice(submissions.indexOf(next), 1);
    submissions[index] = next;
    auditEvents.push({
      auditId: crypto.randomUUID(),
      submissionId,
      eventType: 'CORRECTION_COMPLETED',
      actorEmail: employee.email,
      occurredAt: next.updatedAt,
      before: previous,
      after: next,
      metadata: { oldRoute: previous.routeKey, newRoute: next.routeKey },
      result: 'SUCCESS',
    });
    return next;
  },
};
