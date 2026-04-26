import { StarRating } from "@/components/ui/StarRating";
import { ROLE_LABELS, ROLE_STYLES } from "@/constants/roles";

const TESTIMONIALS = [
  {
    initials: "AL",
    name: "Ana Lima",
    age: 41,
    role: "GUARDIAN" as const,
    text: "Meu pai tem Alzheimer em fase inicial. O Amparo me ajudou a coordenar o cuidador, a nutricionista e a fisioterapeuta dele — tudo num lugar só. Minha ansiedade diminuiu muito.",
  },
  {
    initials: "RA",
    name: "Roberto Alves",
    age: 68,
    role: "ELDER" as const,
    text: "Minha filha mora em outro estado e agora ela acompanha tudo sobre minha saúde. Me sinto mais tranquilo sabendo que ela está por dentro do que acontece comigo.",
  },
  {
    initials: "FC",
    name: "Fernanda Costa",
    age: 34,
    role: "CAREGIVER" as const,
    text: "O Amparo me ajudou a organizar meu trabalho e mostrar minhas qualificações. Consegui três novos vínculos só no primeiro mês na plataforma.",
  },
] as const;

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16 space-y-3">
          <p className="text-sm font-bold text-primary uppercase tracking-widest">Histórias reais</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-text">
            Quem usa, recomenda
          </h2>
          <p className="text-text/55 text-base max-w-md mx-auto leading-relaxed">
            Veja como o Amparo está transformando o cuidado de pessoas reais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
          {TESTIMONIALS.map(({ initials, name, age, role, text }) => {
            const style = ROLE_STYLES[role];
            return (
              <div
                key={name}
                className="flex flex-col gap-5 rounded-3xl p-7 border border-border/40 hover:border-border/70 hover:shadow-md transition-all duration-200"
                style={{ background: "rgb(249,250,251)" }}
              >
                {/* Stars */}
                <StarRating />

                {/* Quote */}
                <p className="text-[14px] text-text/72 font-medium leading-relaxed flex-1">
                  "{text}"
                </p>

                {/* Author row */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: style.lightBg, color: style.textColor }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-text leading-tight">
                      {name}
                      <span className="text-text/40 font-normal">, {age} anos</span>
                    </p>
                    <span
                      className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mt-0.5"
                      style={{ background: style.lightBg, color: style.textColor }}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
