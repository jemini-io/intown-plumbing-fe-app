// Sanitize countryCode: remove leading '+' if present
export function sanitizeCountryCode(countryCode) {
  return countryCode?.replace(/^\+/, '') || countryCode;
}