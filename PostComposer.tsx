import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { PostCategory } from "../lib/types";

interface PostComposerProps {
  category: PostCategory;
  /** Materials posts can optionally include a link (text/URL only --
   * file uploads aren't supported since Cloud Storage requires the
   * Blaze plan and this project stays on the free Spark plan). */
  withAttachments?: boolean;
}

export default function PostComposer({
  category,
  withAttachments = false,
}: PostComposerProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile?.isAdmin) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile || !title.trim() || !body.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await addDoc(collection(db, "posts"), {
        category,
        title: title.trim(),
        body: body.trim(),
        link: link.trim() || undefined,
        authorUid: profile.uid,
        authorName: profile.fullName,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setBody("");
      setLink("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-composer">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your post..."
        rows={3}
        required
      />
      {withAttachments && (
        <div className="attachments-row">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Optional link (e.g. Drive URL)"
            type="url"
          />
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
