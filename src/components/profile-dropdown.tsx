import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@components/ds/atoms/avatar';
import { buttonVariants } from '@components/ds/atoms/button';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ds/molecules/dropdown-menu';
import { SignOutDialog } from '@components/sign-out-dialog';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import useDialogState from '@hooks/use-dialog-state';
import { cn } from '@lib/utils';
import { useProfileSuspendedQuery } from '@services/users/get-profile.http-service';
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
            'relative h-8 w-8 rounded-full',
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="/avatars/01.png"
              alt="@shadcn"
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="end"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm leading-none font-medium">
                  {profile?.name}
                </p>
                <SmallParagraph className="leading-none">
                  {profile?.email}
                </SmallParagraph>
              </div>
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
