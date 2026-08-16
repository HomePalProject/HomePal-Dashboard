export type LocalizedValue =
  string | Array<{ languageCode?: string; culture?: string; value: string }>;

export interface Supermarket {
  id: string;
  name: LocalizedValue;
  branches?: number;
  logoPath?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
}

export interface Offer {
  id: string;
  name?: LocalizedValue;
  title?: LocalizedValue;
  description?: string | LocalizedValue | null;
  quantity?: number;
  unitId?: string;
  unitName?: string | null;
  unitSymbol?: string | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  price?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  imagePath?: string | null;
  supermarketId?: string | null;
  supermarketName?: string | null;
  supermarketLogoPath?: string | null;
  supermarketWebsiteUrl?: string | null;
  isVerified?: boolean;
  createdAt?: string | null;
  status?: string | null;
}
