import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Share2, Bookmark, Trash2, Pencil } from 'lucide-react';
import { Avatar } from './Avatar';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

export const PostCard = ({ post, onDeleted, forwardedRef }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(post.caption);

  const isOwner = user?._id === post.author?._id;

  const handleLikeToggle = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    try {
      if (nextLiked) await postService.likePost(post._id);
      else await postService.unlikePost(post._id);
    } catch (error) {
      // revert on failure
      setIsLiked(!nextLiked);
      setLikesCount((c) => (nextLiked ? Math.max(0, c - 1) : c + 1));
      toast.error(error.message);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      const data = await postService.toggleBookmark(post._id);
      setIsBookmarked(data.isBookmarked);
      toast.success(data.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleShare = async () => {
    try {
      await postService.sharePost(post._id);
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCaptionSave = async () => {
    try {
      await postService.updatePost(post._id, captionDraft);
      post.caption = captionDraft;
      setIsEditing(false);
      toast.success('Caption updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <article ref={forwardedRef} className="contact-frame mb-6">
      <header className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
          <Avatar user={post.author} size="md" />
          <div>
            <p className="text-sm font-semibold">{post.author?.name}</p>
            <p className="label-mono">@{post.author?.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing((v) => !v)}
              aria-label="Edit caption"
              className="rounded-full p-2 text-ink-600 hover:bg-ink-900/5 dark:text-paper-300/60 dark:hover:bg-paper-100/5"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete post"
              className="rounded-full p-2 text-danger-500 hover:bg-danger-500/10"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </header>

      <img src={post.image?.url} alt={post.caption || 'Post image'} className="max-h-[560px] w-full object-cover" loading="lazy" />

      <div className="p-4">
        <div className="mb-3 flex items-center gap-5">
          <button onClick={handleLikeToggle} className="flex items-center gap-1.5 text-sm" aria-pressed={isLiked}>
            <Heart size={20} className={isLiked ? 'fill-danger-500 text-danger-500' : 'text-ink-700 dark:text-paper-300'} />
            <span className="label-mono">{likesCount}</span>
          </button>
          <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 text-sm">
            <MessageCircle size={20} className="text-ink-700 dark:text-paper-300" />
            <span className="label-mono">{post.commentsCount ?? post.comments?.length ?? 0}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-sm">
            <Share2 size={20} className="text-ink-700 dark:text-paper-300" />
          </button>
          <button onClick={handleBookmarkToggle} className="ml-auto">
            <Bookmark size={20} className={isBookmarked ? 'fill-safelight-500 text-safelight-500' : 'text-ink-700 dark:text-paper-300'} />
          </button>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <input
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              className="input-field"
              maxLength={2200}
            />
            <button onClick={handleCaptionSave} className="btn-primary">Save</button>
          </div>
        ) : (
          post.caption && (
            <p className="text-sm">
              <Link to={`/profile/${post.author?.username}`} className="font-semibold">
                {post.author?.username}
              </Link>{' '}
              {post.caption}
            </p>
          )
        )}

        {showComments && <CommentSection postId={post._id} initialComments={post.comments} />}
      </div>
    </article>
  );
};

// Kept in the same file since it's tightly coupled to PostCard's expand/collapse state.
const CommentSection = ({ postId, initialComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(Array.isArray(initialComments) ? initialComments : []);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const data = await postService.addComment(postId, text.trim());
      setComments((prev) => [data.comment, ...prev]);
      setText('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-3 border-t border-ink-700/10 pt-3 dark:border-paper-300/10">
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          className="input-field"
        />
        <button type="submit" disabled={isSubmitting || !text.trim()} className="btn-secondary">
          Post
        </button>
      </form>
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <li key={comment._id} className="flex items-start justify-between gap-2 text-sm">
            <p>
              <Link to={`/profile/${comment.user?.username}`} className="font-semibold">
                {comment.user?.username}
              </Link>{' '}
              {comment.text}
            </p>
            {(user?._id === comment.user?._id) && (
              <button onClick={() => handleDelete(comment._id)} aria-label="Delete comment" className="text-ink-600 hover:text-danger-500">
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
        {comments.length === 0 && <p className="label-mono">No comments yet</p>}
      </ul>
    </div>
  );
};
