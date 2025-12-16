// shared/components/forms/FormInputField/index.tsx

"use client";

import { cn } from "@/shared/lib/utils";
import { forwardRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { FormError } from "@/shared/components/atoms/FormError";

export interface FormInputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
}


const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  (
    {
      id,
      name,
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      error,
      required = false,
      disabled = false,
      className,
      autoComplete,
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        <Input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            "transition-all h-10 sm:h-11 text-sm sm:text-base",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {error && <FormError message={error} />}
      </div>
    );
  }
);

// (opsional tapi bagus untuk debug/dev tools)
FormInputField.displayName = "FormInputField";

export default FormInputField;


