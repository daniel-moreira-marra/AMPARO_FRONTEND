import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { SearchUser, SearchFilters, ApiResponse } from "@/types";

interface SearchResponse {
  next: string | null;
  previous: string | null;
  role: string | null;
  results: SearchUser[];
}

export const useSearch = (filters: SearchFilters, enabled = true) => {
  return useQuery({
    queryKey: ["search", filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {};
      if (filters.q)               params.q               = filters.q;
      if (filters.role)            params.role            = filters.role;
      if (filters.city)            params.city            = filters.city;
      if (filters.state)           params.state           = filters.state;
      if (filters.is_available !== undefined) params.is_available = filters.is_available;
      if (filters.experience_years !== undefined) params.experience_years = filters.experience_years;
      if (filters.profession)      params.profession      = filters.profession;
      if (filters.service_mode)    params.service_mode    = filters.service_mode;
      if (filters.min_price)       params.min_price       = filters.min_price;
      if (filters.max_price)       params.max_price       = filters.max_price;

      const { data } = await api.get<ApiResponse<SearchResponse>>("/search/", { params });
      return data.data;
    },
    enabled,
    staleTime: 30_000,
  });
};
