import type { LocalizedTextItem } from '../typeDefs/productCategoryTypes';

export const getLocalizedName = (
  name: string | LocalizedTextItem[] | undefined,
  locale: 'en' | 'ar'
): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  const match = name.find((n) => n.languageCode?.startsWith(locale));
  return match?.value ?? '';
};

export const formatCount = (count?: number): number => {
  return count ?? 0;
};

export const getImageUrlSafe = (path: string | undefined): string => {
  return path ? path : '';
};
