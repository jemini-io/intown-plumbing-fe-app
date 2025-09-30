export function isJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    // Only return true for objects or arrays
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}