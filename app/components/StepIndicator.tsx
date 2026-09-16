const INTAKE_STEPS = [
  'Context',
  'Metadata',
  'Vetting',
  'Attachments',
  'Review',
] as const;

interface StepIndicatorProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  onStepChange,
}: StepIndicatorProps) {
  return (
    <div className="stepper" aria-label="Submission progress">
      {INTAKE_STEPS.map((label, index) => {
        const step = index + 1;
        const isComplete = currentStep > step;
        const className =
          currentStep === step ? 'current' : isComplete ? 'done' : '';

        return (
          <button
            key={label}
            type="button"
            className={className}
            disabled={step >= currentStep}
            onClick={() => onStepChange(step)}
          >
            <i>{isComplete ? '✓' : step}</i>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
