import { BlurOverlay } from '@components/ds/atoms/blur-overlay';
import { HStack } from '@components/ds/atoms/hstack';
import { PageHeader } from '@components/ds/atoms/page-header';
import { SidebarTrigger } from '@components/ds/organisms/sidebar';
import type { HeaderProps } from '@domains/shared/components/header.types';
import { useEffect, useState } from 'react';

export function Header({ fixed, children }: HeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <PageHeader
      position={fixed ? 'sticky' : undefined}
      shadow={offset > 10 && fixed ? 'sm' : 'none'}
    >
      <HStack
        gap="md"
        fullHeight
        innerSpaceX="md"
        innerSpaceY="md"
      >
        {offset > 10 && fixed && <BlurOverlay />}
        <SidebarTrigger
          variant="outline"
          className="max-md:scale-125"
        />
        {children}
      </HStack>
    </PageHeader>
  );
}
