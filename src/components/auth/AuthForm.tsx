import type { ReactNode, FormEvent } from "react";
import { useState } from "react";

type AuthFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  footer?: ReactNode;
  headerIcon?: ReactNode;
};

export default function AuthForm({
  title,
  description,
  submitLabel,
  children,
  onSubmit,
  footer,
  headerIcon,
}: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(e);
    } catch (err: any) {
      setError(err?.message || "Algo deu errado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* HEADER */}
      <div className="text-center">
        {headerIcon && (
          <div className="flex justify-center mb-1">
            {headerIcon}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-text">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-text/70 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* FIELDS */}
      <div className="space-y-4">
        {children}
      </div>

      {/* ERROR */}
      {error && (
        <div className="
          text-sm text-red-600
          bg-red-50
          border border-red-200
          px-4 py-3
          rounded-lg
        ">
          {error}
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full h-12
          rounded-xl
          font-medium
          text-white
          transition-all duration-200
          bg-blue
          hover:bg-primary/90
          active:scale-[0.99]
          disabled:opacity-60
          disabled:cursor-not-allowed
          shadow-lg
        "
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            processando...
          </span>
        ) : (
          submitLabel
        )}
      </button>

      {/* FOOTER */}
      {footer && (
        <div className="text-center text-sm text-text/70 pt-2">
          {footer}
        </div>
      )}
    </form>
  );
}