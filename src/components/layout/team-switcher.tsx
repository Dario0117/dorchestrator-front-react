import type { TeamSwitcherProps } from '@components/layout/team-switcher.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ui/sidebar';
import { useNavigate } from '@tanstack/react-router';
import { ChevronsUpDown, Plus } from 'lucide-react';

export function TeamSwitcher({
  teams,
  activeSlug,
  label = 'Teams',
  addButtonLabel = 'Add team',
  onAdd,
  teamsByOrgSlug,
  activeTeamSlug,
  onTeamChange,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const activeTeam = teams.find((team) => team.slug === activeSlug) ?? teams[0];
  const activeOrgTeams = teamsByOrgSlug?.[activeSlug] ?? [];
  const activeTeamName = activeOrgTeams.find(
    (t) => t.slug === activeTeamSlug,
  )?.name;

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-semibold">{activeTeam.name}</span>
              {activeTeamName && (
                <span className="truncate text-xs text-muted-foreground">
                  {activeTeamName}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ms-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {label}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {teams.map((team) => {
              const isActive = team.slug === activeSlug;
              const orgTeams = teamsByOrgSlug?.[team.slug] ?? [];
              return (
                <div key={team.slug}>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to: '/$organizationSlug',
                        params: { organizationSlug: team.slug },
                      })
                    }
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <team.logo className="size-4 shrink-0" />
                    </div>
                    {team.name}
                  </DropdownMenuItem>
                  {orgTeams.length > 0 && (
                    <DropdownMenuRadioGroup
                      value={isActive ? (activeTeamSlug ?? '') : ''}
                      onValueChange={(teamSlug) => {
                        if (isActive) {
                          onTeamChange?.(teamSlug);
                        } else {
                          navigate({
                            to: '/$organizationSlug/t/$teamSlug',
                            params: {
                              organizationSlug: team.slug,
                              teamSlug,
                            },
                          });
                        }
                      }}
                    >
                      {orgTeams.map((teamOption) => (
                        <DropdownMenuRadioItem
                          className="pl-10"
                          key={teamOption.id}
                          value={teamOption.slug}
                        >
                          {teamOption.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  )}
                </div>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onAdd}
            >
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                {addButtonLabel}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
