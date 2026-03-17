import { ShieldCheck, Users, HeartPulse } from "lucide-react";

const features = [
  {
    title: "Rede de Cuidado",
    desc: "Conecte idosos, familiares e profissionais de saúde de forma simples e segura.",
    icon: <Users size={32} />,
  },
  {
    title: "Segurança e Confiança",
    desc: "Comunicação segura e proteção total de dados em uma rede confiável.",
    icon: <ShieldCheck size={32} />,
  },
  {
    title: "Acesso a Profissionais",
    desc: "Encontre e se conecte com médicos, enfermeiros e cuidadores qualificados.",
    icon: <HeartPulse size={32} />,
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-light/20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-text mb-16">
          Como o Amparo pode ajudar você
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow border border-white flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-4">{item.title}</h3>
              <p className="text-text/60 text-sm leading-relaxed mb-6">{item.desc}</p>
              
              <div className="flex gap-1 text-warm">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}