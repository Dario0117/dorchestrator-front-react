import { cn } from '@lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn('size-4', className)}
      aria-label="Dorchestrator logo"
    >
      <title>Dorchestrator</title>
      <rect
        width="32"
        height="32"
        rx="6"
        fill="currentColor"
      />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="700"
        fontSize="20"
        fill="white"
      >
        D
      </text>
    </svg>
  );
}
