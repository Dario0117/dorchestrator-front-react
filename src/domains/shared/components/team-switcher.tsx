import { Box } from '@components/ds/atoms/box';
import { Center } from '@components/ds/atoms/center';
import { SmallText } from '@components/ds/atoms/small-text';
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
} from '@components/ds/molecules/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ds/organisms/sidebar';
import { SidebarItemDetail } from '@domains/shared/components/sidebar-item-detail';
import type { TeamSwitcherProps } from '@domains/shared/components/team-switcher.types';
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
            <Center
              size="sm"
              rounded="md"
              bg="primary"
            >
              <activeTeam.logo className="size-4" />
            </Center>
            <SidebarItemDetail>
              <SmallText
                size="sm"
                weight="semibold"
                truncate
              >
                {activeTeam.name}
              </SmallText>
              {activeTeamName && (
                <SmallText truncate>{activeTeamName}</SmallText>
              )}
            </SidebarItemDetail>
            <ChevronsUpDown className="ms-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            width="anchor"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel layout="muted-xs">{label}</DropdownMenuLabel>
            </DropdownMenuGroup>
            {teams.map((team) => {
              const isActive = team.slug === activeSlug;
              const orgTeams = teamsByOrgSlug?.[team.slug] ?? [];
              return (
                <Box key={team.slug}>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to: '/$organizationSlug',
                        params: { organizationSlug: team.slug },
                      })
                    }
                    layout="spaced"
                  >
                    <Center
                      size="sm"
                      rounded="sm"
                      border="all"
                    >
                      <team.logo className="size-4 shrink-0" />
                    </Center>
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
                          indented
                          key={teamOption.id}
                          value={teamOption.slug}
                        >
                          {teamOption.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  )}
                </Box>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              layout="spaced"
              onClick={onAdd}
            >
              <Center
                size="sm"
                rounded="md"
                border="all"
                bg="background"
              >
                <Plus className="size-4" />
              </Center>
              <SmallText weight="medium">{addButtonLabel}</SmallText>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
