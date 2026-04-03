interface ActivityBadgeProps {
  count: number;
}

function ActivityBadge({ count }: ActivityBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <output
      className="bg-info/10 text-info text-xs font-medium rounded-full px-2 py-0.5"
      aria-label={`${count} active task${count === 1 ? '' : 's'}`}
    >
      {count} active
    </output>
  );
}

export { ActivityBadge };
