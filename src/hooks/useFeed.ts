import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { FeedPost, PostCategory } from "../lib/types";

/** Live-subscribes to posts in a given category, newest first. */
export function useFeed(category: PostCategory) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeedPost)));
        setLoading(false);
      },
      (err) => {
        console.error(`Feed subscription error (${category}):`, err);
        setLoading(false);
      }
    );
    return unsub;
  }, [category]);

  return { posts, loading };
}
