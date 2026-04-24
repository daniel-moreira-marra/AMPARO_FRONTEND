export const ROLE_LABELS: Record<string, string> = {
  ELDER: 'Idoso',
  CAREGIVER: 'Cuidador',
  GUARDIAN: 'Responsável',
  PROFESSIONAL: 'Profissional de Saúde',
  INSTITUTION: 'Instituição',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
