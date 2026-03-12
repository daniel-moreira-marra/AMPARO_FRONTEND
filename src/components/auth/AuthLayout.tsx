import type { ReactNode } from "react";

type AuthLayoutProps = {
  hero?: ReactNode;
  children: ReactNode;
};

export default function AuthLayout({ hero, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background">

      {/* LEFT SIDE — HERO */}
      {hero && (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          
          {/* Soft radial highlight */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
          
          {/* Content */}
          <div className="relative z-10 w-full h-ful">
            {hero}
          </div>
        </div>
      )}

      {/* RIGHT SIDE — FORM */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 bg-neutral-50">
        
        <div className="w-full max-w-md">
          
          {/* Floating card */}
          <div className="bg-background border border-border rounded-2xl shadow-lg p-8">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}