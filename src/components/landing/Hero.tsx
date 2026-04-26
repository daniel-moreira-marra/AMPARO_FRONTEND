import { Link } from "react-router-dom";
import {
  ArrowRight, Users, Heart, MessageCircle, Share2,
  Briefcase, Clock, CheckCircle2, Link2,
} from "lucide-react";
import { ROLE_LABELS, ROLE_STYLES } from "@/constants/roles";

const ROLES = ["ELDER", "CAREGIVER", "GUARDIAN", "PROFESSIONAL", "INSTITUTION"] as const;

// ─── Mini app UI cards (same design system as the real app) ──────────────────

const MockFeedCard = () => {
  const s = ROLE_STYLES.CAREGIVER;
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 space-y-3.5">
      {/* Author row */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: s.lightBg, color: s.textColor }}
        >
          FC
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-text leading-tight">Fernanda Costa</span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: s.lightBg, color: s.textColor }}
            >
              <Briefcase size={9} />
              Cuidadora
            </span>
          </div>
          <div className="flex items-center gap-1 text-text/35 mt-0.5">
            <Clock size={9} />
            <span className="text-[10px] font-medium">há 2 horas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-[12.5px] text-text/72 leading-relaxed">
        Hoje foi um dia especial com a Dona Helena. Fizemos exercícios de memória e ela lembrou do nome de todos os netos.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/30">
        <span className="flex items-center gap-1.5 text-[11px] text-text/40 font-medium">
          <Heart size={12} />14
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text/40 font-medium">
          <MessageCircle size={12} />3
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text/40 font-medium">
          <Share2 size={12} />Compartilhar
        </span>
      </div>
    </div>
  );
};

const MockLinkCard = () => {
  const elderS    = ROLE_STYLES.ELDER;
  const careS     = ROLE_STYLES.CAREGIVER;
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-text/40">
          <Link2 size={11} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Vínculo</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
          <CheckCircle2 size={9} />
          Ativo
        </span>
      </div>

      {/* Connection visual */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px]"
            style={{ background: elderS.lightBg, color: elderS.textColor }}
          >
            HL
          </div>
          <span className="text-[10px] font-semibold text-text/55">Helena</span>
        </div>

        <div className="flex-1 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 h-px bg-border/60" />
          ))}
          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 h-px bg-border/60" />
          ))}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px]"
            style={{ background: careS.lightBg, color: careS.textColor }}
          >
            FC
          </div>
          <span className="text-[10px] font-semibold text-text/55">Fernanda</span>
        </div>
      </div>
    </div>
  );
};

// ─── Hero ────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-light/45 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"
        style={{ background: "rgba(47,111,163,0.05)" }}
      />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* ── Copy ───────────────────────────────────────────────────── */}
          <div className="space-y-8 text-center lg:text-left">

            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
              <Users size={14} />
              Plataforma gratuita para toda a rede de cuidado
            </div>

            <h1 className="text-[2.6rem] lg:text-5xl xl:text-[3.4rem] font-extrabold text-text leading-[1.1] tracking-tight">
              Cuidar de quem<br />
              importa,{" "}
              <em className="not-italic text-primary">juntos</em>
            </h1>

            <p className="text-lg text-text/65 leading-relaxed max-w-[520px] mx-auto lg:mx-0">
              Uma plataforma que conecta idosos, familiares e profissionais de saúde
              em uma rede integrada de cuidado, comunicação e confiança.
            </p>

            {/* Role pills */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {ROLES.map((key) => {
                const s = ROLE_STYLES[key];
                return (
                  <span
                    key={key}
                    className="px-3.5 py-1.5 rounded-full text-[12px] font-bold border"
                    style={{
                      background: s.lightBg,
                      color: s.textColor,
                      borderColor: s.color + "40",
                    }}
                  >
                    {ROLE_LABELS[key]}
                  </span>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-2xl font-bold text-[15px] hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/25"
              >
                Criar conta grátis
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 font-bold text-text/55 hover:text-text transition-colors text-sm"
              >
                Já tenho uma conta
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Product preview with photo backdrop ─────────────────────── */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[540px]">

            {/* Photo fills the right column, clipped with rounded corners */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <img
                src="/images/auth-hero2.jpeg"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center"
              />
              {/* Warm brand tint */}
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              {/* Left-edge blend into page white */}
              <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-white via-white/70 to-transparent" />
              {/* Soft top/bottom fades */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/40 to-transparent" />
            </div>

            {/* Cards float on top of photo */}
            <div className="relative w-full max-w-sm">

              {/* Cards */}
              <div className="relative space-y-3">
                <MockFeedCard />
                <MockLinkCard />
              </div>

              {/* Floating stat chip — top right */}
              <div className="absolute -top-5 -right-8 bg-white rounded-2xl shadow-lg px-4 py-3 border border-border/30 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Users size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-text/40 font-bold uppercase tracking-wide leading-none">Usuários</p>
                  <p className="text-[15px] font-extrabold text-text leading-tight">500+</p>
                </div>
              </div>

              {/* Floating chip — bottom left */}
              <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl shadow-lg px-4 py-3 border border-border/30 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={15} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-text/40 font-bold uppercase tracking-wide leading-none">Vínculos ativos</p>
                  <p className="text-[15px] font-extrabold text-text leading-tight">1.200+</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
