import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { UserRowSkeleton } from '../components/Skeletons';
import { notificationService } from '../services/notificationService';
import { timeAgo } from '../utils/timeAgo';

const ICONS = {
  like: <Heart size={16} className="text-danger-500" />,
  comment: <MessageCircle size={16} className="text-teal-500" />,
  follow: <UserPlus size={16} className="text-safelight-500" />,
};

const LABELS = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getNotifications(1, 30)
      .then((data) => setNotifications(data.notifications))
      .finally(() => setIsLoading(false));

    notificationService.markAllAsRead().catch(() => {});
  }, []);

  if (isLoading) {
    return <div className="mx-auto max-w-lg">{Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}</div>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 font-display text-2xl font-semibold">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="contact-frame p-10 text-center">
          <p className="text-sm text-ink-600 dark:text-paper-300/60">You're all caught up.</p>
        </div>
      ) : (
        <ul className="contact-frame divide-y divide-ink-700/10 dark:divide-paper-300/10">
          {notifications.map((n) => (
            <li key={n._id}>
              <Link
                to={n.post ? `/posts/${n.post._id}` : `/profile/${n.sender?.username}`}
                className="flex items-center gap-3 p-3 hover:bg-ink-900/5 dark:hover:bg-paper-100/5"
              >
                <Avatar user={n.sender} size="sm" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">{n.sender?.username}</span> {LABELS[n.type]}
                  <p className="label-mono">{timeAgo(n.createdAt)}</p>
                </div>
                {ICONS[n.type]}
                {n.post?.image?.url && (
                  <img src={n.post.image.url} alt="" className="h-10 w-10 rounded object-cover" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
