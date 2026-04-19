import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-primary-light">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
          <img src="/images/logo-amparo.svg" alt="Amparo" className="h-12" />

          <nav className="flex gap-8 text-text/60 font-medium" aria-label="Links do rodapé">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#" className="hover:text-primary transition-colors">Como Funciona</a>
            <a href="#" className="hover:text-primary transition-colors">Sobre Nós</a>
            <a href="#" className="hover:text-primary transition-colors">Depoimentos</a>
          </nav>

          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Facebook do Amparo"
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram do Amparo"
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              aria-label="YouTube do Amparo"
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-text/40 border-t border-slate-100 pt-8 gap-4">
          <p>© 2026 Amparo. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Política de Privacidade</a>
            <a href="#" className="hover:underline">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
