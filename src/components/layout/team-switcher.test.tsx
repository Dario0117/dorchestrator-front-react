import { TeamSwitcher } from '@components/layout/team-switcher';
import { SidebarProvider } from '@components/ui/sidebar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react';

const mockTeams = [
  {
    name: 'Dorchestrator',
    logo: Command,
    plan: 'Vite + ShadcnUI',
  },
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveform,
    plan: 'Startup',
  },
];

function renderTeamSwitcher(teams = mockTeams) {
  return renderWithProviders(
    <SidebarProvider>
      <TeamSwitcher teams={teams} />
    </SidebarProvider>,
  );
}

describe('TeamSwitcher', () => {
  it('should render the first team as active by default', () => {
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

  it('should switch active team when a team is clicked', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const acmeInc = screen.getByRole('menuitem', { name: /acme inc/i });
    await user.click(acmeInc);

    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
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

  it('should update active team state correctly', async () => {
    const user = userEvent.setup();
    renderTeamSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const acmeCorp = screen.getByRole('menuitem', { name: /acme corp/i });
    await user.click(acmeCorp);

    expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
    expect(screen.getByText('Startup')).toBeInTheDocument();
  });
});
