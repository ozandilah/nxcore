// shared/components/forms/FormSelectField/index.tsx

"use client";

import { cn } from "@/shared/lib/utils";
import { forwardRef } from "react";
import { Label } from "@/shared/components/ui/label";
import { FormError } from "@/shared/components/atoms/FormError";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}


const FormSelectField = forwardRef<HTMLSelectElement, FormSelectFieldProps>(
  (
    {
      id,
      name,
      label,
      options,
      value,
      onChange,
      error,
      required = false,
      disabled = false,
      placeholder = "Pilih...",
      className,
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <FormError message={error} />}
      </div>
    );
  }
);

FormSelectField.displayName = "FormSelectField";

export default FormSelectField;


