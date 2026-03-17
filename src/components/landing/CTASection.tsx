import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-primary-light/30">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-text mb-12">
          Pronto para começar a cuidar <br /> de quem importa?
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/signup" 
            className="w-full sm:w-auto bg-blue text-white px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-blue/20"
          >
            Criar conta grátis
          </Link>
          
          <Link to="/login" className="group flex items-center gap-2 font-bold text-text/60 hover:text-text transition-all">
            Ou entre <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}