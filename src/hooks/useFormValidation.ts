// src/hooks/useFormValidation.ts
import { useCallback, useEffect, useState } from 'react';

export type ValidatorFn<T = any> = (value: T, formValues?: Record<string, any>) => string | null;

export interface ValidationRules {
  [key: string]: ValidatorFn;
}

export interface ValidationState {
  [key: string]: string | null;
}

export interface ValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface UseFormValidationProps {
  initialValues?: Record<string, any>;
  validationRules: ValidationRules;
  options?: ValidationOptions;
}

export interface UseFormValidationReturn {
  values: Record<string, any>;
  errors: ValidationState;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  validateField: (field: string) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  setFormValues: (values: Record<string, any>) => void;
  isValid: boolean;
  isDirty: boolean;
}

export const useFormValidation = ({
  initialValues = {},
  validationRules,
  options = {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true
  }
}: UseFormValidationProps): UseFormValidationReturn => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<ValidationState>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Reset the form when initialValues change
  useEffect(() => {
    resetForm();
  }, [JSON.stringify(initialValues)]);

  // Validate a single field
  const validateField = useCallback((field: string): string | null => {
    if (!validationRules[field]) return null;
    
    const error = validationRules[field](values[field], values);
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error;
  }, [validationRules, values]);

  // Validate all fields and return true if valid
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationState = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field], values);
      if (error) {
        isValid = false;
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched on form validation
    const allTouched = Object.keys(validationRules).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    
    setTouched(allTouched);
    
    return isValid;
  }, [validationRules, values]);

  // Set a single field value
  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      return newValues;
    });
    
    setIsDirty(true);
    
    if (options.validateOnChange && touched[field]) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validateField, touched, options.validateOnChange]);

  // Handle form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFieldValue(name, fieldValue);
  }, [setFieldValue]);

  // Set a field as touched
  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    if (options.validateOnBlur && isTouched) {
      validateField(field);
    }
  }, [validateField, options.validateOnBlur]);

  // Handle input blur events
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFieldTouched(name, true);
  }, [setFieldTouched]);

  // Set multiple form values at once
  const setFormValues = useCallback((newValues: Record<string, any>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
    
    if (options.validateOnChange) {
      Object.keys(newValues).forEach(field => {
        if (touched[field]) {
          setTimeout(() => validateField(field), 0);
        }
      });
    }
  }, [validateField, touched, options.validateOnChange]);

  // Reset the form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  // Check if the form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    setFieldValue,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFieldTouched,
    setFormValues,
    isValid,
    isDirty
  };
};

// Common validator functions
export const validators = {
  required: (message = 'This field is required') => 
    (value: any) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    },
    
  email: (message = 'Please enter a valid email address') => 
    (value: string) => {
      if (!value) return null; // Skip if empty (use required validator if field is required)
      
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(value) ? null : message;
    },
    
  phone: (message = 'Please enter a valid phone number') => 
    (value: string) => {
      if (!value) return null; // Skip if empty
      
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$|^\d{3}[-.]?\d{3}[-.]?\d{4}$|^\(\d{3}\)\s?\d{3}[-.]?\d{4}$/;
      return phoneRegex.test(value) ? null : message;
    },
    
  minLength: (min: number, message?: string) => 
    (value: string) => {
      if (!value) return null; // Skip if empty
      
      return value.length >= min 
        ? null 
        : message || `Must be at least ${min} characters`;
    },
    
  maxLength: (max: number, message?: string) => 
    (value: string) => {
      if (!value) return null; // Skip if empty
      
      return value.length <= max 
        ? null 
        : message || `Must be at most ${max} characters`;
    },
    
  emailOrPhone: (message = 'Either email or phone is required') => 
    (value: any, formValues?: Record<string, any>) => {
      if (!formValues) return null;
      
      const hasEmail = !!formValues.email || !!formValues.emailId;
      const hasPhone = !!formValues.phone || !!formValues.phoneNumber;
      
      return hasEmail || hasPhone ? null : message;
    }
};