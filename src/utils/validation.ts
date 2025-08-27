import { ValidationError } from "./errors";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "array" | "object" | "email";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export const validateInput = (data: any, rules: ValidationRule[]): void => {
  const errors: { [key: string]: string[] } = {};

  for (const rule of rules) {
    const {
      field,
      required,
      type,
      minLength,
      maxLength,
      min,
      max,
      pattern,
      custom,
    } = rule;
    const value = data[field];

    // Check if required field is present
    if (required && (value === undefined || value === null || value === "")) {
      if (!errors[field]) errors[field] = [];
      errors[field].push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not required and not present
    if (!required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (type && value !== undefined && value !== null) {
      switch (type) {
        case "string":
          if (typeof value !== "string") {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be a string`);
          }
          break;
        case "number":
          if (typeof value !== "number" || isNaN(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be a valid number`);
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be a boolean`);
          }
          break;
        case "array":
          if (!Array.isArray(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be an array`);
          }
          break;
        case "object":
          if (typeof value !== "object" || Array.isArray(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be an object`);
          }
          break;
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== "string" || !emailRegex.test(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be a valid email address`);
          }
          break;
      }
    }

    // String length validation
    if (typeof value === "string") {
      if (minLength && value.length < minLength) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(
          `${field} must be at least ${minLength} characters long`,
        );
      }
      if (maxLength && value.length > maxLength) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(
          `${field} must be no more than ${maxLength} characters long`,
        );
      }
    }

    // Number range validation
    if (typeof value === "number") {
      if (min !== undefined && value < min) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} must be at least ${min}`);
      }
      if (max !== undefined && value > max) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} must be no more than ${max}`);
      }
    }

    // Pattern validation
    if (pattern && typeof value === "string" && !pattern.test(value)) {
      if (!errors[field]) errors[field] = [];
      errors[field].push(`${field} format is invalid`);
    }

    // Custom validation
    if (custom && value !== undefined && value !== null) {
      const customResult = custom(value);
      if (customResult !== true) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(
          typeof customResult === "string"
            ? customResult
            : `${field} is invalid`,
        );
      }
    }
  }

  // Throw validation error if any errors found
  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }
};

export const validateIds = (ids: any): number[] => {
  if (!Array.isArray(ids)) {
    throw new ValidationError("IDs must be provided as an array");
  }

  const numericIds = ids.map((id) => {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new ValidationError(
        `Invalid ID: ${id}. IDs must be positive numbers`,
      );
    }
    return numId;
  });

  return numericIds;
};

export const validateId = (id: any): number => {
  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new ValidationError(
      `Invalid ID: ${id}. ID must be a positive number`,
    );
  }
  return numId;
};
