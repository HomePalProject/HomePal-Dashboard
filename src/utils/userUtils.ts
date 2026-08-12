export const ROLE_OPTIONS = ['Admin', 'Household Manager', 'Household Member'];

export function getRoleBadgeClass(roles: string[]) {
  if (roles.includes('Admin')) return 'bg-primary text-white';
  if (roles.includes('Household Manager')) return 'bg-[#dceee8] text-primary';
  return 'bg-surface-variant text-text-secondary';
}

export function getInitials(username: string) {
  return username ? username.slice(0, 2).toUpperCase() : 'A';
}
