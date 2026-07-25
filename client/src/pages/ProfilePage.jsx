import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Grid, Settings } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { ProfileHeaderSkeleton } from '../components/Skeletons';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = currentUser?.username === username;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUserByUsername(username);
      setProfile(data.user);
      setPostsCount(data.postsCount);
      setIsFollowing(data.isFollowing);

      // Feed endpoint doesn't filter by author, so we search posts by the
      // author's own posts via the search endpoint on their username/hashtag-free query.
      // For a dedicated "posts by user" list we filter the general feed client-side
      // as a pragmatic approach without needing a new backend route.
      const feedData = await postService.getFeed(1, 50);
      setPosts(feedData.posts.filter((p) => p.author?.username === username));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile._id);
      } else {
        await userService.followUser(profile._id);
      }
      setIsFollowing((prev) => !prev);
      setProfile((prev) => ({
        ...prev,
        followersCount: (prev.followersCount || 0) + (isFollowing ? -1 : 1),
      }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <ProfileHeaderSkeleton />;
  if (!profile) return <p className="text-center text-sm">User not found.</p>;

  return (
    <div>
      <header className="contact-frame mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row">
        <Avatar user={profile} size="xl" />
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row">
            <h1 className="font-display text-xl font-semibold">{profile.name}</h1>
            {isOwnProfile ? (
              <Link to="/settings/profile" className="btn-secondary">
                <Settings size={14} /> Edit profile
              </Link>
            ) : (
              <button onClick={handleFollowToggle} className={isFollowing ? 'btn-secondary' : 'btn-primary'}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <p className="label-mono mb-3">@{profile.username}</p>
          <div className="mb-3 flex justify-center gap-6 sm:justify-start">
            <Stat label="Posts" value={postsCount} />
            <Stat label="Followers" value={profile.followersCount ?? profile.followers?.length ?? 0} />
            <Stat label="Following" value={profile.followingCount ?? profile.following?.length ?? 0} />
          </div>
          {profile.bio && <p className="text-sm">{profile.bio}</p>}
        </div>
      </header>

      <div className="mb-3 flex items-center gap-2 label-mono">
        <Grid size={14} /> Posts
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ink-600 dark:text-paper-300/60">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} to={`/posts/${post._id}`} className="aspect-square overflow-hidden rounded-card">
              <img src={post.image?.url} alt={post.caption || 'Post'} className="h-full w-full object-cover" loading="lazy" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="text-center sm:text-left">
    <p className="font-semibold">{value}</p>
    <p className="label-mono">{label}</p>
  </div>
);
