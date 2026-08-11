export interface PreferenceResponse {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PreferenceCategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AddPreferenceRequest {
  name: string;
  description?: string;
  categoryId: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}
