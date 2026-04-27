import { Users, Link2, ShieldCheck, Star } from "lucide-react";

const STATS = [
  { icon: Users,       value: "500+",   label: "Usuários ativos" },
  { icon: ShieldCheck, value: "200+",   label: "Profissionais cadastrados" },
  { icon: Link2,       value: "1.200+", label: "Vínculos criados" },
  { icon: Star,        value: "4.9",    label: "Avaliação média" },
] as const;

export default function StatsBar() {
  return (
    <section className="py-12 border-y border-primary/8" style={{ background: "rgba(223,244,236,0.3)" }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-1.5">
                <Icon size={16} className="text-primary" />
              </div>
              <p className="text-3xl font-extrabold text-text">{value}</p>
              <p className="text-sm text-text/50 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
