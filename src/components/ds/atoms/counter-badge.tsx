interface CounterBadgeProps {
  count: number;
}

function CounterBadge({ count }: CounterBadgeProps) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export { CounterBadge };
export type { CounterBadgeProps };
