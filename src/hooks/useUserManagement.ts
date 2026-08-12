import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@services/adminService';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';

export function useAdmins(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['admins', page, pageSize],
    queryFn: () => adminService.getAdmins(page, pageSize),
  });
}

export function useGlobalAdminsCount() {
  return useQuery({
    queryKey: ['globalAdminsCount'],
    queryFn: () => adminService.getAdminsCount(),
  });
}

export function useDeactivateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deactivateAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminRequest) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['globalAdminsCount'] });
    },
  });
}
