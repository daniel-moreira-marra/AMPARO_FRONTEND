import { UserPlus, Star, Heart } from "lucide-react";

export const RightSidebar = () => {
  return (
    <div className="space-y-4">
      {/* Sugestões de Especialistas */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <h4 className="font-bold text-text text-sm mb-4">Sugestões para você</h4>
        <div className="space-y-5">
          <SuggestionItem name="Dra. Helena Souza" role="Geriatra" rating="4.9" />
          <SuggestionItem name="Ricardo Gomes" role="Cuidador" rating="4.8" />
        </div>
        <button className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary-light rounded-lg transition-colors">
          Ver todos
        </button>
      </div>

      {/* Card de Apoio/Comunidade */}
      <div className="p-5 rounded-3xl bg-warm/10 border border-warm/20 relative overflow-hidden">
        <Heart className="absolute -right-2 -bottom-2 w-12 h-12 text-warm/20 rotate-12" />
        <h5 className="font-bold text-warm text-sm leading-tight">Comunidade Amparo</h5>
        <p className="mt-2 text-xs text-text/70 leading-relaxed font-medium">
          Participe dos grupos de apoio e troque experiências com outros cuidadores.
        </p>
      </div>
    </div>
  );
};

const SuggestionItem = ({ name, role, rating }: { name: string, role: string, rating: string }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-text/40 font-bold text-xs border border-border">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-xs font-bold text-text group-hover:text-primary transition-colors">{name}</p>
        <div className="flex items-center gap-1 text-[10px] text-text/40 font-medium">
           <Star size={10} className="fill-warm text-warm border-none" /> {rating} • {role}
        </div>
      </div>
    </div>
    <button className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors">
      <UserPlus size={16} />
    </button>
  </div>
);