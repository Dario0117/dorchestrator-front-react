/**
 * Generate initials from organization name for logo display
 * @param orgName - Organization name (e.g., "Acme Corporation")
 * @returns Initials string (e.g., "AC")
 *
 * @example
 * generateInitials("Acme Corporation") // "AC"
 * generateInitials("My Company") // "MC"
 * generateInitials("Single") // "S"
 * generateInitials("") // ""
 */
export function generateInitials(orgName: string) {
  if (!orgName || orgName.trim() === '') {
    return '';
  }

  // Split by whitespace and filter out empty strings
  const words = orgName
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Take first letter of each word, uppercase
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');

  // Limit to maximum 3 initials for readability
  return initials.slice(0, 3);
}

/**
 * Validate organization slug format
 * @param slug - Slug to validate
 * @returns true if valid, false otherwise
 *
 * Rules:
 * - Only lowercase letters, numbers, and hyphens
 * - Must not start or end with hyphen
 * - No consecutive hyphens
 */
export function isValidSlug(slug: string) {
  if (!slug || slug.trim() === '') {
    return false;
  }

  // Must be lowercase alphanumeric + hyphens only
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Generate a slug suggestion from organization name
 * @param orgName - Organization name
 * @returns Suggested slug (lowercase, hyphenated)
 *
 * @example
 * generateSlugSuggestion("Acme Corporation") // "acme-corporation"
 * generateSlugSuggestion("My Company & Co.") // "my-company-co"
 */
export function generateSlugSuggestion(orgName: string) {
  if (!orgName || orgName.trim() === '') {
    return '';
  }

  return (
    orgName
      .trim()
      .toLowerCase()
      // Replace special characters and spaces with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Remove consecutive hyphens
      .replace(/-+/g, '-')
  );
}
