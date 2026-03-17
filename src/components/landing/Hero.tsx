import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Círculos decorativos de fundo para o efeito "Aura" */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-light/50 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl space-y-8 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-text leading-tight">
            Cuidar de quem <br />
            importa, <span className="text-primary italic">juntos</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-text/70 leading-relaxed">
            Conectando pessoas idosas, famílias e profissionais de saúde em uma rede 
            de cuidado, apoio e confiança para viver e cuidar melhor todos os dias.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto bg-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-blue/30"
            >
              Criar conta grátis
            </Link>
            
            <Link 
              to="/login" 
              className="group flex items-center gap-2 font-bold text-text/60 hover:text-text transition-colors"
            >
              Ou entrar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* O "Shape" arredondado que vemos atrás da imagem */}
          <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl shadow-primary/10">
            <img 
              src="/images/auth-hero2.jpeg" 
              alt="Idosa sendo cuidada" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Elementos flutuantes (Representando os ícones da imagem) */}
          <div className="absolute -top-6 right-10 bg-white p-3 rounded-full shadow-lg text-primary animate-bounce-slow z-20">
            <div className="bg-primary/10 p-2 rounded-full">♥</div>
          </div>
          <div className="absolute top-1/2 -left-8 bg-white p-3 rounded-full shadow-lg text-blue animate-pulse z-20">
            <div className="bg-blue/10 p-2 rounded-full">💬</div>
          </div>
        </div>
      </div>
    </section>
  );
}