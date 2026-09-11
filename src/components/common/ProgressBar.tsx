import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  // Color dynamic based on progress
  let barColor = 'bg-[#D65A2F]'; // Studio burnt orange
  if (clamped >= 80) barColor = 'bg-emerald-600';
  else if (clamped < 40) barColor = 'bg-amber-600';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs md:text-sm font-medium text-stone-700">
          <span>진행률</span>
          <span className="font-bold text-[#202020]">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E5E0D8] rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
