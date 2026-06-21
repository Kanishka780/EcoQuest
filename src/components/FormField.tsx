import React, { useId } from "react";
 
interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
}
 
/**
 * Accessible form field wrapper.
 * Automatically wires up label, error, and hint via ARIA attributes.
 *
 * Usage:
 * ```tsx
 * <FormField label="Weekly driving (km)" error={errors.weeklyKm} required>
 *   {(props) => <input type="number" {...props} />}
 * </FormField>
 * ```
 */
export function FormField({
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;
 
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>
 
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
 
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : undefined,
      })}
 
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
 
export default FormField;
