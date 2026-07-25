import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/Skeletons';
import { postService } from '../services/postService';

export const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    postService
      .getPostById(id)
      .then((data) => setPost(data.post))
      .catch((error) => {
        setNotFound(true);
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="mx-auto max-w-xl"><PostSkeleton /></div>;

  if (notFound || !post) {
    return (
      <div className="contact-frame mx-auto max-w-xl p-10 text-center">
        <p className="mb-1 font-display text-lg">Post not found</p>
        <p className="mb-4 text-sm text-ink-600 dark:text-paper-300/60">
          It may have been deleted or the link is incorrect.
        </p>
        <Link to="/" className="btn-secondary">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PostCard post={post} />
    </div>
  );
};
