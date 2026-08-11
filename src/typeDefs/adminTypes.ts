export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'System Admin' | 'Content Moderator';
  status: 'Active' | 'Suspended';
  createdAt: string;
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
