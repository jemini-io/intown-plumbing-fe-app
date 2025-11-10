/**
 * Email validation regex pattern: user@dominio.[ext]+
 * Validates that email has:
 * - One or more characters before @ (user)
 * - @ symbol
 * - One or more characters after @ (domain)
 * - A dot (.)
 * - One or more characters after dot (extension)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates if an email address follows the pattern: user@dominio.[ext]+
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(emailAddress: string): boolean {
  if (!emailAddress || typeof emailAddress !== "string") {
    return false;
  }
  return EMAIL_REGEX.test(emailAddress);
}

/**
 * Gets the email validation regex pattern (for use in other contexts)
 * @returns The email regex pattern
 */
export function getEmailRegex(): RegExp {
  return EMAIL_REGEX;
}


