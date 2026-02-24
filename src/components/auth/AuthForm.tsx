import type { ReactNode, FormEvent } from "react";

type AuthFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
  headerIcon?: ReactNode;
  error?: string | null;
  isLoading?: boolean;
};

export default function AuthForm({
  title,
  description,
  submitLabel,
  children,
  onSubmit,
  footer,
  headerIcon,
  error,
  isLoading = false,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* HEADER */}
      <div className="text-center">
        {headerIcon && (
          <div className="flex justify-center mb-1">
            {headerIcon}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-primary">
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
        disabled={isLoading}
        className="
          w-full h-12
          rounded-xl
          font-medium
          text-white
          transition-all duration-200
          bg-blue
          hover:bg-blue/70
          active:scale-[0.99]
          disabled:opacity-60
          disabled:cursor-not-allowed
          shadow-lg
        "
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
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