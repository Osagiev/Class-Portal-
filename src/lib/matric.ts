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

/**
 * Firestore document IDs can technically contain "/", but the Firebase
 * console's web UI can't: typing one into the Document ID field gets
 * interpreted as a path separator instead of a literal character. Since
 * roster entries are meant to be addable by hand through the console
 * (no admin script required), the roster collection is keyed by this
 * slash-safe form instead of the raw matric number. Two different
 * matric numbers that only differ by slash placement would collide
 * under this scheme, but that's not a real-world concern for matric
 * numbers, which have a fixed slash-delimited format.
 */
export function matricToDocId(matric: string): string {
  return normalizeMatric(matric).replace(/\//g, "-");
}

export function matricToSyntheticEmail(matric: string): string {
  const docId = matricToDocId(matric);
  return `${docId}@${SYNTHETIC_DOMAIN}`;
}
