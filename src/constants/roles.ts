export const ROLE_LABELS: Record<string, string> = {
  ELDER:        'Idoso',
  CAREGIVER:    'Cuidador',
  GUARDIAN:     'Responsável',
  PROFESSIONAL: 'Profissional de Saúde',
  INSTITUTION:  'Instituição',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ─── Role colour system ───────────────────────────────────────────────────────
// Each role has a unique accent that harmonises with the brand palette
// (#4CAF88 green, #DFF4EC mint, #2F6FA3 blue, #F3C98B amber).
//
// color     → pure accent (avatar border, gradient anchor, icon tint)
// lightBg   → desaturated tint for avatar fill and badge background
// textColor → accessible foreground on lightBg (≥ 4.5:1 contrast)

export interface RoleStyle {
  color:     string;
  lightBg:   string;
  textColor: string;
}

export const ROLE_STYLES: Record<string, RoleStyle> = {
  ELDER:        { color: "#F3C98B", lightBg: "#FEF6E8", textColor: "#9A6A20" },
  CAREGIVER:    { color: "#4CAF88", lightBg: "#DFF4EC", textColor: "#1E7A5A" },
  GUARDIAN:     { color: "#2F6FA3", lightBg: "#E8F1FA", textColor: "#1A4F7A" },
  PROFESSIONAL: { color: "#8B7EC8", lightBg: "#F0EEF9", textColor: "#5344A0" },
  INSTITUTION:  { color: "#E8956D", lightBg: "#FDF0E8", textColor: "#9B4520" },
};

const FALLBACK_STYLE: RoleStyle = ROLE_STYLES.CAREGIVER;

export function getRoleStyle(role?: string | null): RoleStyle {
  return ROLE_STYLES[role ?? ""] ?? FALLBACK_STYLE;
}
