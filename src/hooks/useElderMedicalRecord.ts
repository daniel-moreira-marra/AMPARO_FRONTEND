import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { ApiResponse } from "@/types";

export interface ElderMedicalRecord {
  preferred_name: string | null;
  birth_date: string | null;
  gender: string;
  gender_display: string;
  mobility_level: string;
  mobility_display: string;
  cognitive_status: string;
  cognitive_display: string;
  has_fall_risk: boolean;
  needs_medication_support: boolean;
  requires_24h_care: boolean;
  medical_conditions: string | null;
  allergies: string | null;
  medications: string | null;
  medical_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
}

export function useElderMedicalRecord(elderProfileId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["elder-medical-record", elderProfileId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ElderMedicalRecord>>(
        `/elders/${elderProfileId}/medical-record/`
      );
      return data.data;
    },
    enabled: !!elderProfileId && enabled,
    staleTime: 60_000,
    retry: false,
  });
}
