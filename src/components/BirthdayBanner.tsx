import { useEffect } from "react";
import { useTodaysBirthdayPosts, ensureTodaysBirthdayPost } from "../hooks/useBirthdayPosts";
import { useAuth } from "../contexts/AuthContext";
import { todayAsISODate } from "../lib/birthday";
import CommentThread from "./CommentThread";

export default function BirthdayBanner() {
  const { profile } = useAuth();
  const { posts } = useTodaysBirthdayPosts();

  useEffect(() => {
    if (profile) {
      ensureTodaysBirthdayPost(profile).catch((err) =>
        console.error("Couldn't create today's birthday post:", err)
      );
    }
  }, [profile]);

  if (posts.length === 0) return null;

  return (
    <div className="birthday-banner">
      {posts.map((post) => {
        // Commenting is gated by the post's own generated date, not just
        // "is this banner showing today" — this same component (or a
        // future history view) could render an older birthday post, and
        // the gate must still close once that day has passed. The
        // Firestore security rule for the "comments" collection enforces
        // this same check server-side, so this is a UI convenience, not
        // the actual boundary.
        const canComment = post.dateGenerated === todayAsISODate();
        return (
          <div key={post.id} className="birthday-post">
            <h3>🎉 It's {post.studentName}'s birthday!</h3>
            <p>Drop a comment to wish them well.</p>
            <CommentThread
              postId={`birthday_${post.id}`}
              canComment={canComment}
              gateMessage="Birthday comments are only open on the day itself."
            />
          </div>
        );
      })}
    </div>
  );
}
