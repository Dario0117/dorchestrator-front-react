interface ProgressBarProps {
  value: number;
  max?: number;
}

function ProgressBar({ value, max = 100 }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { ProgressBar };
