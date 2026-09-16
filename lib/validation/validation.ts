import type {
  AttachmentInput,
  FilePolicy,
  MetadataField,
  VettingQuestion,
} from '../types/domain';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
const visible = (q: VettingQuestion, answers: Record<string, string>) =>
  !q.showWhen ||
  (q.showWhen.equals
    ? answers[q.showWhen.key] === q.showWhen.equals
    : q.showWhen.in?.includes(answers[q.showWhen.key]) === true);

export function validateMetadata(
  metadata: Record<string, string>,
  fields: MetadataField[],
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = metadata[field.key]?.trim();
    if (field.required && !value)
      errors[`metadata.${field.key}`] = `${field.label} is required.`;
    if (value && field.options && !field.options.includes(value))
      errors[`metadata.${field.key}`] = `${field.label} has an invalid value.`;
    if (value && field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value))
      errors[`metadata.${field.key}`] = `${field.label} must use YYYY-MM-DD.`;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAnswers(
  answers: Record<string, string>,
  questions: VettingQuestion[],
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const q of questions.filter(
    (item) => item.active && visible(item, answers),
  )) {
    const value = answers[q.key]?.trim();
    if (q.required && !value)
      errors[`answers.${q.key}`] = `${q.label} is required.`;
    if (value && q.options && !q.options.includes(value))
      errors[`answers.${q.key}`] = `${q.label} has an invalid value.`;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSubmission(
  metadata: Record<string, string>,
  answers: Record<string, string>,
  fields: MetadataField[],
  questions: VettingQuestion[],
): ValidationResult {
  const metadataResult = validateMetadata(metadata, fields);
  const answersResult = validateAnswers(answers, questions);
  const errors = { ...metadataResult.errors, ...answersResult.errors };
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFiles(
  files: AttachmentInput[],
  policy: FilePolicy,
): ValidationResult {
  const errors: Record<string, string> = {};
  if (files.length > policy.maxFileCount)
    errors.attachments = `Maximum ${policy.maxFileCount} files allowed.`;
  if (
    files.reduce((sum, file) => sum + file.size, 0) > policy.maxTotalSizeBytes
  )
    errors.attachmentsTotal = 'Combined attachment size is too large.';
  files.forEach((file, index) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (
      !policy.allowedMimeTypes.includes(file.type) ||
      !policy.allowedExtensions.includes(extension)
    )
      errors[`attachment.${index}`] =
        `${file.name} is not an allowed file type.`;
    if (file.size > policy.maxFileSizeBytes)
      errors[`attachment.${index}.size`] =
        `${file.name} exceeds the per-file limit.`;
  });
  return { valid: Object.keys(errors).length === 0, errors };
}
