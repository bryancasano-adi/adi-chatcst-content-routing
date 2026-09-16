import { useMemo, useState } from 'react';
import { localSubmissionService } from '../../lib/domain/localSubmissionService';
import {
  filePolicy,
  metadataFields,
  routes,
  vettingQuestions,
} from '../../lib/config/applicationConfig';
import type {
  AttachmentInput,
  MetadataField,
  SubmissionInput,
  SubmissionRecord,
  VettingQuestion,
} from '../../lib/types/domain';
import {
  validateAnswers,
  validateFiles,
  validateMetadata,
  validateSubmission,
} from '../../lib/validation/validation';
import { FormField } from './FormField';
import { StepIndicator } from './StepIndicator';

interface IntakePageProps {
  initialSubmission: SubmissionRecord | null;
  userEmail: string;
  onSaved: () => void;
}

interface ReviewProps {
  answers: Record<string, string>;
  files: AttachmentInput[];
  metadata: Record<string, string>;
}

const EMPTY_METADATA = Object.fromEntries(
  metadataFields.map((field) => [field.key, '']),
);
const EMPTY_ANSWERS = Object.fromEntries(
  vettingQuestions.map((question) => [question.key, '']),
);

export function IntakePage({
  initialSubmission,
  userEmail,
  onSaved,
}: IntakePageProps) {
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState<Record<string, string>>(
    initialSubmission
      ? { ...initialSubmission.metadata }
      : { ...EMPTY_METADATA },
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialSubmission
      ? { ...initialSubmission.answers, change_type: 'Correction' }
      : { ...EMPTY_ANSWERS },
  );
  const [files, setFiles] = useState<AttachmentInput[]>(
    initialSubmission ? [...initialSubmission.attachments] : [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionRecord | null>(null);

  const visibleQuestions = useMemo(
    () =>
      vettingQuestions.filter(
        (question) =>
          question.active &&
          (!question.showWhen ||
            answers[question.showWhen.key] === question.showWhen.equals),
      ),
    [answers],
  );

  function updateMetadata(key: string, value: string) {
    setMetadata((current) => ({ ...current, [key]: value }));
    clearFieldError(`metadata.${key}`);
  }

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    clearFieldError(`answers.${key}`);
  }

  function clearFieldError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFormMessage('');
  }

  function validateCurrentStep() {
    if (step === 1) return true;

    const result =
      step === 2
        ? validateMetadata(metadata, metadataFields)
        : step === 3
          ? validateAnswers(answers, vettingQuestions)
          : validateFiles(files, filePolicy);

    setErrors(result.errors);
    if (!result.valid) {
      const message =
        step === 2
          ? 'Complete the required metadata before continuing.'
          : step === 3
            ? 'Answer the required vetting questions before continuing.'
            : 'Correct the attachment issues before continuing.';
      setFormMessage(message);
    } else {
      setFormMessage('');
    }
    return result.valid;
  }

  function continueToNextStep() {
    if (!validateCurrentStep()) return;
    setErrors({});
    setFormMessage('');
    setStep((current) => Math.min(5, current + 1));
  }

  function goBack() {
    setErrors({});
    setFormMessage('');
    setStep((current) => Math.max(1, current - 1));
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const addedFiles = Array.from(fileList).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    const nextFiles = [...files, ...addedFiles];
    setFiles(nextFiles);
    const result = validateFiles(nextFiles, filePolicy);
    setErrors(result.errors);
    setFormMessage(
      result.valid ? '' : 'Correct the attachment issues before continuing.',
    );
  }

  function removeFile(index: number) {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(nextFiles);
    const result = validateFiles(nextFiles, filePolicy);
    setErrors(result.errors);
    if (result.valid) setFormMessage('');
  }

  function submit() {
    const submissionResult = validateSubmission(
      metadata,
      answers,
      metadataFields,
      vettingQuestions,
    );
    const fileResult = validateFiles(files, filePolicy);
    const nextErrors = {
      ...submissionResult.errors,
      ...fileResult.errors,
    };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormMessage('Review the highlighted fields before submitting.');
      setStep(submissionResult.valid ? 4 : 2);
      return;
    }

    setBusy(true);
    setFormMessage('');
    try {
      const input: SubmissionInput = {
        idempotencyToken: crypto.randomUUID(),
        submissionType: initialSubmission ? 'CORRECTION' : 'NEW',
        metadata,
        answers,
        attachments: files,
      };
      const saved = initialSubmission
        ? localSubmissionService.correct(
            initialSubmission.submissionId,
            input,
            userEmail,
          )
        : localSubmissionService.submit(input, userEmail);
      setReceipt(saved);
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'The submission could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (receipt) {
    return (
      <section className="success" aria-live="polite">
        <div className="successIcon">✓</div>
        <h1>
          {initialSubmission ? 'Correction complete' : 'Submission complete'}
        </h1>
        <p>Your content was validated, routed, and recorded.</p>
        <div className="receipt">
          <span>Submission reference</span>
          <strong>{receipt.submissionId}</strong>
          <span>Destination</span>
          <b>{receipt.targetSheetTab}</b>
          <span>Status</span>
          <b className="status completed">COMPLETED</b>
        </div>
        <button type="button" className="primary" onClick={onSaved}>
          View submissions
        </button>
      </section>
    );
  }

  return (
    <>
      <div className="pageTitle">
        <div>
          <p className="eyebrow">CONTENT ROUTING WORKFLOW</p>
          <h1>
            {initialSubmission
              ? `Correct ${initialSubmission.submissionId}`
              : 'Route content to ChatCST'}
          </h1>
          <p>
            Provide complete metadata and supporting files. You remain
            responsible for contextual accuracy.
          </p>
        </div>
        <span className="draft">
          {initialSubmission
            ? `Version ${initialSubmission.submissionVersion + 1}`
            : 'Draft'}
        </span>
      </div>

      <StepIndicator currentStep={step} onStepChange={setStep} />

      <section className="card">
        {step === 1 && <ContextStep userEmail={userEmail} />}
        {step === 2 && (
          <MetadataStep
            errors={errors}
            metadata={metadata}
            onChange={updateMetadata}
          />
        )}
        {step === 3 && (
          <VettingStep
            answers={answers}
            errors={errors}
            questions={visibleQuestions}
            onChange={updateAnswer}
          />
        )}
        {step === 4 && (
          <AttachmentStep
            errors={errors}
            files={files}
            onAdd={addFiles}
            onRemove={removeFile}
          />
        )}
        {step === 5 && (
          <Review answers={answers} files={files} metadata={metadata} />
        )}

        {formMessage && (
          <div className="errorBox" role="alert">
            {formMessage}
          </div>
        )}

        <footer className="actions">
          <button type="button" disabled={step === 1} onClick={goBack}>
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              className="primary"
              onClick={continueToNextStep}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={submit}
            >
              {busy
                ? 'Submitting…'
                : initialSubmission
                  ? 'Submit correction'
                  : 'Submit content'}
            </button>
          )}
        </footer>
      </section>
    </>
  );
}

function ContextStep({ userEmail }: { userEmail: string }) {
  return (
    <div>
      <h2>Submission context</h2>
      <p className="muted">
        Your Workspace identity is verified again by the production server.
      </p>
      <div className="contextGrid">
        <div>
          <span>Submitting as</span>
          <strong>{userEmail}</strong>
        </div>
        <div>
          <span>Access</span>
          <strong>Workspace identity verified</strong>
        </div>
      </div>
      <div className="callout">
        Destinations are derived from validated answers. Folder IDs and Sheet
        tabs can never be selected in the browser.
      </div>
    </div>
  );
}

function MetadataStep({
  errors,
  metadata,
  onChange,
}: {
  errors: Record<string, string>;
  metadata: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div>
      <h2>Document metadata</h2>
      <p className="muted">Fields marked * are required.</p>
      <div className="grid">
        {metadataFields.map((field) => (
          <MetadataInput
            key={field.key}
            error={errors[`metadata.${field.key}`]}
            field={field}
            value={metadata[field.key]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function MetadataInput({
  error,
  field,
  value,
  onChange,
}: {
  error?: string;
  field: MetadataField;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const common = {
    value,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => onChange(field.key, event.target.value),
  };

  return (
    <FormField error={error} helpText={field.helpText} label={label}>
      {field.type === 'textarea' ? (
        <textarea {...common} />
      ) : field.options ? (
        <select {...common}>
          <option value="">Select…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={field.type === 'date' ? 'date' : 'text'} {...common} />
      )}
    </FormField>
  );
}

function VettingStep({
  answers,
  errors,
  questions,
  onChange,
}: {
  answers: Record<string, string>;
  errors: Record<string, string>;
  questions: VettingQuestion[];
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div>
      <h2>Vetting questions</h2>
      <p className="muted">
        Answers drive deterministic routing to governed destinations.
      </p>
      <div className="questions">
        {questions.map((question) => (
          <FormField
            key={question.key}
            error={errors[`answers.${question.key}`]}
            label={`${question.displayOrder}. ${question.label}${question.required ? ' *' : ''}`}
          >
            {question.options ? (
              <select
                value={answers[question.key]}
                onChange={(event) => onChange(question.key, event.target.value)}
              >
                <option value="">Select…</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={answers[question.key]}
                onChange={(event) => onChange(question.key, event.target.value)}
              />
            )}
          </FormField>
        ))}
      </div>
    </div>
  );
}

function AttachmentStep({
  errors,
  files,
  onAdd,
  onRemove,
}: {
  errors: Record<string, string>;
  files: AttachmentInput[];
  onAdd: (fileList: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <h2>Supporting attachments</h2>
      <p className="muted">
        PDF, DOCX, XLSX, or TXT · up to 10 MB each · maximum 5 files.
      </p>
      <label className="dropzone">
        <input
          aria-label="Supporting attachments"
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.txt"
          onChange={(event) => onAdd(event.target.files)}
        />
        <b>Choose files</b>
        <span>or drag them here</span>
      </label>
      {(errors.attachments || errors.attachmentsTotal) && (
        <p className="error">{errors.attachments || errors.attachmentsTotal}</p>
      )}
      <div className="fileList">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`}>
            <span>▧</span>
            <div>
              <b>{file.name}</b>
              <small>{(file.size / 1024).toFixed(1)} KB</small>
              {(errors[`attachment.${index}`] ||
                errors[`attachment.${index}.size`]) && (
                <small className="error">
                  {errors[`attachment.${index}`] ||
                    errors[`attachment.${index}.size`]}
                </small>
              )}
            </div>
            <button type="button" onClick={() => onRemove(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Review({ metadata, answers, files }: ReviewProps) {
  const route = routes.find((candidate) =>
    candidate.conditions.every(
      (condition) => answers[condition.key] === condition.equals,
    ),
  );

  return (
    <div>
      <h2>Review and submit</h2>
      <p className="muted">
        Confirm these details before creating the auditable record.
      </p>
      <div className="review">
        <div>
          <h3>Metadata</h3>
          {metadataFields
            .filter((field) => metadata[field.key])
            .map((field) => (
              <p key={field.key}>
                <span>{field.label}</span>
                <b>{metadata[field.key]}</b>
              </p>
            ))}
        </div>
        <div>
          <h3>Vetting</h3>
          {vettingQuestions
            .filter((question) => answers[question.key])
            .map((question) => (
              <p key={question.key}>
                <span>{question.label}</span>
                <b>{answers[question.key]}</b>
              </p>
            ))}
        </div>
        <div>
          <h3>Attachments</h3>
          <p>
            <span>Files</span>
            <b>{files.length || 'None'}</b>
          </p>
        </div>
        <div className="routePreview">
          <h3>Resolved route</h3>
          <strong>{route?.routeKey ?? 'Requires review'}</strong>
          <span>
            {route?.dataSummaryTab ?? 'No approved destination found'}
          </span>
        </div>
      </div>
    </div>
  );
}
