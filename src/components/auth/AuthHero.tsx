import type { ReactNode } from "react";

type AuthHeroProps = {
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export default function AuthHero({
  title,
  subtitle,
  logo,
  imageSrc,
  imageAlt = "",
}: AuthHeroProps) {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between px-16 py-16">

      {/* ================================================= */}
      {/* BACKGROUND — MAIS PROFUNDO E COM COR */}
      {/* ================================================= */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-primary/30 to-primary/70" />

      {/* luz ambiente MUITO mais sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_70%)] opacity-50" />

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}
      <div className="relative z-10 max-w-xl">

        {logo && <div className="mb-12">{logo}</div>}

        <h1 className="text-5xl font-semibold leading-tight text-text mb-6">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg text-text/80 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* ================================================= */}
      {/* IMAGE */}
      {/* ================================================= */}
      {imageSrc && (
        <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none">

          <img
            src={imageSrc}
            alt={imageAlt}
            className="
              w-full
              h-[440px]
              object-cover

              /* fade só no topo */
              [mask-image:linear-gradient(to_top,black_65%,transparent_100%)]

              opacity-100
            "
          />

          {/* fusão de cor leve */}
          <div className="
            absolute inset-0
            bg-gradient-to-t
            from-primary-light/70
            via-primary-light/20
            to-transparent
          " />

          {/* glow quase imperceptível */}
          <div className="
            absolute inset-0
            bg-primary
            blur-3xl
            opacity-10
          " />
        </div>
      )}
    </div>
  );
}