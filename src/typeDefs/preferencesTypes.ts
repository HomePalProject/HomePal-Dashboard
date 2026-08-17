import type { LocalizedValue } from './catalogTypes';

export interface PreferenceResponse {
  id: string;
  name: LocalizedValue;
  description?: LocalizedValue;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PreferenceCategoryResponse {
  id: string;
  name: LocalizedValue;
  description?: LocalizedValue;
  createdAt: string;
  updatedAt?: string;
}

export interface AddPreferenceRequest {
  name: LocalizedValue;
  description?: LocalizedValue;
  categoryId: string;
}

export interface CreateCategoryRequest {
  name: LocalizedValue;
  description?: LocalizedValue;
}
