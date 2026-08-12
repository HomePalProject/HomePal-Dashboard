export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender: number;
  phoneNumber?: string;
  birthDate: string;
  governorate: string;
  city: string;
  isActive: boolean;
  isProfileComplete: boolean;
  profileImageUrl?: string;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roles: string[];
}

export interface CreateAdminRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  gender: number;
  birthDate: string;
  governorate: string;
  city: string;
}

export interface PaginatedAdminsResponse {
  items: AdminUser[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}
