import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShieldCheck, Users } from "lucide-react";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Cadastro gratuito" },
  { icon: Users,       label: "Sem mensalidade" },
  { icon: Heart,       label: "Dados protegidos" },
] as const;

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-28 bg-gradient-to-br from-primary via-primary to-blue">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/8 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">

        {/* Trust chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 bg-white/15 text-white/90 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm"
            >
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>

        <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
          Comece hoje a cuidar<br className="hidden lg:block" /> de quem você ama
        </h2>

        <p className="text-white/70 text-lg max-w-md mx-auto mb-12 leading-relaxed">
          Junte-se a centenas de famílias e profissionais que já construíram
          uma rede de cuidado no Amparo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto bg-white text-primary px-11 py-4 rounded-2xl font-bold text-[15px] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg"
          >
            Criar conta grátis
          </Link>
          <Link
            to="/login"
            className="group flex items-center gap-2 text-white/75 font-bold hover:text-white transition-colors text-sm"
          >
            Já tenho uma conta
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
