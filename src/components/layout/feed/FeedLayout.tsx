import { FeedHeader } from "./FeedHeader";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

interface FeedLayoutProps {
  children: React.ReactNode;
}

export const FeedLayout = ({ children }: FeedLayoutProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. COLUNA ESQUERDA (Perfil/Menu) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24">
            <LeftSidebar />
          </div>
        </aside>

        {/* 2. COLUNA CENTRAL (Onde a mágica acontece) */}
        <section className="col-span-1 lg:col-span-9 xl:col-span-6 space-y-6">
          {/* O Header de Filtros e Busca agora é parte integrante do Layout */}
          <FeedHeader />
          
          {/* Aqui entram o CreatePostWidget e a Lista de Posts */}
          <div className="space-y-6">
            {children}
          </div>
        </section>

        {/* 3. COLUNA DIREITA (Sugestões/Dicas) */}
        <aside className="hidden xl:block xl:col-span-3">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </aside>

      </div>
    </div>
  );
};