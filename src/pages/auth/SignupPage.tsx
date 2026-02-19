import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { HeartHandshake } from "lucide-react";

import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast"

const signupSchema = z.object({
    full_name: z.string().min(1, "Nome completo é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    role: z.enum(["ELDER", "CAREGIVER", "FAMILY", "PROFESSIONAL", "INSTITUTION"]),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export const SignupPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: "ELDER"
        }
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Form errors state changed:", errors);
        }
    }, [errors]);

    const onSubmit = async (data: SignupForm) => {
        setIsLoading(true);
        setGlobalError(null);
        try {
            // Some backends might choke if an invalid/expired token is sent in the header even for public routes.
            // We use the custom _skipAuth flag to prevent the interceptor from adding the token.
            await api.post("/auth/signup/", {
                email: data.email,
                password: data.password,
                full_name: data.full_name,
                phone: data.phone,
                role: data.role
            }, {
                // @ts-ignore: Custom flag for interceptor
                _skipAuth: true
            });

            navigate("/login", { state: { message: "Conta criada com sucesso! Faça login." } });

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Signup error catch:", err);

            const responseData = err.response?.data;
            if (responseData) {
                // Handle Amparo structured error format
                if (responseData.error) {
                    const errorObj = responseData.error;

                    // 1. Map details to field errors
                    if (errorObj.details) {
                        Object.keys(errorObj.details).forEach((key) => {
                            const fieldKey = key as keyof SignupForm;
                            const fieldMessages = errorObj.details[fieldKey];
                            const firstMessage = Array.isArray(fieldMessages) ? fieldMessages[0] : null;

                            if (firstMessage && typeof firstMessage === 'string') {
                                setError(fieldKey, {
                                    type: "manual",
                                    message: firstMessage
                                });
                            }
                        });
                    }

                    // 2. Set global error message
                    if (errorObj.message) {
                        setGlobalError(errorObj.message);
                        return;
                    }
                }

                // Fallback for non-structured or missing message
                if (typeof responseData === 'string') {
                    setGlobalError(responseData);
                } else if (typeof responseData === 'object') {
                    // Avoid [object Object] and false values
                    const messages = Object.entries(responseData)
                        .filter(([key]) => key !== 'success')
                        .map(([_, v]) => {
                            if (typeof v === 'string') return v;
                            if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
                            if (v && typeof v === 'object' && (v as any).message) return (v as any).message;
                            return null;
                        })
                        .filter(Boolean);

                    setGlobalError(messages.length > 0 ? messages.join(", ") : "Erro ao criar conta.");
                } else {
                    setGlobalError("Erro ao criar conta.");
                }
            } else {
                setGlobalError("Ocorreu um erro ao entrar em contato com o servidor. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                    <CardDescription>
                        Junte-se ao Amparo para cuidar e conectar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Nome Completo</Label>
                            <Input id="full_name" {...register("full_name")} />
                            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="nome@exemplo.com" {...register("email")} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" placeholder="(00) 00000-0000" {...register("phone")} />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Perfil</Label>
                                <Select
                                    onValueChange={(val: "ELDER" | "CAREGIVER" | "FAMILY" | "PROFESSIONAL" | "INSTITUTION") => setValue("role", val)}
                                    defaultValue={watch("role") || "ELDER"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ELDER">Idoso</SelectItem>
                                        <SelectItem value="CAREGIVER">Cuidador</SelectItem>
                                        <SelectItem value="FAMILY">Familiar</SelectItem>
                                        <SelectItem value="PROFESSIONAL">Profissional</SelectItem>
                                        <SelectItem value="INSTITUTION">Instituição</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" {...register("password")} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                        </div>

                        {globalError && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                                {globalError}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Criando conta..." : "Criar Conta"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                    <div>
                        Já tem uma conta?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Entrar
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
