import { Button } from '@components/ds/atoms/button';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  variant?: 'default' | 'filtered';
  ctaLabel?: string;
  ctaAction?: () => void;
  ctaIcon?: LucideIcon;
  action?: ReactNode;
}

const FILTERED_DEFAULTS = {
  icon: Search,
  title: 'No results match your filters',
  description: 'Try adjusting your search criteria.',
  ctaLabel: 'Clear Filters',
};

function EmptyState({
  icon: IconProp,
  title: titleProp,
  description: descriptionProp,
  variant = 'default',
  ctaLabel: ctaLabelProp,
  ctaAction,
  ctaIcon: CtaIcon,
  action,
}: EmptyStateProps) {
  const isFiltered = variant === 'filtered';
  const Icon = IconProp ?? (isFiltered ? FILTERED_DEFAULTS.icon : undefined);
  const title = titleProp ?? (isFiltered ? FILTERED_DEFAULTS.title : '');
  const description =
    descriptionProp ?? (isFiltered ? FILTERED_DEFAULTS.description : '');
  const ctaLabel =
    ctaLabelProp ?? (isFiltered ? FILTERED_DEFAULTS.ctaLabel : undefined);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
      {Icon && <Icon className="h-10 w-10 opacity-30" />}
      <div className="space-y-1">
        <p className="text-base font-semibold">{title}</p>
        <SecondaryParagraph size="xs">{description}</SecondaryParagraph>
      </div>
      {action}
      {!action && ctaLabel && ctaAction && (
        <Button
          size="lg"
          variant={isFiltered ? 'outline' : 'default'}
          onClick={ctaAction}
        >
          {CtaIcon && <CtaIcon className="mr-2 h-4 w-4" />}
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
