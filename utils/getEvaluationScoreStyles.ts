export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
};

export const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Xuất sắc';
  if (score >= 60) return 'Khá tốt';
  if (score >= 40) return 'Trung bình';
  return 'Cần cải thiện';
};
