import { TeamSwitcher } from '@components/layout/team-switcher';
import type { TeamSwitcherProps } from '@components/layout/team-switcher.types';
import { SidebarProvider } from '@components/ui/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Rocket, Shield, Zap } from 'lucide-react';

// Mock teams data
const mockTeams = [
  {
    name: 'Acme Corp',
    slug: 'acme-corp',
    logo: Building2,
    plan: 'Enterprise',
  },
  {
    name: 'Startup Inc',
    slug: 'startup-inc',
    logo: Rocket,
    plan: 'Pro',
  },
  {
    name: 'Tech Solutions',
    slug: 'tech-solutions',
    logo: Zap,
    plan: 'Business',
  },
  {
    name: 'Security First',
    slug: 'security-first',
    logo: Shield,
    plan: 'Enterprise',
  },
];

const mockSingleTeam = [
  {
    name: 'My Company',
    slug: 'my-company',
    logo: Building2,
    plan: 'Free',
  },
];

// Mock component with sidebar context
function MockTeamSwitcher({ teams, activeSlug }: TeamSwitcherProps) {
  return (
    <SidebarProvider>
      <div className="border rounded-lg p-4 bg-sidebar min-w-64">
        <TeamSwitcher
          teams={teams}
          activeSlug={activeSlug}
        />
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
      description: 'Array of team objects with name, slug, logo, and plan',
    },
    activeSlug: {
      description: 'Slug of the currently active team',
    },
  },
} satisfies Meta<typeof MockTeamSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teams: mockTeams,
    activeSlug: 'acme-corp',
  },
};

export const SingleTeam: Story = {
  args: {
    teams: mockSingleTeam,
    activeSlug: 'my-company',
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
        slug: 'global-enterprise',
        logo: Building2,
        plan: 'Enterprise Plus',
      },
      {
        name: 'Innovation Hub',
        slug: 'innovation-hub',
        logo: Zap,
        plan: 'Startup',
      },
      {
        name: 'DevOps Masters',
        slug: 'devops-masters',
        logo: Rocket,
        plan: 'Pro',
      },
    ],
    activeSlug: 'acme-corp',
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
    activeSlug: 'acme-corp',
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
