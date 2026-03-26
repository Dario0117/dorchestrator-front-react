import { useNavigationStore } from '@domains/shared/stores/navigation.store';

describe('useNavigationStore', () => {
  beforeEach(() => {
    useNavigationStore.setState({ activeOrgSlug: null, teamByOrg: {} });
  });

  it('should start with null activeOrgSlug and empty teamByOrg map', () => {
    expect(useNavigationStore.getState().activeOrgSlug).toBeNull();
    expect(useNavigationStore.getState().teamByOrg).toEqual({});
  });

  it('should store the active org slug', () => {
    useNavigationStore.getState().setActiveOrg('acme-corp');

    expect(useNavigationStore.getState().activeOrgSlug).toBe('acme-corp');
  });

  it('should update the active org slug', () => {
    useNavigationStore.getState().setActiveOrg('org-one');
    useNavigationStore.getState().setActiveOrg('org-two');

    expect(useNavigationStore.getState().activeOrgSlug).toBe('org-two');
  });

  it('should store a team slug for an org', () => {
    useNavigationStore.getState().setActiveTeam('acme-corp', 'acme-team');

    expect(useNavigationStore.getState().teamByOrg).toEqual({
      'acme-corp': 'acme-team',
    });
  });

  it('should update the team slug for an existing org', () => {
    useNavigationStore.getState().setActiveTeam('acme-corp', 'team-a');
    useNavigationStore.getState().setActiveTeam('acme-corp', 'team-b');

    expect(useNavigationStore.getState().teamByOrg['acme-corp']).toBe('team-b');
  });

  it('should store team slugs for multiple orgs independently', () => {
    useNavigationStore.getState().setActiveTeam('org-one', 'team-alpha');
    useNavigationStore.getState().setActiveTeam('org-two', 'team-beta');

    expect(useNavigationStore.getState().teamByOrg).toEqual({
      'org-one': 'team-alpha',
      'org-two': 'team-beta',
    });
  });
});
