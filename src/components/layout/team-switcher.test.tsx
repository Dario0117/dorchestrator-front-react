import { TeamSwitcher } from '@components/layout/team-switcher';
import { SidebarProvider } from '@components/ui/sidebar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
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

function renderTeamSwitcher(teams = mockTeams, activeSlug = 'dorchestrator') {
  return renderWithProviders(
    <SidebarProvider>
      <TeamSwitcher
        teams={teams}
        activeSlug={activeSlug}
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
    expect(screen.getByText('Vite + ShadcnUI')).toBeInTheDocument();
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
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('should display all teams in dropdown menu', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getAllByText('Dorchestrator')).toHaveLength(2);
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
  });

  it('should navigate to the selected team when clicked', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const acmeInc = screen.getByRole('menuitem', { name: /acme inc/i });
    await user.click(acmeInc);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug',
      params: { organizationSlug: 'acme-inc' },
    });
  });

  it('should display keyboard shortcuts for teams', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getByText('⌘1')).toBeInTheDocument();
    expect(screen.getByText('⌘2')).toBeInTheDocument();
    expect(screen.getByText('⌘3')).toBeInTheDocument();
  });

  it('should display "Add team" option', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getByText('Add team')).toBeInTheDocument();
  });

  it('should render team logos in dropdown menu', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const menuItems = screen.getAllByRole('menuitem');
    const teamItems = menuItems.filter((item) =>
      item.textContent?.includes('⌘'),
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
    await user.click(trigger);

    const acmeCorp = screen.getByRole('menuitem', { name: /acme corp/i });
    await user.click(acmeCorp);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug',
      params: { organizationSlug: 'acme-corp' },
    });
  });

  it('should render dropdown from bottom on mobile viewport', async () => {
    setMobileViewport();
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const menuContent = screen.getByRole('menu');
    expect(menuContent).toHaveAttribute('data-side', 'bottom');

    setDesktopViewport();
  });

  it('should show correct active team when activeSlug changes', () => {
    renderTeamSwitcher(mockTeams, 'acme-inc');

    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });
});
