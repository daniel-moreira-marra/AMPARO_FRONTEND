import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { name: "Como funciona", href: "#como-funciona" },
  { name: "Para quem",     href: "#para-voce" },
  { name: "Depoimentos",   href: "#depoimentos" },
] as const;

export default function Header() {
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMenuOpen, setIsMenuOpen]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 backdrop-blur-md py-3 shadow-sm border-b border-border/30"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="Ir para o início">
          <img src="/images/logo-amparo.svg" alt="Amparo" className="h-10 md:h-11" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
          {NAV_LINKS.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              className="text-text/65 hover:text-primary font-semibold text-[14px] transition-colors"
            >
              {name}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-text/65 hover:text-text hover:bg-gray-100 transition-all"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2.5 rounded-full font-bold text-[14px] bg-primary text-white hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Criar conta
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          className="md:hidden p-2 rounded-xl text-text/70 hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border/40 p-6 flex flex-col gap-5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {NAV_LINKS.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className="text-[16px] font-semibold text-text/70 hover:text-primary transition-colors"
            >
              {name}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3 border-t border-border/30">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 rounded-xl border border-border text-center font-bold text-[14px] text-text/70 hover:bg-gray-50 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-white text-center font-bold text-[14px] hover:opacity-90 transition-opacity"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
