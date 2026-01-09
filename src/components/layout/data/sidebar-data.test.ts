import { getSidebarData } from '@components/layout/data/sidebar-data';
import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import type { NavGroup, NavItem } from '@components/layout/nav-group.types';

describe('Sidebar Data', () => {
  const testSlug = 'test-org';
  const testOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: testSlug,
    createdAt: new Date(),
  };
  let sidebarData: SidebarData;

  beforeEach(() => {
    sidebarData = getSidebarData(testOrganization);
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
      expect(team).toHaveProperty('logo');
      expect(team).toHaveProperty('plan');

      expect(typeof team.name).toBe('string');
      expect(team.logo).toBeDefined();
      expect(typeof team.plan).toBe('string');
    });
  });

  it('should have expected teams', () => {
    const { teams } = sidebarData;

    expect(teams).toHaveLength(1);
    expect(teams[0]?.name).toBe('Dorchestrator');
    expect(teams[0]?.plan).toBe('Free Tier');
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

    expect(generalGroup.items).toHaveLength(3);

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
  });

  it('should have valid nav items in Settings group', () => {
    const settingsGroup = sidebarData.navGroups[1];
    if (!settingsGroup) {
      return;
    }

    expect(settingsGroup.items).toHaveLength(1);

    // Test Organization Settings item
    const orgSettingsItem = settingsGroup.items[0];
    if (!orgSettingsItem) {
      return;
    }
    expect(orgSettingsItem.title).toBe('Organization Settings');
    expect('url' in orgSettingsItem && orgSettingsItem.url).toBe(
      `/${testSlug}/settings`,
    );
    expect(orgSettingsItem.icon).toBeDefined();
  });

  it('should handle missing organization slug', () => {
    const sidebarDataWithoutSlug = getSidebarData(undefined);
    const generalGroup = sidebarDataWithoutSlug.navGroups[0];
    const dashboardItem = generalGroup?.items[0];

    expect(dashboardItem && 'url' in dashboardItem && dashboardItem.url).toBe(
      '/',
    );
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
});
