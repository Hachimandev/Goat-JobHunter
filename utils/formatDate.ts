import dayjs from 'dayjs';
import { differenceInHours, format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getDaysSinceCreation(createdAt?: string) {
  if (!createdAt) return 0;

  return dayjs().startOf('day').diff(dayjs(createdAt).startOf('day'), 'day');
}

function getTimeLabel(createdAt?: string): string {
  if (!createdAt) return '';

  const days = getDaysSinceCreation(createdAt);

  if (days === 0) return 'Hôm nay';
  return `${days} ngày trước`;
}

function formatLastMessageTime(timestamp: string | null): string {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = differenceInHours(now, date);

  // Nếu trong vòng 24h → hiển thị giờ:phút
  if (diffInHours < 24) {
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: vi });
    }
    if (isYesterday(date)) {
      return 'Hôm qua';
    }
  }

  // Nếu xa hơn → hiển thị dd/MM
  return format(date, 'dd/MM', { locale: vi });
}

function formatActivityTime(lastHeartbeatAt?: string): string {
  if (!lastHeartbeatAt) return '';

  const now = Date.now();
  const time = new Date(lastHeartbeatAt).getTime();
  const diff = Math.floor((now - time) / 1000); // seconds

  if (diff > 0 && diff < 60) return 'Vừa truy cập';

  const minutes = Math.floor(diff / 60);
  if (minutes > 0 && minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours > 0 && hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days > 0 && days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks > 0 && weeks < 4) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  if (months > 0 && months < 12) return `${months} tháng trước`;

  const years = Math.floor(days / 365);
  return years > 0 ? `${years} năm trước` : '';
}

function formatReminderTime(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return `Hôm nay lúc ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Hôm qua lúc ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Ngày mai lúc ${format(date, 'HH:mm')}`;
  return format(date, "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
}

function getDateBlock(dateString: string) {
  const date = new Date(dateString);
  const weekday = format(date, 'EEEE', { locale: vi });

  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: format(date, 'dd'),
    month: format(date, 'M'),
  };
}

export {
  formatDate,
  formatDateTime,
  getDaysSinceCreation,
  getTimeLabel,
  formatLastMessageTime,
  formatActivityTime,
  formatReminderTime,
  getDateBlock,
};
