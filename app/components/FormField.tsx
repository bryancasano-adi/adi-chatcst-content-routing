import type { ReactNode } from 'react';

interface FormFieldProps {
  children: ReactNode;
  error?: string;
  helpText?: string;
  label: string;
}

export function FormField({
  children,
  error,
  helpText,
  label,
}: FormFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {helpText && <small>{helpText}</small>}
      {error && <small className="error">{error}</small>}
    </label>
  );
}
