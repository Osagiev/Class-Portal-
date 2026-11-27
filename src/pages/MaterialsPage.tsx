import { useFeed } from "../hooks/useFeed";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";

export default function MaterialsPage() {
  const { posts, loading } = useFeed("materials");

  return (
    <div className="feed-page">
      {/* Links/text only -- no file upload, since Cloud Storage requires
          the Blaze plan and this project is staying on the free Spark
          plan. Admins can still share Drive links, docs, etc. */}
      <PostComposer category="materials" withAttachments />
      {loading && <p className="loading-text">Loading...</p>}
      {!loading && posts.length === 0 && (
        <p className="empty-text">No materials posted yet.</p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
