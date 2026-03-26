export interface NavigationStore {
  activeOrgSlug: string | null;
  teamByOrg: Record<string, string>;
  setActiveOrg: (orgSlug: string) => void;
  setActiveTeam: (orgSlug: string, teamSlug: string) => void;
}
