// Localized text can be a plain string or an array of language-specific values.
// This matches the backend response shape consumed by `getLocalString`.
export type LocalizedValue = string | Array<{ languageCode: string; value: string }>;

export interface Supermarket {
  id: string;
  name: LocalizedValue;
  branches?: number;
}

export interface Offer {
  id: string;
  title: LocalizedValue;
  supermarketId?: string;
  supermarketName?: string;
  categoryName?: string;
  categoryId?: string;
  price?: number;
  status?: string;
}
