/**
 * Firebase Auth requires an email+password identity. Students log in with
 * their matric number instead, so we map each matric number to a
 * deterministic synthetic email under a reserved, non-routable domain.
 * This email is never shown to the student and never used for actual mail.
 *
 * Normalizing the matric number (uppercase, strip whitespace) before
 * building the synthetic email means small formatting differences
 * ("cst/2021/045" vs "CST/2021/045") still resolve to the same account.
 */

const SYNTHETIC_DOMAIN = "classportal.local";

export function normalizeMatric(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function matricToSyntheticEmail(matric: string): string {
  const normalized = normalizeMatric(matric);
  // Firebase email identifiers can't contain "/" (common in matric numbers
  // like CST/2021/045), so swap separators for a safe, reversible token.
  const safe = normalized.replace(/\//g, "-");
  return `${safe}@${SYNTHETIC_DOMAIN}`;
}
