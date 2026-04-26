import type { FieldProps } from './Field.types';

/**
 * Form field shell: label + slot for an input + optional hint or error.
 * Keeps spacing and typography consistent across forms in the app. The actual
 * input must still be passed an `id` matching `htmlFor`; this is intentional
 * so the wrapper stays generic (works with Input, Select, NumberStepper, etc).
 */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className = '',
  children,
}: FieldProps) {
  return (
    <div
      className={['flex w-full flex-col gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
