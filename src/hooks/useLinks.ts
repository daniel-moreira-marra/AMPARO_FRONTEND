import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";

export interface Link {
  id: number;
  status: "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED";
  link_type: "caregiver" | "guardian" | "professional" | "institution";
  created_at: string;
  notes?: string;
  elder_id: number;
  other_party_id: number | null;
  other_party_name: string;
  other_party_role: string;
  other_party_bio?: string | null;
  other_party_extra?: string[] | null;
}

export interface CreateLinkPayload {
  link_type: string;
  elder: number;
  notes?: string;
  agreed_hourly_rate?: string;
  relationship?: string;
  service_mode?: string;
}

export interface RespondLinkPayload {
  link_type: "caregiver" | "guardian" | "professional" | "institution";
  link_id: number;
  action: "approve" | "reject";
}

export const useLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data } = await api.get<Link[]>("/links/");
      return data;
    },
    staleTime: 30_000,
  });
};

export const usePublicLinks = (userId: number | null) => {
  return useQuery({
    queryKey: ["links", "public", userId],
    queryFn: async () => {
      const { data } = await api.get<Link[]>(`/links/${userId}/`);
      return data;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLinkPayload) => {
      const { data } = await api.post("/links/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};

export const useRespondLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RespondLinkPayload) => {
      const { data } = await api.post("/links/respond/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (err) => resolveApiError(err, "Erro ao responder vínculo."),
  });
};

export interface EndLinkPayload {
  link_type: "caregiver" | "guardian" | "professional" | "institution";
  link_id: number;
}

export const useEndLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EndLinkPayload) => {
      const { data } = await api.post("/links/end/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};
