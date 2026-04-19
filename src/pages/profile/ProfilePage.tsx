import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield } from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const fullName = user.full_name?.trim() || "Usuário";
  const initial = fullName.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 pb-2">
          <Avatar className="h-24 w-24">
            {user.avatar && <AvatarImage src={user.avatar} alt={fullName} />}
            <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1">
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
            <p className="text-sm font-medium text-primary flex items-center justify-center sm:justify-start gap-2">
              <Shield className="h-4 w-4" />
              {roleLabel}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 border-t mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Nome Completo</span>
              <p>{fullName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">ID do Usuário</span>
              <p>#{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No momento, a edição de perfil deve ser solicitada ao administrador ou feita via aplicativo móvel.
          </p>
          <Button variant="outline" disabled>Editar Perfil</Button>
        </CardContent>
      </Card>
    </div>
  );
};
