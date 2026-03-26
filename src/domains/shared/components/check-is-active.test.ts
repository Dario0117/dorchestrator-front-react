import { checkIsActive } from '@domains/shared/components/check-is-active';
import type { NavItem } from '@domains/shared/components/nav-group.types';

describe('checkIsActive', () => {
  it('should return true when href matches item url exactly', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard' };
    expect(checkIsActive('/dashboard', item)).toBe(true);
  });

  it('should return false when href does not match item url', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard' };
    expect(checkIsActive('/settings', item)).toBe(false);
  });

  it('should normalize trailing slashes when comparing', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard/' };
    expect(checkIsActive('/dashboard', item)).toBe(true);
  });

  it('should normalize trailing slashes on href', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard' };
    expect(checkIsActive('/dashboard/', item)).toBe(true);
  });

  it('should strip query parameters before comparing', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard' };
    expect(checkIsActive('/dashboard?tab=overview', item)).toBe(true);
  });

  it('should strip query parameters from item url', () => {
    const item: NavItem = { title: 'Home', url: '/dashboard?tab=overview' };
    expect(checkIsActive('/dashboard', item)).toBe(true);
  });

  it('should not treat root slash as trailing slash to remove', () => {
    const item: NavItem = { title: 'Home', url: '/' };
    expect(checkIsActive('/', item)).toBe(true);
  });

  it('should return true when href matches a sub-item url', () => {
    const item: NavItem = {
      title: 'Settings',
      items: [
        { title: 'General', url: '/settings/general' },
        { title: 'Security', url: '/settings/security' },
      ],
    };
    expect(checkIsActive('/settings/general', item)).toBe(true);
  });

  it('should return false when href does not match any sub-item url', () => {
    const item: NavItem = {
      title: 'Settings',
      items: [
        { title: 'General', url: '/settings/general' },
        { title: 'Security', url: '/settings/security' },
      ],
    };
    expect(checkIsActive('/settings/profile', item)).toBe(false);
  });

  it('should match by first path segment when mainNav is true', () => {
    const item: NavItem = { title: 'Settings', url: '/settings/general' };
    expect(checkIsActive('/settings/security', item, true)).toBe(true);
  });

  it('should not match by first path segment when mainNav is false', () => {
    const item: NavItem = { title: 'Settings', url: '/settings/general' };
    expect(checkIsActive('/settings/security', item, false)).toBe(false);
  });

  it('should not match root paths via mainNav when first segment is empty', () => {
    const item: NavItem = { title: 'Home', url: '/' };
    expect(checkIsActive('/', item, true)).toBe(true);
  });

  it('should handle item with empty url', () => {
    const item: NavItem = {
      title: 'Group',
      items: [{ title: 'Child', url: '/child' }],
    };
    expect(checkIsActive('/child', item)).toBe(true);
  });

  it('should handle sub-items with trailing slashes', () => {
    const item: NavItem = {
      title: 'Settings',
      items: [{ title: 'General', url: '/settings/general/' }],
    };
    expect(checkIsActive('/settings/general', item)).toBe(true);
  });

  it('should return true when href is a child route of item url', () => {
    const item: NavItem = { title: 'Commands', url: '/org/t/team/commands' };
    expect(checkIsActive('/org/t/team/commands/123', item)).toBe(true);
  });

  it('should not prefix-match for root url', () => {
    const item: NavItem = { title: 'Home', url: '/' };
    expect(checkIsActive('/settings', item)).toBe(false);
  });

  it('should not prefix-match for collapsible items without sub-items match', () => {
    const item: NavItem = {
      title: 'Terminal',
      items: [
        { title: 'Sessions', url: '/terminal' },
        { title: 'Bookmarks', url: '/terminal/bookmarks' },
      ],
    };
    expect(checkIsActive('/other/page', item)).toBe(false);
  });

  it('should prefix-match sub-items in collapsible groups', () => {
    const item: NavItem = {
      title: 'Terminal',
      items: [
        { title: 'Sessions', url: '/org/t/team/terminal' },
        { title: 'Bookmarks', url: '/org/t/team/terminal/bookmarks' },
      ],
    };
    expect(checkIsActive('/org/t/team/terminal/session-123', item)).toBe(true);
  });
});
