import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Avatar } from './Avatar';
import { UserRowSkeleton } from './Skeletons';
import { userService } from '../services/userService';

export const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    userService
      .getSuggestedUsers()
      .then((data) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleFollow = async (targetUser) => {
    try {
      await userService.followUser(targetUser._id);
      setFollowingIds((prev) => new Set(prev).add(targetUser._id));
      toast.success(`Following ${targetUser.username}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="contact-frame sticky top-20 p-4">
      <h2 className="label-mono mb-3">Suggested for you</h2>
      {isLoading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => <UserRowSkeleton key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-600 dark:text-paper-300/60">No suggestions right now.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((suggestedUser) => (
            <li key={suggestedUser._id} className="flex items-center gap-3">
              <Link to={`/profile/${suggestedUser.username}`}>
                <Avatar user={suggestedUser} size="sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/profile/${suggestedUser.username}`} className="block truncate text-sm font-semibold">
                  {suggestedUser.username}
                </Link>
                <p className="truncate text-xs text-ink-600 dark:text-paper-300/60">{suggestedUser.name}</p>
              </div>
              <button
                onClick={() => handleFollow(suggestedUser)}
                disabled={followingIds.has(suggestedUser._id)}
                className="shrink-0 text-xs font-semibold text-safelight-500 disabled:text-ink-600 dark:disabled:text-paper-300/40"
              >
                {followingIds.has(suggestedUser._id) ? 'Following' : 'Follow'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
