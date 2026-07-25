const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export const Avatar = ({ user, size = 'md', className = '' }) => {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const sizeClasses = sizeMap[size] || sizeMap.md;

  if (user?.profilePicture?.url) {
    return (
      <img
        src={user.profilePicture.url}
        alt={user.name}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${className} flex items-center justify-center rounded-full bg-teal-500 font-semibold text-paper-100`}
      aria-label={user?.name || 'User'}
    >
      {initials}
    </div>
  );
};
