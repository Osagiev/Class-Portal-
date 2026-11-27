import { useState } from "react";
import type { FeedPost } from "../lib/types";
import CommentThread from "./CommentThread";

export default function PostCard({ post }: { post: FeedPost }) {
  const [showComments, setShowComments] = useState(false);
  const date = post.createdAt?.toDate ? post.createdAt.toDate() : null;

  return (
    <article className="post-card">
      <header>
        <h3>{post.title}</h3>
        <span className="post-meta">
          {post.authorName}
          {date && ` • ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        </span>
      </header>
      <p className="post-body">{post.body}</p>

      {post.link && (
        <div className="post-attachments">
          <a href={post.link} target="_blank" rel="noreferrer">
            🔗 Open link
          </a>
        </div>
      )}

      <button
        className="comment-toggle"
        onClick={() => setShowComments((s) => !s)}
      >
        {showComments ? "Hide comments" : "Comments"}
      </button>
      {showComments && <CommentThread postId={post.id} />}
    </article>
  );
}
