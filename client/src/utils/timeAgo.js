/**
 * Formats an ISO date string into a short relative time label, e.g. "2h", "3d", "5w".
 * Falls back to a locale date string for anything older than ~4 weeks.
 */
export const timeAgo = (isoDate) => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'w', secs: 604800 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
  ];

  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label}`;
  }
  return 'just now';
};
