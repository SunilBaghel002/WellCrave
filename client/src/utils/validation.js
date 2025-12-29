// src/utils/validation.js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return regex.test(phone);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validatePincode = (pincode) => {
  // Indian pincode format
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { level: "weak", color: "red", text: "Weak" };
  if (strength <= 4)
    return { level: "medium", color: "yellow", text: "Medium" };
  return { level: "strong", color: "green", text: "Strong" };
};

export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    if (fieldRules.required && (!value || value.trim() === "")) {
      errors[field] = fieldRules.requiredMessage || `${field} is required`;
      return;
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Minimum ${fieldRules.minLength} characters required`;
      return;
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Maximum ${fieldRules.maxLength} characters allowed`;
      return;
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || `Invalid ${field}`;
      return;
    }

    if (value && fieldRules.validate) {
      const customError = fieldRules.validate(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};
