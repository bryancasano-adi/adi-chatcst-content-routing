import { describe, expect, it } from 'vitest';
import {
  filePolicy,
  metadataFields,
  vettingQuestions,
} from '../../lib/config/applicationConfig';
import {
  validateFiles,
  validateSubmission,
} from '../../lib/validation/validation';

const validMetadata = Object.fromEntries(
  metadataFields
    .filter((field) => field.required)
    .map((field) => [
      field.key,
      field.type === 'date' ? '2026-09-16' : (field.options?.[0] ?? 'value'),
    ]),
);
const validAnswers = Object.fromEntries(
  vettingQuestions
    .filter((question) => question.required && !question.showWhen)
    .map((question) => [question.key, question.options?.[0] ?? 'value']),
);

describe('validation', () => {
  it('accepts complete valid data', () =>
    expect(
      validateSubmission(
        validMetadata,
        validAnswers,
        metadataFields,
        vettingQuestions,
      ).valid,
    ).toBe(true));
  it('reports required values, invalid options, and dates', () => {
    const result = validateSubmission(
      {
        ...validMetadata,
        document_title: '',
        document_date: '09/16/2026',
        business_unit: 'Unknown',
      },
      validAnswers,
      metadataFields,
      vettingQuestions,
    );
    expect(result.errors['metadata.document_title']).toBeTruthy();
    expect(result.errors['metadata.document_date']).toBeTruthy();
    expect(result.errors['metadata.business_unit']).toBeTruthy();
  });
  it('enforces conditional questions when visible', () =>
    expect(
      validateSubmission(
        validMetadata,
        { ...validAnswers, document_type: 'Policy / Procedure' },
        metadataFields,
        vettingQuestions,
      ).errors['answers.policy_scope'],
    ).toBeTruthy());
  it('rejects bad type, oversize files, count, and total size', () => {
    expect(
      validateFiles(
        [{ name: 'bad.exe', type: 'application/octet-stream', size: 1 }],
        filePolicy,
      ).valid,
    ).toBe(false);
    expect(
      validateFiles(
        [
          {
            name: 'big.pdf',
            type: 'application/pdf',
            size: filePolicy.maxFileSizeBytes + 1,
          },
        ],
        filePolicy,
      ).valid,
    ).toBe(false);
    const many = Array.from({ length: 6 }, (_, i) => ({
      name: `${i}.pdf`,
      type: 'application/pdf',
      size: 5 * 1024 * 1024,
    }));
    const result = validateFiles(many, filePolicy);
    expect(result.errors.attachments).toBeTruthy();
    expect(result.errors.attachmentsTotal).toBeTruthy();
  });
});
