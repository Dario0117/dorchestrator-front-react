import { SignOutDialog } from '@components/sign-out-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { buttonVariants } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
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
                <p className="text-muted-foreground text-xs leading-none">
                  {profile?.email}
                </p>
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
