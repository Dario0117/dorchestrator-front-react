import { TeamSwitcher } from '@components/layout/team-switcher';
import { SidebarProvider } from '@components/ui/sidebar';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import {
  setDesktopViewport,
  setMobileViewport,
} from '@lib/viewport-test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockTeams = [
  {
    name: 'Dorchestrator',
    slug: 'dorchestrator',
    logo: Command,
    plan: 'Vite + ShadcnUI',
  },
  {
    name: 'Acme Inc',
    slug: 'acme-inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    slug: 'acme-corp',
    logo: AudioWaveform,
    plan: 'Startup',
  },
];

const mockTeamsByOrgSlug = {
  dorchestrator: [
    {
      id: 'team-1',
      name: 'Engineering',
      slug: 'engineering',
      organizationId: 'org-1',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'team-2',
      name: 'Design',
      slug: 'design',
      organizationId: 'org-1',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  'acme-inc': [
    {
      id: 'team-3',
      name: 'Sales',
      slug: 'sales',
      organizationId: 'org-2',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
};

function renderTeamSwitcher(
  teams = mockTeams,
  activeSlug = 'dorchestrator',
  props: Partial<
    Pick<
      Parameters<typeof TeamSwitcher>[0],
      'teamsByOrgSlug' | 'activeTeamSlug' | 'onTeamChange'
    >
  > = {},
) {
  return renderWithProviders(
    <SidebarProvider>
      <TeamSwitcher
        teams={teams}
        activeSlug={activeSlug}
        {...props}
      />
    </SidebarProvider>,
  );
}

describe('TeamSwitcher', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render the active team based on activeSlug', () => {
    renderTeamSwitcher();

    expect(screen.getByText('Dorchestrator')).toBeInTheDocument();
  });

  it('should return null when no teams are provided', () => {
    renderTeamSwitcher([]);

    expect(screen.queryByText('Dorchestrator')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should display team logo', () => {
    renderTeamSwitcher();

    const button = screen.getByRole('button', { name: /dorchestrator/i });
    const logo = button.querySelector('svg.lucide-command');
    expect(logo).toBeInTheDocument();
  });

  it('should open dropdown menu when trigger is clicked', async () => {
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('should display all teams in dropdown menu', async () => {
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    expect(screen.getAllByText('Dorchestrator')).toHaveLength(2);
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
  });

  it('should navigate to the selected team when clicked', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const acmeInc = screen.getByRole('menuitem', { name: /acme inc/i });
    await user.click(acmeInc);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug',
      params: { organizationSlug: 'acme-inc' },
    });
  });

  it('should display "Add team" option', async () => {
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    expect(screen.getByText('Add team')).toBeInTheDocument();
  });

  it('should render team logos in dropdown menu', async () => {
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const menuItems = screen.getAllByRole('menuitem');
    const teamItems = menuItems.filter(
      (item) => !item.textContent?.includes('Add team'),
    );

    teamItems.forEach((item) => {
      const logo = item.querySelector('svg');
      expect(logo).toBeInTheDocument();
    });
  });

  it('should navigate to the correct team on click', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const acmeCorp = screen.getByRole('menuitem', { name: /acme corp/i });
    await user.click(acmeCorp);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug',
      params: { organizationSlug: 'acme-corp' },
    });
  });

  it('should render dropdown from bottom on mobile viewport', async () => {
    setMobileViewport();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const menuContent = screen.getByRole('menu');
    expect(menuContent).toHaveAttribute('data-side', 'bottom');

    setDesktopViewport();
  });

  it('should show correct active team when activeSlug changes', () => {
    renderTeamSwitcher(mockTeams, 'acme-inc');

    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
  });

  it('should display active team name when activeTeamSlug is provided', () => {
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: 'engineering',
    });

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('should render team radio options in dropdown', async () => {
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: 'engineering',
    });

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    expect(
      screen.getByRole('menuitemradio', { name: /engineering/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: /design/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: /sales/i }),
    ).toBeInTheDocument();
  });

  it('should call onTeamChange when a team radio option is selected', async () => {
    const onTeamChange = vi.fn();
    const user = userEvent.setup();
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: 'engineering',

      onTeamChange,
    });

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const designOption = screen.getByRole('menuitemradio', { name: /design/i });
    await user.click(designOption);

    expect(onTeamChange).toHaveBeenCalledWith('design');
  });

  it('should call onTeamChange without navigating when selecting a team within the active org', async () => {
    const onTeamChange = vi.fn();
    const user = userEvent.setup();
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: 'engineering',

      onTeamChange,
    });

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const designOption = screen.getByRole('menuitemradio', { name: /design/i });
    await user.click(designOption);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(onTeamChange).toHaveBeenCalledWith('design');
  });

  it('should navigate to org+team when selecting a team under a non-active org', async () => {
    const onTeamChange = vi.fn();
    const user = userEvent.setup();
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: 'engineering',
      onTeamChange,
    });

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const salesOption = screen.getByRole('menuitemradio', { name: /sales/i });
    await user.click(salesOption);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug/t/$teamSlug',
      params: {
        organizationSlug: 'acme-inc',
        teamSlug: 'sales',
      },
    });
    expect(onTeamChange).not.toHaveBeenCalled();
  });

  it('should render team options with no radio selected when activeTeamId is null', async () => {
    renderTeamSwitcher(mockTeams, 'dorchestrator', {
      teamsByOrgSlug: mockTeamsByOrgSlug,
      activeTeamSlug: undefined,
    });

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await clickTrigger(trigger);

    const engineeringOption = screen.getByRole('menuitemradio', {
      name: /engineering/i,
    });
    expect(engineeringOption).not.toBeChecked();
  });
});
