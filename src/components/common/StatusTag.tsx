import React from 'react';
import { ReportStatus, FeedbackReviewStatus } from '../../types';

interface StatusTagProps {
  status: ReportStatus | FeedbackReviewStatus | 'normal' | 'attention';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, className = '', size = 'md' }) => {
  let label = '';
  let colorClasses = '';

  switch (status) {
    case 'approved':
    case 'normal':
      label = '승인 완료';
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'needsRevision':
    case 'attention':
      label = '보완 요청';
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-300';
      break;
    case 'delayed':
      label = '지연 / 미제출';
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
      break;
    case 'feedbackPending':
    case 'submitted':
      label = '피드백 대기';
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-300';
      break;
    case 'draft':
    default:
      label = '임시저장';
      colorClasses = 'bg-stone-100 text-stone-700 border-stone-300';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs md:text-sm px-2.5 py-1',
    lg: 'text-sm md:text-base px-3 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium tracking-tight whitespace-nowrap ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'approved' || status === 'normal'
            ? 'bg-emerald-600'
            : status === 'needsRevision' || status === 'attention'
            ? 'bg-amber-600'
            : status === 'delayed'
            ? 'bg-rose-600'
            : status === 'feedbackPending' || status === 'submitted'
            ? 'bg-sky-600'
            : 'bg-stone-500'
        }`}
      />
      {label}
    </span>
  );
};
