import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { User, ApiResponse } from "@/types";

export interface PublicUserInfo {
  id: number;
  full_name: string;
  role: string;
  avatar: string | null;
  city: string | null;
  state: string | null;
  elder_profile_id: number | null;
  profile: Record<string, any>;
  email?: string | null;
  phone?: string | null;
  show_links?: boolean;
}

export function usePublicUser(userId: number | null) {
  return useQuery({
    queryKey: ["public-user", userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicUserInfo>>(`/accounts/users/${userId}/`);
      return data.data;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

type ProfileUpdatePayload = Partial<
  Pick<User, "full_name" | "phone" | "address_line" | "city" | "state" | "zip_code" | "show_email" | "show_phone" | "show_links">
> & { avatar?: File };

export function useProfile() {
  const queryClient = useQueryClient();
  const { accessToken, refreshToken, setAuth } = useAuthStore();

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User>>("/auth/me/");
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      if (payload.avatar) {
        const formData = new FormData();
        const { avatar, ...rest } = payload;
        Object.entries(rest).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, String(value));
        });
        formData.append("avatar", avatar);
        const res = await api.patch<ApiResponse<User>>("/auth/me/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data;
      }
      const res = await api.patch<ApiResponse<User>>("/auth/me/", payload);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      // Force refetch so processed fields (e.g. avatar URL) arrive fresh from server
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (accessToken && refreshToken) {
        setAuth(accessToken, refreshToken, updated);
      }
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  };
}
