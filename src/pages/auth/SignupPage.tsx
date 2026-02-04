import { useState } from "react";
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
// import { useToast } from "@/hooks/use-toast"

const signupSchema = z.object({
    first_name: z.string().min(1, "Nome é obrigatório"),
    last_name: z.string().min(1, "Sobrenome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export const SignupPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupForm) => {
        setIsLoading(true);
        setError(null);
        try {
            // Adjust payload to match backend expectation if needed
            // SignupView usually expects standard user fields
            await api.post("/auth/signup/", {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
            });

            // Redirect to login with success message (simulated)
            navigate("/login", { state: { message: "Conta criada com sucesso! Faça login." } });
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            if (err.response?.data) {
                // Try to format backend validation errors
                const msg = Object.values(err.response.data).flat().join(", ");
                setError(msg || "Erro ao criar conta.");
            } else {
                setError("Ocorreu um erro ao criar conta. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Nome</Label>
                                <Input id="first_name" {...register("first_name")} />
                                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Sobrenome</Label>
                                <Input id="last_name" {...register("last_name")} />
                                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="nome@exemplo.com" {...register("email")} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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

                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                                {error}
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
