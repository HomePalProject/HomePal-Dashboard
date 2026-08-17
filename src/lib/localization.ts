export async function fetchBilingual<T>(
  fetchOne: (acceptLanguage: 'en' | 'ar') => Promise<T>
): Promise<{ en: T; ar: T }> {
  const [en, ar] = await Promise.all([fetchOne('en'), fetchOne('ar')]);
  return { en, ar };
}
