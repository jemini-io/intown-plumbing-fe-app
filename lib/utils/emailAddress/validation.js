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
 * @param {string} email - The email address to validate
 * @returns {boolean} true if the email is valid, false otherwise
 */
function isValidEmail(emailAddress) {
  if (!emailAddress || typeof emailAddress !== "string") {
    return false;
  }
  return EMAIL_REGEX.test(emailAddress);
}

/**
 * Gets the email validation regex pattern (for use in other contexts)
 * @returns {RegExp} The email regex pattern
 */
function getEmailRegex() {
  return EMAIL_REGEX;
}

module.exports = {
  isValidEmail,
  getEmailRegex,
};


