export const PostSkeleton = () => (
  <div className="contact-frame mb-6 animate-pulse">
    <div className="flex items-center gap-3 p-4">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-2 w-16" />
      </div>
    </div>
    <div className="skeleton h-80 w-full" />
    <div className="space-y-2 p-4">
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  </div>
);

export const FeedSkeleton = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="flex items-center gap-6 p-6 animate-pulse">
    <div className="skeleton h-24 w-24 rounded-full" />
    <div className="space-y-3">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-3 w-56" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  </div>
);

export const UserRowSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="skeleton h-10 w-10 rounded-full" />
    <div className="space-y-2">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-2 w-32" />
    </div>
  </div>
);
