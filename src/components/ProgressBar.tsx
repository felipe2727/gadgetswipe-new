"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="px-8 py-2 z-20 w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium tracking-wide">
        <span>Daily Discovery</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-1 w-full bg-surface-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            boxShadow: "0 0 10px rgba(13,242,105,0.4)",
          }}
        />
      </div>
    </div>
  );
}
