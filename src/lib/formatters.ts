export function getLocalString(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) {
    const item = val[0];
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      if ('value' in item && typeof (item as any).value === 'string')
        return (item as any).value || '—';
      if ('name' in item && typeof (item as any).name === 'string')
        return (item as any).name || '—';
      if ('title' in item && typeof (item as any).title === 'string')
        return (item as any).title || '—';
    }
    return '—';
  }
  if (typeof val === 'object' && val !== null) {
    if ('value' in val && typeof (val as any).value === 'string') return (val as any).value;
    if ('name' in val && typeof (val as any).name === 'string') return (val as any).name;
    if ('title' in val && typeof (val as any).title === 'string') return (val as any).title;
    if ('en' in val && typeof (val as any).en === 'string') return (val as any).en;
  }
  return '—';
}

export function toLocalized(str: string) {
  return [{ culture: 'en-US', languageCode: 'en-US', value: str.trim() }];
}

export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');
  return `${baseUrl}${cleanPath}`;
}

export function getCategoryColor(name: string): { bg: string; text: string } {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { bg: 'bg-primary-container', text: 'text-primary' },
    { bg: 'bg-accent-container', text: 'text-accent' },
    { bg: 'bg-status-info-container', text: 'text-status-info' },
    { bg: 'bg-status-warning-container', text: 'text-status-warning' },
    { bg: 'bg-status-error-container', text: 'text-status-error' },
    { bg: 'bg-status-success-container', text: 'text-status-success' },
  ];
  return palettes[hash % palettes.length] ?? palettes[0];
}

export function getHour(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export function getLocalizedCulture(val: unknown, lang: 'en' | 'ar'): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    const match = val.find((item: any) => {
      const code = (item.culture || item.languageCode || '').toLowerCase();
      return code.includes(lang);
    });
    if (match) return match.value || '';
    if (lang === 'en' && val.length > 0) return val[0]?.value || '';
    if (lang === 'ar' && val.length > 1) return val[1]?.value || '';
  }
  return '';
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function formatCurrencyString(
  val: string | undefined | null,
  currencySymbol: string
): string {
  if (!val) return '—';
  return val.replace(/EGP|\$/gi, currencySymbol).trim();
}
