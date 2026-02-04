import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link as LinkIcon, Plus, User } from "lucide-react";

import { useLinks, useCreateLink, type Link as LinkType } from "@/hooks/useLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";


const createLinkSchema = z.object({
    elderId: z.preprocess((val) => Number(val), z.number().min(1, "ID do idoso inválido")),
});

export const LinksPage = () => {
    const { data: links, isLoading } = useLinks();
    const { mutate: createLink, isPending } = useCreateLink();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(createLinkSchema),
    });

    const onSubmit = (data: { elderId: number }) => {
        setError(null);
        createLink(data.elderId, {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
            onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const msg = err.response?.data?.elder?.[0] || "Erro ao solicitar vínculo.";
                setError(msg);
            }
        });
    };

    const StatusBadge = ({ status }: { status: LinkType['status'] }) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            ACTIVE: "bg-green-100 text-green-800 border-green-200",
            ENDED: "bg-gray-100 text-gray-800 border-gray-200",
            CANCELLED: "bg-red-100 text-red-800 border-red-200",
        };
        // Fallback for styling manually if Badge component not sophisticated
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.ENDED}`}>
                {status === 'PENDING' && 'Pendente'}
                {status === 'ACTIVE' && 'Ativo'}
                {status === 'ENDED' && 'Encerrado'}
                {status === 'CANCELLED' && 'Cancelado'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Meus Vínculos</h1>
                    <p className="text-muted-foreground">Gerencie suas conexões de cuidado.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Vínculo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Solicitar novo vínculo</DialogTitle>
                            <DialogDescription>
                                Insira o ID do idoso com quem deseja se conectar.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="elderId">ID do Idoso</Label>
                                <Input id="elderId" type="number" placeholder="Ex: 123" {...register("elderId")} />
                                {errors.elderId && <p className="text-xs text-destructive">{errors.elderId.message}</p>}
                            </div>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Enviando..." : "Solicitar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-[150px] rounded-xl" />
                    <Skeleton className="h-[150px] rounded-xl" />
                </div>
            ) : links?.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <LinkIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg">Nenhum vínculo encontrado</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Comece adicionando um vínculo para se conectar a um idoso e acompanhar seu dia a dia.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {links?.map((link) => (
                        <Card key={link.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Idoso #{link.elder}</span>
                                </div>
                                <StatusBadge status={link.status} />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground">
                                    Solicitado em {new Date(link.created_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
