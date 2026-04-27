import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveApiError } from "@/utils/apiError";
import type { User, UserRole, ApiResponse } from "@/types";

const PROFILE_ENDPOINT: Record<UserRole, string> = {
  ELDER:        "/elders/me/",
  CAREGIVER:    "/caregivers/me/",
  GUARDIAN:     "/guardians/me/",
  PROFESSIONAL: "/professionals/me/",
  INSTITUTION:  "/institutions/me/",
};

export function useOnboarding() {
  const { accessToken, refreshToken, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (role: UserRole, data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData: Record<string, unknown> = { ...data };

      // Rename care_types → care_types_input for the caregiver endpoint
      if (role === "CAREGIVER") {
        profileData.care_types_input = profileData.care_types;
        delete profileData.care_types;
      }

      // Strip CNPJ formatting — backend stores only digits (max_length=14)
      if (role === "INSTITUTION" && typeof profileData.cnpj === "string") {
        profileData.cnpj = profileData.cnpj.replace(/\D/g, "");
      }

      // Strip empty strings so optional fields don't trigger backend validation errors
      for (const key of Object.keys(profileData)) {
        if (profileData[key] === "") delete profileData[key];
      }

      await api.patch(PROFILE_ENDPOINT[role], profileData);

      const { data: resp } = await api.post<ApiResponse<User>>("/auth/onboarding/complete/");
      const updatedUser = resp.data;

      if (accessToken && refreshToken) {
        setAuth(accessToken, refreshToken, updatedUser);
      }

      navigate("/feed", { replace: true });
    } catch (err) {
      setError(resolveApiError(err, "Ocorreu um erro ao salvar seu perfil. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, error };
}
