import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PostCard } from '../components/PostCard';
import { FeedSkeleton } from '../components/Skeletons';
import { SuggestedUsers } from '../components/SuggestedUsers';
import { postService } from '../services/postService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async (pageNum) => {
    setIsLoading(true);
    try {
      const data = await postService.getFeed(pageNum, 10);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  }, [page, loadPage]);

  const lastPostRef = useInfiniteScroll(loadMore, { hasMore, isLoading });

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><FeedSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          posts.map((post, index) => (
            <PostCard
              key={post._id}
              post={post}
              onDeleted={handleDeleted}
              forwardedRef={index === posts.length - 1 ? lastPostRef : undefined}
            />
          ))
        )}
        {isLoading && posts.length > 0 && <FeedSkeleton count={1} />}
      </div>
      <aside className="hidden lg:block">
        <SuggestedUsers />
      </aside>
    </div>
  );
};

const EmptyFeed = () => (
  <div className="contact-frame p-10 text-center">
    <p className="mb-1 font-display text-lg">Your feed is quiet</p>
    <p className="text-sm text-ink-600 dark:text-paper-300/60">
      Follow people or create your first post to get things moving.
    </p>
  </div>
);
