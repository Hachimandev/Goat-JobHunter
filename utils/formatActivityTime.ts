export function formatActivityTime(lastHeartbeatAt?: string, isOnline?: boolean): string {
  if (isOnline) {
    return 'Đang hoạt động';
  }

  if (!lastHeartbeatAt) {
    return 'Chưa hoạt động';
  }

  const lastActivityTime = new Date(lastHeartbeatAt);
  const now = new Date();
  const diffMs = now.getTime() - lastActivityTime.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Vừa mới';
  }

  if (diffMins < 60) {
    return `${diffMins}p trước`;
  }

  if (diffHours < 24) {
    return `${diffHours}h trước`;
  }

  if (diffDays < 7) {
    return `${diffDays}d trước`;
  }

  return lastActivityTime.toLocaleDateString('vi-VN');
}
