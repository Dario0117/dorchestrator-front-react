import { TeamSwitcher } from '@components/layout/team-switcher';
import { SidebarProvider } from '@components/ui/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Rocket, Shield, Zap } from 'lucide-react';

// Mock teams data
const mockTeams = [
  {
    name: 'Acme Corp',
    logo: Building2,
    plan: 'Enterprise',
  },
  {
    name: 'Startup Inc',
    logo: Rocket,
    plan: 'Pro',
  },
  {
    name: 'Tech Solutions',
    logo: Zap,
    plan: 'Business',
  },
  {
    name: 'Security First',
    logo: Shield,
    plan: 'Enterprise',
  },
];

const mockSingleTeam = [
  {
    name: 'My Company',
    logo: Building2,
    plan: 'Free',
  },
];

// Mock component with sidebar context
function MockTeamSwitcher({ teams }: { teams: typeof mockTeams }) {
  return (
    <SidebarProvider>
      <div className="border rounded-lg p-4 bg-sidebar min-w-64">
        <TeamSwitcher teams={teams} />
      </div>
    </SidebarProvider>
  );
}

const meta = {
  title: 'Layout/TeamSwitcher',
  component: MockTeamSwitcher,
  parameters: {
    docs: {
      description: {
        component:
          'Team switcher component that allows users to switch between different teams with a dropdown interface. Shows team logo, name, and plan information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    teams: {
      description: 'Array of team objects with name, logo, and plan',
    },
  },
} satisfies Meta<typeof MockTeamSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teams: mockTeams,
  },
};

export const SingleTeam: Story = {
  args: {
    teams: mockSingleTeam,
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with only one team available.',
      },
    },
  },
};

export const ManyTeams: Story = {
  args: {
    teams: [
      ...mockTeams,
      {
        name: 'Global Enterprise Solutions Ltd',
        logo: Building2,
        plan: 'Enterprise Plus',
      },
      {
        name: 'Innovation Hub',
        logo: Zap,
        plan: 'Startup',
      },
      {
        name: 'DevOps Masters',
        logo: Rocket,
        plan: 'Pro',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Team switcher with many teams showing how the dropdown handles multiple options and long names.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    teams: mockTeams,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Team switcher on mobile viewport with adapted dropdown positioning.',
      },
    },
  },
};
