import { useState, type FormEvent } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../contexts/AuthContext";

interface CommentThreadProps {
  postId: string;
  /**
   * When provided, commenting is gated: only allowed while `canComment` is
   * true. Used for birthday posts, where commenting is restricted to the
   * student's actual birthday. When omitted, commenting is always open
   * (ordinary announcements/materials/updates posts).
   */
  canComment?: boolean;
  gateMessage?: string;
}

export default function CommentThread({
  postId,
  canComment = true,
  gateMessage = "Commenting isn't open on this post right now.",
}: CommentThreadProps) {
  const { profile } = useAuth();
  const { comments, addComment } = useComments(postId);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile || !body.trim()) return;
    setBusy(true);
    try {
      await addComment(profile.uid, profile.fullName, body.trim());
      setBody("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="comment-thread">
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <span className="comment-author">{c.authorName}</span>
          <span className="comment-body">{c.body}</span>
        </div>
      ))}

      {canComment ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
          />
          <button type="submit" disabled={busy || !body.trim()}>
            Post
          </button>
        </form>
      ) : (
        <p className="comment-gate-message">{gateMessage}</p>
      )}
    </div>
  );
}
