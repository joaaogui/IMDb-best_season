/**
 * Input validation utilities for API routes
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

// Characters allowed in search queries
const ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9\s\-'.:,&!?()]+$/;

// Maximum lengths
const MAX_TITLE_LENGTH = 200;

/**
 * Validate and sanitize a TV show title search query
 */
export function validateTitle(title: string | null | undefined): ValidationResult {
  if (!title || typeof title !== "string") {
    return { valid: false, error: "Title parameter is required" };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    return { 
      valid: false, 
      error: `Title too long (max ${MAX_TITLE_LENGTH} characters)` 
    };
  }

  if (!ALLOWED_CHARS_REGEX.test(trimmed)) {
    return { 
      valid: false, 
      error: "Title contains invalid characters" 
    };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Create a safe error message for production
 * Hides implementation details from end users
 */
export function getSafeErrorMessage(error: unknown, fallback: string): string {
  // In development, return full error messages
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : fallback;
  }

  // In production, only return safe error messages
  if (error instanceof Error) {
    // List of safe error messages that can be shown to users
    const safeMessages = [
      "Title not found",
      "Movie not found",
      "Series not found",
      "Please search for a TV series",
      "Invalid IMDb ID",
      "Request limit reached",
    ];

    if (safeMessages.some((msg) => error.message.includes(msg))) {
      return error.message;
    }
  }

  return fallback;
}

