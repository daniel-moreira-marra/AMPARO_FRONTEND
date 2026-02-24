import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";
import { api } from "@/api/axios";


// ================= ROLES =================

const ROLE_OPTIONS = [
  { value: "ELDER", label: "Idoso" },
  { value: "CAREGIVER", label: "Cuidador" },
  { value: "FAMILY", label: "Familiar" },
  { value: "PROFESSIONAL", label: "Profissional" },
  { value: "INSTITUTION", label: "Instituição" },
] as const;


// ================= VALIDATION =================

const schema = z.object({
  full_name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm_password: z.string(),
  role: z.enum(["ELDER", "CAREGIVER", "FAMILY", "PROFESSIONAL", "INSTITUTION"]),

  phone: z.string().min(8, "Telefone inválido"),
  address_line: z.string().min(3, "Informe o endereço"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().min(2, "Informe o estado"),
  zip_code: z.string().min(5, "CEP inválido"),
})
.refine(data => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "As senhas não coincidem",
});

type FormData = z.infer<typeof schema>;


// ================= PAGE =================

export default function Signup() {

  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "ELDER" },
  });


  // ================= STEP VALIDATION =================

  async function nextStep() {
    const fields =
      step === 1
        ? ["full_name", "email", "password", "confirm_password", "role"]
        : ["phone", "address_line", "city", "state", "zip_code"];

    const valid = await trigger(fields as any);
    if (valid) setStep(s => s + 1);
  }

  function prevStep() {
    setStep(s => s - 1);
  }


  // ================= SUBMIT =================

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    const payload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
    };

    try {
      await api.post("/auth/signup/", payload);

      navigate("/login", {
        replace: true,
        state: { message: "Conta criada com sucesso" },
      });

    } catch (err: any) {

      if (err.response?.status === 400) {
        setServerError("Dados inválidos. Revise as informações.");
        return;
      }

      if (err.response) {
        setServerError("Ocorreu um erro. Tente novamente mais tarde.");
        return;
      }

      setServerError("Falha de conexão. Verifique sua internet.");
    }
  };


  // ================= UI =================

  return (
    <AuthLayout
      hero={
        <AuthHero
          logo={<img src="/images/logo-amparo.svg" className="w-40" />}
          title="Cuidar de quem importa, juntos"
          subtitle="Crie sua conta em poucos passos."
          imageSrc="/images/auth-hero2.jpeg"
        />
      }
    >
      <AuthForm
        headerIcon={<img src="/images/amparo-icon.svg" className="w-10" />}
        title="Criar conta"
        description={`Etapa ${step} de 2`}
        submitLabel={step === 2 ? "Criar conta" : "Continuar"}
        onSubmit={step === 2 ? handleSubmit(onSubmit) : e => { e.preventDefault(); nextStep(); }}
        error={serverError}
        isLoading={isSubmitting}
        footer={
          <p>
            Já possui uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        }
      >

        {step === 1 && (
          <>
            <Field label="Nome completo" error={errors.full_name?.message}>
              <input {...register("full_name")} placeholder="Seu nome completo" className={input} />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} placeholder="seu@email.com" className={input} />
            </Field>

            <Field label="Senha" error={errors.password?.message}>
              <input type="password" {...register("password")} placeholder="Crie uma senha segura" className={input} />
            </Field>

            <Field label="Confirmar senha" error={errors.confirm_password?.message}>
              <input type="password" {...register("confirm_password")} placeholder="Repita sua senha" className={input} />
            </Field>

            <Field label="Perfil" error={errors.role?.message}>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <select {...field} className={input}>
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                )}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Telefone" error={errors.phone?.message}>
              <input {...register("phone")} placeholder="(11) 99999-9999" className={input} />
            </Field>

            <Field label="Endereço" error={errors.address_line?.message}>
              <input {...register("address_line")} placeholder="Rua, número e complemento" className={input} />
            </Field>

            <Field label="Cidade" error={errors.city?.message}>
              <input {...register("city")} placeholder="Sua cidade" className={input} />
            </Field>

            <Field label="Estado" error={errors.state?.message}>
              <input {...register("state")} placeholder="UF" className={input} />
            </Field>

            <Field label="CEP" error={errors.zip_code?.message}>
              <input {...register("zip_code")} placeholder="00000-000" className={input} />
            </Field>

            <button
              type="button"
              onClick={prevStep}
              className="text-sm text-text/70 hover:underline pt-2"
            >
              Voltar
            </button>
          </>
        )}

      </AuthForm>
    </AuthLayout>
  );
}


// ================= UI HELPERS =================

const input = `
w-full h-12 px-4 rounded-xl border border-border
focus:ring-2 focus:ring-primary/40 focus:border-primary
`;

function Field({ label, error, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-text">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}