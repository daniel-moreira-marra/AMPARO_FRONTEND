import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartHandshake } from "lucide-react";

export const LandingPage = () => {
    return (
        <div className="flex flex-col flex-1 bg-gradient-to-b from-blue-50 to-white">
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                        Cuidado e conexão para quem você ama
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Uma rede de apoio dedicada a conectar idosos, cuidadores e familiares.
                        Organize o cuidado, acompanhe o dia a dia e sinta-se seguro.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/signup">
                        <Button size="lg" className="h-12 px-8 text-lg">
                            Começar agora
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                            Já tenho conta
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t w-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <h3 className="font-medium text-lg">Conexão Humana</h3>
                        <p className="text-gray-500 text-sm">Design pensado para aproximar pessoas e facilitar o diálogo.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <h3 className="font-medium text-lg">Diário de Cuidado</h3>
                        <p className="text-gray-500 text-sm">Registre momentos, saúde e atividades do dia a dia.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <h3 className="font-medium text-lg">Segurança</h3>
                        <p className="text-gray-500 text-sm">Ambiente seguro e confiável para dados sensíveis.</p>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Amparo. Cuidando de quem cuida.
            </footer>
        </div>
    );
};
