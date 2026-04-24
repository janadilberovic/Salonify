export function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / 86400);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "upravo sada";
  if (minutes < 60) return `pre ${minutes} min`;
  if (hours < 24) return `pre ${hours} h`;
  if (days === 1) return "juče";
  if (days < 7) return `pre ${days} dana`;
  if (weeks < 5) return `pre ${weeks} nedelje`;
  if (months < 12) return `pre ${months} meseca`;
  return `pre ${years} godina`;
}