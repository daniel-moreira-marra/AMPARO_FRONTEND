import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";
import type { UserRole, RoleProfile, ApiResponse } from "@/types";

export const ROLE_PROFILE_ENDPOINT: Record<UserRole, string> = {
  ELDER:        "/elders/me/",
  CAREGIVER:    "/caregivers/me/",
  GUARDIAN:     "/guardians/me/",
  PROFESSIONAL: "/professionals/me/",
  INSTITUTION:  "/institutions/me/",
};

export const useRoleProfile = (role?: UserRole) => {
  return useQuery({
    queryKey: ["roleProfile", role],
    queryFn: async () => {
      if (!role) return null;
      const { data } = await api.get<ApiResponse<RoleProfile>>(ROLE_PROFILE_ENDPOINT[role]);
      return data.data;
    },
    enabled: !!role,
    staleTime: 60_000,
  });
};

export const useUpdateRoleProfile = (role?: UserRole) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<RoleProfile>) => {
      if (!role) throw new Error("Role não definida.");
      const { data } = await api.patch<ApiResponse<RoleProfile>>(
        ROLE_PROFILE_ENDPOINT[role],
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["roleProfile", role], updated);
    },
    onError: (err) => resolveApiError(err, "Erro ao salvar perfil."),
  });
};
