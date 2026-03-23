import { getSidebarData } from '@domains/shared/components/data/sidebar-data';
import type { SidebarData } from '@domains/shared/components/data/sidebar-data.types';
import type {
  NavCollapsible,
  NavGroup,
  NavItem,
} from '@domains/shared/components/nav-group.types';

describe('Sidebar Data', () => {
  const testSlug = 'test-org';
  const testOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: testSlug,
    role: 'owner',
    memberCount: 1,
    createdAt: '2025-12-21T10:00:00.000Z',
    isDefault: true,
    teams: [],
  };
  const secondOrganization = {
    id: 'org-456',
    name: 'Second Organization',
    slug: 'second-org',
    role: 'member',
    memberCount: 3,
    createdAt: '2025-12-22T10:00:00.000Z',
    isDefault: false,
    teams: [],
  };
  const allOrganizations = [testOrganization, secondOrganization];
  let sidebarData: SidebarData;

  beforeEach(() => {
    sidebarData = getSidebarData(testOrganization, allOrganizations);
  });

  it('should have valid structure', () => {
    expect(sidebarData).toBeDefined();
    expect(sidebarData).toHaveProperty('teams');
    expect(sidebarData).toHaveProperty('navGroups');
  });

  it('should have valid teams data', () => {
    const { teams } = sidebarData;

    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);

    teams.forEach((team) => {
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('slug');
      expect(team).toHaveProperty('logo');
      expect(team).toHaveProperty('plan');

      expect(typeof team.name).toBe('string');
      expect(typeof team.slug).toBe('string');
      expect(team.logo).toBeDefined();
      expect(typeof team.plan).toBe('string');
    });
  });

  it('should have expected teams', () => {
    const { teams } = sidebarData;

    expect(teams).toHaveLength(2);
    expect(teams[0]?.name).toBe('Test Organization');
    expect(teams[0]?.slug).toBe('test-org');
    expect(teams[0]?.plan).toBe('Free Tier');
    expect(teams[1]?.name).toBe('Second Organization');
    expect(teams[1]?.slug).toBe('second-org');
    expect(teams[1]?.plan).toBe('Free Tier');
  });

  it('should have valid nav groups structure', () => {
    const { navGroups } = sidebarData;

    expect(Array.isArray(navGroups)).toBe(true);
    expect(navGroups.length).toBeGreaterThan(0);

    navGroups.forEach((group: NavGroup) => {
      expect(group).toHaveProperty('title');
      expect(group).toHaveProperty('items');
      expect(typeof group.title).toBe('string');
      expect(Array.isArray(group.items)).toBe(true);
    });
  });

  it('should have expected nav groups', () => {
    const { navGroups } = sidebarData;

    expect(navGroups).toHaveLength(2);
    expect(navGroups[0]?.title).toBe('General');
    expect(navGroups[1]?.title).toBe('Settings');
  });

  it('should have valid nav items in General group', () => {
    const generalGroup = sidebarData.navGroups[0];
    if (!generalGroup) {
      return;
    }

    expect(generalGroup.items).toHaveLength(4);

    // Test Dashboard item
    const dashboardItem = generalGroup.items[0];
    if (!dashboardItem) {
      return;
    }
    expect(dashboardItem.title).toBe('Dashboard');
    expect('url' in dashboardItem && dashboardItem.url).toBe(`/${testSlug}/`);
    expect(dashboardItem.icon).toBeDefined();

    // Test Devices item
    const devicesItem = generalGroup.items[1];
    if (!devicesItem) {
      return;
    }
    expect(devicesItem.title).toBe('Devices');
    expect('url' in devicesItem && devicesItem.url).toBe(
      `/${testSlug}/devices`,
    );
    expect(devicesItem.icon).toBeDefined();

    // Test Commands item
    const commandsItem = generalGroup.items[2];
    if (!commandsItem) {
      return;
    }
    expect(commandsItem.title).toBe('Commands');
    expect('url' in commandsItem && commandsItem.url).toBe(
      `/${testSlug}/commands`,
    );
    expect(commandsItem.icon).toBeDefined();

    // Test Terminal collapsible group
    const terminalGroup = generalGroup.items[3];
    if (!terminalGroup) {
      return;
    }
    expect(terminalGroup.title).toBe('Terminal');
    expect(terminalGroup.icon).toBeDefined();
    expect('items' in terminalGroup).toBe(true);

    const terminalItems = (terminalGroup as NavCollapsible).items;
    expect(terminalItems).toHaveLength(2);

    expect(terminalItems[0]?.title).toBe('Sessions');
    expect(terminalItems[0]?.url).toBe(`/${testSlug}/terminal`);
    expect(terminalItems[0]?.icon).toBeDefined();

    expect(terminalItems[1]?.title).toBe('Bookmarks');
    expect(terminalItems[1]?.url).toBe(`/${testSlug}/terminal/bookmarks`);
  });

  it('should have valid nav items in Settings group', () => {
    const settingsGroup = sidebarData.navGroups[1];
    if (!settingsGroup) {
      return;
    }

    expect(settingsGroup.items).toHaveLength(2);

    // Test Audit Logs item
    const auditLogsItem = settingsGroup.items[0];
    if (!auditLogsItem) {
      return;
    }
    expect(auditLogsItem.title).toBe('Audit Logs');
    expect('url' in auditLogsItem && auditLogsItem.url).toBe(
      `/${testSlug}/audit-logs`,
    );
    expect(auditLogsItem.icon).toBeDefined();

    // Test Organization Settings item
    const orgSettingsItem = settingsGroup.items[1];
    if (!orgSettingsItem) {
      return;
    }
    expect(orgSettingsItem.title).toBe('Organization Settings');
    expect('url' in orgSettingsItem && orgSettingsItem.url).toBe(
      `/${testSlug}/settings`,
    );
    expect(orgSettingsItem.icon).toBeDefined();
  });

  it('should have all required nav item properties', () => {
    const validateNavItem = (item: NavItem) => {
      expect(item).toHaveProperty('title');
      expect(typeof item.title).toBe('string');

      if ('url' in item) {
        // This is a NavLink
        expect(typeof item.url).toBe('string');
        expect(item.url?.length || 0).toBeGreaterThan(0);
      } else if ('items' in item) {
        // This is a NavCollapsible
        expect(Array.isArray(item.items)).toBe(true);
        expect(item.items.length).toBeGreaterThan(0);
        item.items.forEach((subItem) => {
          expect(subItem).toHaveProperty('title');
          expect(subItem).toHaveProperty('url');
          expect(typeof subItem.title).toBe('string');
          expect(typeof subItem.url).toBe('string');
        });
      }

      if (item.icon) {
        expect(item.icon).toBeDefined();
      }

      if (item.badge) {
        expect(typeof item.badge).toBe('string');
      }
    };

    sidebarData.navGroups.forEach((group) => {
      group.items.forEach(validateNavItem);
    });
  });

  it('should conform to SidebarData type', () => {
    // This test ensures the data structure matches the TypeScript type
    const typedData: SidebarData = sidebarData;
    expect(typedData).toBeDefined();
    expect(typedData.teams).toBeDefined();
    expect(typedData.navGroups).toBeDefined();
  });

  it('should use team-scoped URLs when teamSlug is provided', () => {
    const teamData = getSidebarData(
      testOrganization,
      allOrganizations,
      'my-team',
    );
    const generalGroup = teamData.navGroups[0];
    const settingsGroup = teamData.navGroups[1];

    const dashboardItem = generalGroup?.items[0];
    expect(dashboardItem && 'url' in dashboardItem && dashboardItem.url).toBe(
      `/${testSlug}/t/my-team/`,
    );

    const devicesItem = generalGroup?.items[1];
    expect(devicesItem && 'url' in devicesItem && devicesItem.url).toBe(
      `/${testSlug}/t/my-team/devices`,
    );

    const commandsItem = generalGroup?.items[2];
    expect(commandsItem && 'url' in commandsItem && commandsItem.url).toBe(
      `/${testSlug}/t/my-team/commands`,
    );

    const terminalGroup = generalGroup?.items[3] as NavCollapsible;
    expect(terminalGroup.items[0]?.url).toBe(`/${testSlug}/t/my-team/terminal`);
    expect(terminalGroup.items[1]?.url).toBe(
      `/${testSlug}/t/my-team/terminal/bookmarks`,
    );

    const auditLogsItem = settingsGroup?.items[0];
    expect(auditLogsItem && 'url' in auditLogsItem && auditLogsItem.url).toBe(
      `/${testSlug}/audit-logs`,
    );

    const orgSettingsItem = settingsGroup?.items[1];
    expect(
      orgSettingsItem && 'url' in orgSettingsItem && orgSettingsItem.url,
    ).toBe(`/${testSlug}/settings`);
  });
});
