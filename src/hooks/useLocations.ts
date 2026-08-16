import { useQuery } from '@tanstack/react-query';
import { locationService } from '@services/locationService';

export function useGovernorates() {
  const query = useQuery({
    queryKey: ['governorates'],
    queryFn: () => locationService.getGovernorates(),
  });
  return {
    governorates: query.data || [],
    loading: query.isLoading,
    error: query.error,
  };
}

export function useCitiesByGovernorate(governorateId: string) {
  const query = useQuery({
    queryKey: ['cities', governorateId],
    queryFn: () => locationService.getCitiesByGovernorate(governorateId),
    enabled: !!governorateId, // only run if we have an ID
  });
  return {
    cities: query.data || [],
    loading: query.isLoading,
    error: query.error,
  };
}
