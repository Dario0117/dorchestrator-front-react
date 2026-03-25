import { HStack } from '@components/ds/atoms/hstack';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@components/ds/molecules/sheet';
import { Link } from '@tanstack/react-router';
import { ScrollText, Settings, User } from 'lucide-react';

interface MoreSheetItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

function getMoreItems(basePath: string): MoreSheetItem[] {
  const orgBase = basePath.split('/t/')[0] || basePath;
  return [
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: ScrollText,
      path: `${orgBase}/audit-logs`,
    },
    {
      id: 'settings',
      label: 'Organization Settings',
      icon: Settings,
      path: `${orgBase}/settings`,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: `${orgBase}/profile`,
    },
  ];
}

interface BottomNavMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePath: string;
}

export function BottomNavMoreSheet({
  open,
  onOpenChange,
  basePath,
}: BottomNavMoreSheetProps) {
  const items = getMoreItems(basePath);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
        </SheetHeader>
        <Stack gap="xs">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onOpenChange(false)}
            >
              <HStack
                gap="sm"
                align="center"
              >
                <item.icon className="size-5 text-muted-foreground" />
                <SmallText>{item.label}</SmallText>
              </HStack>
            </Link>
          ))}
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
