import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { UserRowSkeleton } from '../components/Skeletons';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useDebounce } from '../hooks/useDebounce';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setIsLoading(true);
    const request =
      tab === 'users' ? userService.searchUsers(debouncedQuery) : postService.searchPosts(debouncedQuery);

    request
      .then((data) => {
        if (tab === 'users') setUsers(data.users);
        else setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, tab]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-paper-300/50" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users or posts..."
          className="input-field pl-10"
        />
      </div>

      <div className="mb-4 flex gap-2">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>Users</TabButton>
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</TabButton>
      </div>

      {isLoading ? (
        <div>{Array.from({ length: 4 }).map((_, i) => <UserRowSkeleton key={i} />)}</div>
      ) : tab === 'users' ? (
        <ul className="space-y-1">
          {users.map((u) => (
            <li key={u._id}>
              <Link to={`/profile/${u.username}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-ink-900/5 dark:hover:bg-paper-100/5">
                <Avatar user={u} size="md" />
                <div>
                  <p className="text-sm font-semibold">{u.username}</p>
                  <p className="text-xs text-ink-600 dark:text-paper-300/60">{u.name}</p>
                </div>
              </Link>
            </li>
          ))}
          {debouncedQuery && users.length === 0 && (
            <p className="p-4 text-center text-sm text-ink-600 dark:text-paper-300/60">No users found.</p>
          )}
        </ul>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <Link key={post._id} to={`/posts/${post._id}`} className="aspect-square overflow-hidden rounded-card">
              <img src={post.image?.url} alt={post.caption || 'Post'} className="h-full w-full object-cover" loading="lazy" />
            </Link>
          ))}
          {debouncedQuery && posts.length === 0 && (
            <p className="col-span-3 p-4 text-center text-sm text-ink-600 dark:text-paper-300/60">No posts found.</p>
          )}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
      active
        ? 'bg-safelight-500 text-ink-950'
        : 'text-ink-600 hover:bg-ink-900/5 dark:text-paper-300/60 dark:hover:bg-paper-100/5'
    }`}
  >
    {children}
  </button>
);
