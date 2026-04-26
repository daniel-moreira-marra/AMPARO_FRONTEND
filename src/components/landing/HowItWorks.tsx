import { UserPlus, SlidersHorizontal, Network } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    desc: "Em menos de 2 minutos. Escolha seu perfil — idoso, cuidador, familiar, profissional ou instituição.",
  },
  {
    num: "02",
    icon: SlidersHorizontal,
    title: "Configure seu perfil",
    desc: "Adicione suas informações, disponibilidade e especialidades para que a pessoa certa te encontre.",
  },
  {
    num: "03",
    icon: Network,
    title: "Construa sua rede",
    desc: "Solicite vínculos, publique no feed e tenha toda a rede de cuidado organizada em um só lugar.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16 space-y-3">
          <p className="text-sm font-bold text-primary uppercase tracking-widest">Simples e direto</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-text">
            Três passos para começar
          </h2>
          <p className="text-text/55 text-base max-w-lg mx-auto leading-relaxed">
            O Amparo foi pensado para ser acessível a todos — de idosos a profissionais de saúde.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <div key={num} className="relative flex flex-col items-center text-center gap-5 group">

              {/* Connector line between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px border-t-2 border-dashed border-primary/20 z-0" />
              )}

              {/* Icon circle */}
              <div className="relative z-10 w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Icon size={26} className="text-primary" />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-primary/50 uppercase tracking-[0.15em]">{num}</p>
                <h3 className="text-[17px] font-bold text-text">{title}</h3>
                <p className="text-sm text-text/55 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
