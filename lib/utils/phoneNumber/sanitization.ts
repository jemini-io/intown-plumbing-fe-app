  // Sanitize countryCode: remove leading '+' if present
  export function sanitizeCountryCode(countryCode: string): string {
    return countryCode?.replace(/^\+/, '') || countryCode;
  }