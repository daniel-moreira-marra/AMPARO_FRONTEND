import { Search, SlidersHorizontal } from "lucide-react";

export const FeedHeader = () => {
  const categories = ["Todos", "Cuidadores", "Especialistas", "Dicas", "Urgente"];

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm space-y-4">
      {/* 1. BARRA DE BUSCA INTERNA DO FEED */}
      <div className="relative group">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors" 
          size={18} 
        />
        <input 
          type="text" 
          placeholder="Pesquisar no seu feed..." 
          className="w-full h-11 pl-10 pr-4 bg-[#F3F4F6] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
        />
      </div>

      {/* 2. FILTROS DE CATEGORIA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex-shrink-0 p-2 bg-primary-light text-primary rounded-lg mr-1 cursor-pointer hover:bg-primary/20 transition-colors">
          <SlidersHorizontal size={16} />
        </div>
        
        {categories.map((category, index) => (
          <button
            key={category}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              index === 0 
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                : "bg-white text-text/60 border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};