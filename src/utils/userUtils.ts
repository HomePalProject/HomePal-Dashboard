export const ROLE_OPTIONS = ['Admin', 'Household Manager', 'Household Member'];

export function getRoleBadgeClass(roles: string[]) {
  if (roles.includes('Admin'))
    return 'bg-primary/10 text-primary border border-primary/20 shadow-xs';
  if (roles.includes('Household Manager'))
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs';
  return 'bg-surface-variant text-text-secondary border border-border';
}

export function getInitials(username: string) {
  if (!username) return 'US';
  const clean = username.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  return username.slice(0, 1).toUpperCase();
}
