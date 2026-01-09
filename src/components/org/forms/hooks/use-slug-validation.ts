import { useCheckSlugAvailabilityMutation } from '@services/organizations/check-slug-availability.http-service';
import { useState } from 'react';

export const SlugStatus = {
  UNCHECKED: 'unchecked',
  CHECKING: 'checking',
  AVAILABLE: 'available',
  TAKEN: 'taken',
} as const;

export type SlugStatusType = (typeof SlugStatus)[keyof typeof SlugStatus];

export function useSlugValidation() {
  const checkSlugMutation = useCheckSlugAvailabilityMutation();

  const [currentSlug, setCurrentSlug] = useState('');
  const [status, setStatus] = useState<SlugStatusType>(SlugStatus.UNCHECKED);

  const resetValidation = (newSlug: string) => {
    setCurrentSlug(newSlug);
    setStatus(SlugStatus.UNCHECKED);
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) {
      return;
    }

    setStatus(SlugStatus.CHECKING);

    const result = await checkSlugMutation.mutateAsync(slug);

    if (result.available) {
      setStatus(SlugStatus.AVAILABLE);
    } else if (result.taken) {
      setStatus(SlugStatus.TAKEN);
    } else {
      setStatus(SlugStatus.UNCHECKED);
    }
  };

  const isSlugValid = status === SlugStatus.AVAILABLE;
  const isChecking = status === SlugStatus.CHECKING;

  return {
    currentSlug,
    status,
    isSlugValid,
    isChecking,
    resetValidation,
    checkSlugAvailability,
  };
}
