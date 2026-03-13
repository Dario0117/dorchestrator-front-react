import { checkIsActive } from '@components/layout/check-is-active';
import type { NavItem } from '@components/layout/nav-group.types';

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
});
