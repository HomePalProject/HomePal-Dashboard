export interface LocalizedTextItem {
  culture: string;
  languageCode?: string;
  value: string;
}

export interface ProductCategory {
  id: string;
  name: string | LocalizedTextItem[];
  description?: string | LocalizedTextItem[] | null;
  imagePath?: string | null;
  itemCount?: number;
  productsCount?: number;
  createdAt?: string;
}

export interface CreateUpdateCategoryPayload {
  name: LocalizedTextItem[];
  description: LocalizedTextItem[];
  imagePath?: string | null;
}
