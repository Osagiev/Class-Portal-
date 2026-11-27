import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Comment } from "../lib/types";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)));
      setLoading(false);
    });
    return unsub;
  }, [postId]);

  async function addComment(authorUid: string, authorName: string, body: string) {
    await addDoc(collection(db, "comments"), {
      postId,
      authorUid,
      authorName,
      body,
      createdAt: serverTimestamp(),
    });
  }

  return { comments, loading, addComment };
}
