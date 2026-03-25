import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@components/ds/atoms/avatar';
import { buttonVariants } from '@components/ds/atoms/button';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ds/molecules/dropdown-menu';
import { useProfileSuspendedQuery } from '@domains/org/services/users/get-profile.http-service';
import { SignOutDialog } from '@domains/shared/components/sign-out-dialog';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import useDialogState from '@domains/shared/hooks/use-dialog-state';
import { cn } from '@lib/utils';
import { Link } from '@tanstack/react-router';

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState();
  const { data: profile } = useProfileSuspendedQuery();
  const currentOrganization = useCurrentOrganization();

  const avatarFallback = profile.name.charAt(0);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'relative h-8 w-8 cursor-pointer rounded-full',
          )}
        >
          <Avatar size="sm">
            <AvatarImage
              src="/avatars/01.png"
              alt="@shadcn"
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          width="sm"
          align="end"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel layout="normal">
              <Stack gap="xs">
                <SecondaryParagraph
                  weight="medium"
                  leading="none"
                >
                  {profile?.name}
                </SecondaryParagraph>
                <SmallParagraph leading="none">{profile?.email}</SmallParagraph>
              </Stack>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link
                  to="/$organizationSlug/profile"
                  params={{ organizationSlug: currentOrganization.slug }}
                />
              }
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="." />}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="." />}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog
        open={!!open}
        onOpenChange={setOpen}
      />
    </>
  );
}
