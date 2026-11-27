import { useFeed } from "../hooks/useFeed";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import type { PostCategory } from "../lib/types";

interface FeedPageProps {
  category: PostCategory;
  emptyMessage: string;
}

export default function FeedPage({ category, emptyMessage }: FeedPageProps) {
  const { posts, loading } = useFeed(category);

  return (
    <div className="feed-page">
      <PostComposer category={category} />
      {loading && <p className="loading-text">Loading...</p>}
      {!loading && posts.length === 0 && <p className="empty-text">{emptyMessage}</p>}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
