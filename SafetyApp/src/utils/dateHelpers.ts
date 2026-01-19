// Format time to readable format
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

// Format date for display
export const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time (HH:MM)
export const formatTimeOfDay = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format as "Today at HH:MM" or "Yesterday at HH:MM"
export const formatDateWithTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() === new Date(now.getTime() - 86400000).toDateString();

  if (isToday) {
    return `Today at ${formatTimeOfDay(timestamp)}`;
  }
  if (isYesterday) {
    return `Yesterday at ${formatTimeOfDay(timestamp)}`;
  }

  return `${formatDate(timestamp)} at ${formatTimeOfDay(timestamp)}`;
};
