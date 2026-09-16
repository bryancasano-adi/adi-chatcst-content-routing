import { describe, expect, it } from 'vitest';
import { localSubmissionService } from '../../lib/domain/localSubmissionService';
import {
  metadataFields,
  vettingQuestions,
} from '../../lib/config/applicationConfig';
import type { SubmissionInput } from '../../lib/types/domain';

let counter = 0;
function input(overrides: Partial<SubmissionInput> = {}): SubmissionInput {
  counter += 1;
  const metadata = Object.fromEntries(
    metadataFields.map((field) => [
      field.key,
      field.type === 'date' ? '2026-09-16' : (field.options?.[0] ?? 'value'),
    ]),
  );
  const answers = Object.fromEntries(
    vettingQuestions
      .filter((q) => !q.showWhen)
      .map((q) => [q.key, q.options?.[0] ?? 'value']),
  );
  answers.document_type = 'Financial Statement';
  return {
    idempotencyToken: `test-${counter}`,
    submissionType: 'NEW',
    metadata,
    answers,
    attachments: [],
    ...overrides,
  };
}

describe('submission workflow', () => {
  it('creates a completed audited submission', () => {
    const record = localSubmissionService.submit(
      input(),
      'content.employee@aboitiz.com',
    );
    expect(record.processingStatus).toBe('COMPLETED');
    expect(record.routeKey).toBe('FINANCE_FINANCIAL_STATEMENT');
    expect(
      localSubmissionService
        .audits()
        .some((event) => event.submissionId === record.submissionId),
    ).toBe(true);
  });
  it('returns the same logical record on double submit', () => {
    const payload = input();
    const first = localSubmissionService.submit(
      payload,
      'content.employee@aboitiz.com',
    );
    const second = localSubmissionService.submit(
      payload,
      'content.employee@aboitiz.com',
    );
    expect(second.submissionId).toBe(first.submissionId);
  });
  it('increments version and audits a route-changing correction', () => {
    const first = localSubmissionService.submit(
      input(),
      'content.employee@aboitiz.com',
    );
    const corrected = localSubmissionService.correct(
      first.submissionId,
      input({
        answers: {
          ...first.answers,
          document_type: 'Input',
          change_type: 'Correction',
        },
        submissionType: 'CORRECTION',
      }),
      'content.employee@aboitiz.com',
    );
    expect(corrected.submissionVersion).toBe(2);
    expect(corrected.routeKey).toBe('FINANCE_INPUT');
    const audit = [...localSubmissionService.audits()]
      .reverse()
      .find(
        (event) =>
          event.submissionId === first.submissionId &&
          event.eventType === 'CORRECTION_COMPLETED',
      );
    expect(audit?.metadata).toMatchObject({
      oldRoute: 'FINANCE_FINANCIAL_STATEMENT',
      newRoute: 'FINANCE_INPUT',
    });
  });
  it('prevents another employee from correcting the record', () => {
    const first = localSubmissionService.submit(
      input(),
      'content.employee@aboitiz.com',
    );
    expect(() =>
      localSubmissionService.correct(
        first.submissionId,
        input(),
        'finance.viewer@aboitiz.com',
      ),
    ).toThrow('AUTH_DENIED');
  });
  it('soft-deletes owned content and preserves an audit record', () => {
    const first = localSubmissionService.submit(
      input(),
      'content.employee@aboitiz.com',
    );
    const deleted = localSubmissionService.delete(
      first.submissionId,
      'content.employee@aboitiz.com',
    );

    expect(deleted.processingStatus).toBe('DELETED');
    expect(deleted.attachments).toEqual([]);
    expect(
      localSubmissionService
        .audits()
        .some(
          (event) =>
            event.submissionId === first.submissionId &&
            event.eventType === 'SUBMISSION_DELETED',
        ),
    ).toBe(true);
  });
  it('prevents another employee from deleting the record', () => {
    const first = localSubmissionService.submit(
      input(),
      'content.employee@aboitiz.com',
    );
    expect(() =>
      localSubmissionService.delete(
        first.submissionId,
        'finance.viewer@aboitiz.com',
      ),
    ).toThrow('AUTH_DENIED');
  });
});
