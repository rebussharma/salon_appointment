// src/services/validation.ts

// Regular expressions for validation
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{10}$|^\d{3}[-.]?\d{3}[-.]?\d{4}$|^\(\d{3}\)\s?\d{3}[-.]?\d{4}$/;

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  required: (value: any, fieldName: string = 'This field'): ValidationResult => {
    const isValid = Boolean(value) && (typeof value === 'string' ? value.trim().length > 0 : true);
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} is required`
    };
  },

  minLength: (value: string, min: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = value.length >= min;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} must be at least ${min} characters`
    };
  },

  maxLength: (value: string, max: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = value.length <= max;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} must be at most ${max} characters`
    };
  },

  email: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    const isValid = EMAIL_REGEX.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid email address'
    };
  },

  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    const isValid = PHONE_REGEX.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid phone number'
    };
  },

  emailOrPhone: (email: string, phone: string): ValidationResult => {
    const isValid = Boolean(email) || Boolean(phone);
    return {
      isValid,
      error: isValid ? undefined : 'Either email or phone is required'
    };
  }
};

// Validation schema for client info
export const validateClientInfo = (data: {
  name: string;
  emailId: string;
  phone: string;
  message: string;
}) => {
  const errors: Record<string, string> = {};

  // Validate name
  const nameValidation = validators.required(data.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  } else {
    const minLengthValidation = validators.minLength(data.name, 2, 'Name');
    if (!minLengthValidation.isValid) {
      errors.name = minLengthValidation.error!;
    }

    const maxLengthValidation = validators.maxLength(data.name, 50, 'Name');
    if (!maxLengthValidation.isValid) {
      errors.name = maxLengthValidation.error!;
    }
  }

  // Validate email
  if (data.emailId) {
    const emailValidation = validators.email(data.emailId);
    if (!emailValidation.isValid) {
      errors.emailId = emailValidation.error!;
    } else {
      const maxLengthValidation = validators.maxLength(data.emailId, 60, 'Email');
      if (!maxLengthValidation.isValid) {
        errors.emailId = maxLengthValidation.error!;
      }
    }
  }

  // Validate phone
  if (data.phone) {
    const phoneValidation = validators.phone(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error!;
    }
  }

  // Validate email or phone required
  const emailOrPhoneValidation = validators.emailOrPhone(data.emailId, data.phone);
  if (!emailOrPhoneValidation.isValid) {
    if (!errors.emailId) errors.emailId = emailOrPhoneValidation.error!;
    if (!errors.phone) errors.phone = emailOrPhoneValidation.error!;
  }

  // Validate message length if provided
  if (data.message) {
    const maxLengthValidation = validators.maxLength(data.message, 250, 'Message');
    if (!maxLengthValidation.isValid) {
      errors.message = maxLengthValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate booking data completeness
export const validateBookingData = (data: {
  selectedServices: any[];
  selectedArtist: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
}) => {
  const errors: Record<string, string> = {};

  if (!data.selectedServices || data.selectedServices.length === 0) {
    errors.services = 'Please select at least one service';
  }

  if (!data.selectedArtist) {
    errors.artist = 'Please select an artist';
  }

  if (!data.selectedDate) {
    errors.date = 'Please select a date';
  }

  if (!data.selectedTime) {
    errors.time = 'Please select a time';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};