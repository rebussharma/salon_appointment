import { useCallback, useState } from 'react';

export interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

export interface ValidationState {
  [key: string]: string | null;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationState>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = useCallback((name: string, value: any) => {
    if (rules[name]) {
      const error = rules[name](value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return error;
    }
    return null;
  }, [rules]);

  const handleBlur = useCallback((name: string, value: any) => {
    setTouched(prev => new Set(prev).add(name));
    validate(name, value);
  }, [validate]);

  const validateAll = useCallback((values: any) => {
    const allErrors: ValidationState = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = rules[name](values[name]);
      if (error) {
        isValid = false;
        allErrors[name] = error;
      }
    });

    setErrors(allErrors);
    setTouched(new Set(Object.keys(rules)));
    return isValid;
  }, [rules]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    errors,
    touched,
    validate,
    handleBlur,
    validateAll,
    resetValidation
  };
};