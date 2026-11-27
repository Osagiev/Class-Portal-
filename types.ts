import type { Timestamp } from "firebase/firestore";

/** A pre-loaded roster entry. Document ID = normalized matric number. */
export interface RosterEntry {
  matric: string;
  fullName: string;
  /** Birthday as "MM-DD" (year-agnostic, since we only gate by day/month). */
  birthday?: string;
  /** Set true once the student has completed first-login signup. */
  claimed: boolean;
  /** Elevated posting rights (class rep + authorised admins). */
  isAdmin: boolean;
}

/** Public student profile, mirrors roster but owned by the student's uid. */
export interface StudentProfile {
  uid: string;
  matric: string;
  fullName: string;
  birthday?: string;
  isAdmin: boolean;
}

export type PostCategory = "announcements" | "materials" | "updates";

export interface FeedPost {
  id: string;
  category: PostCategory;
  title: string;
  body: string;
  /** Materials-only: optional link (Drive, course summary doc, etc).
   * File uploads aren't supported -- Cloud Storage requires the Blaze
   * plan, and this project stays on the free Spark plan. */
  link?: string;
  authorUid: string;
  authorName: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  body: string;
  createdAt: Timestamp;
}

/** Auto-generated daily birthday post, one per student per calendar year. */
export interface BirthdayPost {
  id: string;
  studentUid: string;
  studentName: string;
  /** "MM-DD", used to gate commenting to the actual day. */
  birthday: string;
  /** Full date this instance was generated for, e.g. "2026-11-25". */
  dateGenerated: string;
  createdAt: Timestamp;
}
