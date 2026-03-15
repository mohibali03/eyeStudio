/**
 * Shared password validation — single source of truth for all frontend forms.
 *
 * Rules:
 *  - 8–20 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character
 */

export const PASSWORD_RULES = [
  { id: "length",  label: "8–20 characters",               test: (p) => p.length >= 8 && p.length <= 20 },
  { id: "upper",   label: "One uppercase letter (A-Z)",    test: (p) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a-z)",    test: (p) => /[a-z]/.test(p) },
  { id: "digit",   label: "One number (0-9)",              test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$…)", test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p) },
];

/** Returns { valid: boolean, failed: string[] } */
export function validatePassword(password) {
  const failed = PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
  return { valid: failed.length === 0, failed };
}

/** Returns 0–5 strength score (number of passing rules) */
export function passwordStrength(password) {
  if (!password) return 0;
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}
