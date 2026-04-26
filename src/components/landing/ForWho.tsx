import { User, Heart, Shield, Stethoscope, Building2, CheckCircle2 } from "lucide-react";
import { ROLE_LABELS, ROLE_STYLES } from "@/constants/roles";

const ROLES_DATA = [
  {
    key: "ELDER",
    icon: User,
    subtitle: "Autonomia com segurança",
    points: [
      "Mantenha sua família sempre informada",
      "Acesse profissionais de saúde de confiança",
      "Sinta-se próximo de quem você ama",
    ],
  },
  {
    key: "CAREGIVER",
    icon: Heart,
    subtitle: "Organize e ganhe visibilidade",
    points: [
      "Gerencie múltiplos vínculos com clareza",
      "Mostre suas qualificações e experiência",
      "Comunique-se com famílias de forma transparente",
    ],
  },
  {
    key: "GUARDIAN",
    icon: Shield,
    subtitle: "Tranquilidade onde você estiver",
    points: [
      "Acompanhe o bem-estar do seu familiar",
      "Coordene toda a equipe de cuidado",
      "Receba atualizações em tempo real",
    ],
  },
  {
    key: "PROFESSIONAL",
    icon: Stethoscope,
    subtitle: "Cresça sua atuação na área",
    points: [
      "Encontre pacientes e famílias qualificadas",
      "Exiba suas credenciais e especialidades",
      "Construa uma rede de referência sólida",
    ],
  },
  {
    key: "INSTITUTION",
    icon: Building2,
    subtitle: "Gestão e alcance em um só lugar",
    points: [
      "Aumente sua visibilidade na plataforma",
      "Conecte-se com famílias que precisam de você",
      "Gerencie vínculos com transparência",
    ],
  },
] as const;

export default function ForWho() {
  return (
    <section id="para-voce" className="py-24" style={{ background: "rgb(249,250,251)" }}>
      <div className="container mx-auto px-6">

        <div className="text-center mb-16 space-y-3">
          <p className="text-sm font-bold text-primary uppercase tracking-widest">Para todos na rede</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-text">
            O Amparo foi feito para você
          </h2>
          <p className="text-text/55 text-base max-w-lg mx-auto leading-relaxed">
            Seja você idoso, familiar, cuidador, profissional de saúde ou instituição —
            há um espaço aqui para você.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-[1100px] mx-auto">
          {ROLES_DATA.map(({ key, icon: Icon, subtitle, points }) => {
            const style = ROLE_STYLES[key];
            return (
              <div
                key={key}
                className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col gap-5"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: style.lightBg }}
                >
                  <Icon size={22} style={{ color: style.color }} />
                </div>

                {/* Heading */}
                <div className="space-y-0.5">
                  <h3 className="font-bold text-[15px] text-text">
                    Para {ROLE_LABELS[key].toLowerCase()}
                    {key === "INSTITUTION" ? "s" : key === "ELDER" ? "s" : "es"}
                  </h3>
                  <p className="text-[12px] text-text/50 font-medium leading-snug">{subtitle}</p>
                </div>

                {/* Benefits */}
                <ul className="space-y-2.5 flex-1">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <CheckCircle2
                        size={13}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: style.color }}
                      />
                      <span className="text-[12px] text-text/65 font-medium leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>

                {/* Role badge */}
                <span
                  className="self-start px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  style={{ background: style.lightBg, color: style.textColor }}
                >
                  {ROLE_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
