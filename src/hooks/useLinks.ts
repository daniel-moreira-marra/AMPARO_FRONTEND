import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";

export interface Link {
  id: number;
  elder: number;
  elder_name?: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  created_at: string;
}

export const useLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data } = await api.get<Link[]>("/caregivers/me/link-to-elder/");
      return data;
    },
    staleTime: 30_000,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (elderId: number) => {
      const { data } = await api.post("/caregivers/me/link-to-elder/", { elder: elderId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};
