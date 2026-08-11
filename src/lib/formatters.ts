export function getLocalString(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) return val[0].value || '—';
  return '—';
}

export function toLocalized(str: string) {
  return [{ languageCode: 'en', value: str.trim() }];
}

export function getCategoryColor(name: string): { bg: string; text: string } {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { bg: 'bg-[#356859]/10', text: 'text-[#356859]' },
    { bg: 'bg-amber-500/10', text: 'text-amber-700' },
    { bg: 'bg-blue-500/10', text: 'text-blue-700' },
    { bg: 'bg-purple-500/10', text: 'text-purple-700' },
    { bg: 'bg-red-500/10', text: 'text-red-700' },
    { bg: 'bg-teal-500/10', text: 'text-teal-700' },
  ];
  return palettes[hash % palettes.length] ?? palettes[0];
}

export function getHour(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
