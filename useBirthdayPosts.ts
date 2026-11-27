import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { todayAsMonthDay, todayAsISODate } from "../lib/birthday";
import type { BirthdayPost, StudentProfile } from "../lib/types";

/**
 * Live-subscribes to today's birthday posts (there may be more than one
 * student sharing a birthday).
 */
export function useTodaysBirthdayPosts() {
  const [posts, setPosts] = useState<BirthdayPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "birthdayPosts"),
      where("dateGenerated", "==", todayAsISODate()),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BirthdayPost)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { posts, loading };
}

/**
 * Ensures today's birthday post exists for the signed-in student if it's
 * their birthday. This is a client-side convenience so the post appears
 * the moment any birthday student opens the app (rather than waiting for
 * a scheduled Cloud Function); the Cloud Function (see /functions) runs
 * once a day as the authoritative generator so posts still appear even
 * if the student never opens the app, and a security rule guarantees a
 * student can only ever write a birthday-post doc for their own uid and
 * today's date, so this client call can't be abused to post on someone
 * else's behalf or on a day that isn't actually their birthday.
 */
export async function ensureTodaysBirthdayPost(profile: StudentProfile) {
  if (!profile.birthday || todayAsMonthDay() !== profile.birthday) return;

  const todayISO = todayAsISODate();
  const postId = `${profile.uid}_${todayISO}`;
  const ref = doc(db, "birthdayPosts", postId);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const post: Omit<BirthdayPost, "id" | "createdAt"> & { createdAt: unknown } = {
    studentUid: profile.uid,
    studentName: profile.fullName,
    birthday: profile.birthday,
    dateGenerated: todayISO,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, post);
}
