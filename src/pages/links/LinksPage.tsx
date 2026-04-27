import { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Users, Plus, Heart, Shield, Briefcase, Building2,
  Loader2, Link as LinkIcon, Search, Calendar, X,
  CheckCircle2, Clock, Check, UserX, MessageSquare, Unlink,
} from "lucide-react";

import {
  useLinks, useCreateLink, useRespondLink, useEndLink,
  type Link as LinkType, type RespondLinkPayload,
} from "@/hooks/useLinks";
import { useSearch } from "@/hooks/useSearch";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveApiError } from "@/utils/apiError";
import { formatRelativeTime } from "@/utils/formatDate";
import type { SearchUser } from "@/types";

// ─── Config maps ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LinkType["status"], {
  label: string; className: string; icon: React.ElementType;
}> = {
  PENDING:   { label: "Pendente", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
  ACTIVE:    { label: "Ativo",    className: "bg-green-50 text-green-700 border border-green-200", icon: CheckCircle2 },
  ENDED:     { label: "Ativo",    className: "bg-green-50 text-green-700 border border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Pendente", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
};

const LINK_TYPE_CONFIG: Record<LinkType["link_type"], {
  label: string; Icon: React.ElementType; avatarClass: string;
}> = {
  caregiver:    { label: "Cuidador",     Icon: Heart,     avatarClass: "bg-primary-light text-primary" },
  guardian:     { label: "Responsável",  Icon: Shield,    avatarClass: "bg-blue-50 text-blue-600" },
  professional: { label: "Profissional", Icon: Briefcase, avatarClass: "bg-purple-50 text-purple-600" },
  institution:  { label: "Instituição",  Icon: Building2, avatarClass: "bg-orange-50 text-orange-600" },
};

const ROLE_TO_LINK_TYPE: Record<string, LinkType["link_type"]> = {
  CAREGIVER:    "caregiver",
  GUARDIAN:     "guardian",
  PROFESSIONAL: "professional",
  INSTITUTION:  "institution",
};

type FilterTab = "ALL" | "ACTIVE" | "PENDING";

const FILTER_TABS: { key: FilterTab; label: string; icon: React.ElementType }[] = [
  { key: "ALL",     label: "Todos",     icon: Users },
  { key: "ACTIVE",  label: "Ativos",    icon: CheckCircle2 },
  { key: "PENDING", label: "Pendentes", icon: Clock },
];

// ─── Zod schema ──────────────────────────────────────────────────────────────

const createLinkSchema = z.object({
  notes: z.string().max(300).optional(),
});

type CreateLinkForm = z.infer<typeof createLinkSchema>;

// ─── Page ────────────────────────────────────────────────────────────────────

export const LinksPage = () => {
  const { data: links = [], isLoading } = useLinks();
  const { mutate: createLink, isPending: isCreating } = useCreateLink();
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter]         = useState<FilterTab>("ALL");
  const visibleLinks = useMemo(
    () => links.filter((l) => l.status !== "ENDED" && l.status !== "CANCELLED"),
    [links]
  );
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [selectedElder, setSelectedElder] = useState<SearchUser | null>(null);

  const userLinkType = user?.role ? ROLE_TO_LINK_TYPE[user.role] : undefined;
  const isElder      = user?.role === "ELDER";
  const canCreate    = !!userLinkType;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLinkForm>({
    resolver: zodResolver(createLinkSchema),
  });

  const filtered = useMemo(() => {
    return visibleLinks
      .filter((l) => filter === "ALL" || l.status === filter)
      .filter((l) =>
        !search.trim() ||
        l.other_party_name.toLowerCase().includes(search.toLowerCase())
      );
  }, [visibleLinks, filter, search]);

  const stats = useMemo(() => ({
    total:   visibleLinks.length,
    active:  visibleLinks.filter((l) => l.status === "ACTIVE").length,
    pending: visibleLinks.filter((l) => l.status === "PENDING").length,
  }), [visibleLinks]);

  const onSubmit = (data: CreateLinkForm) => {
    if (!userLinkType || !selectedElder) return;
    setFormError(null);
    createLink(
      { link_type: userLinkType, elder: selectedElder.id, notes: data.notes || undefined },
      {
        onSuccess: () => { closeModal(); },
        onError: (err) => setFormError(resolveApiError(err, "Erro ao solicitar vínculo.")),
      }
    );
  };

  const openModal  = () => { setShowModal(true); setFormError(null); reset(); setSelectedElder(null); };
  const closeModal = () => { setShowModal(false); setFormError(null); reset(); setSelectedElder(null); };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-primary/25 to-primary/5" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4 w-16 h-16 rounded-2xl bg-white shadow-md border border-border/40 flex items-center justify-center flex-shrink-0">
            <LinkIcon size={28} className="text-primary" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-text leading-tight">Meus Vínculos</h1>
              <p className="text-sm text-text/50 font-medium mt-0.5">Gerencie suas conexões de cuidado</p>
            </div>
            <div className="flex items-center gap-6 pb-0.5">
              <Stat label="Total"    value={stats.total} />
              <div className="w-px h-8 bg-border" />
              <Stat label="Ativos"   value={stats.active}  highlight="text-green-600" />
              <div className="w-px h-8 bg-border" />
              <Stat label="Pendentes" value={stats.pending} highlight="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/35 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border bg-white text-sm text-text/80 placeholder:text-text/35 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
        {canCreate && (
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm shadow-primary/20 flex-shrink-0"
          >
            <Plus size={16} />
            Novo Vínculo
          </button>
        )}
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key !== "ALL" ? visibleLinks.filter((l) => l.status === tab.key).length : 0;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-border text-text/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {count > 0 && (
                <span className={`ml-0.5 ${filter === tab.key ? "opacity-70" : "text-text/40"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasLinks={visibleLinks.length > 0} canCreate={canCreate} onNew={openModal} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((link) => (
            <LinkCard key={link.id} link={link} isElder={isElder} />
          ))}
        </div>
      )}

      {/* ── Create modal ──────────────────────────────────────────────── */}
      {showModal && (
        <Modal onClose={closeModal}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <LinkIcon size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Solicitar novo vínculo</h2>
              <p className="text-xs text-text/50 font-medium">Busque o idoso pelo nome</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ElderPicker selected={selectedElder} onSelect={setSelectedElder} />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text/50 uppercase tracking-wide">
                Observações <span className="normal-case font-normal">(opcional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Alguma informação adicional..."
                {...register("notes")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-text font-medium placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                {formError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-text/60 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !selectedElder}
                className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 size={15} className="animate-spin" />}
                {isCreating ? "Enviando..." : "Solicitar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── ElderPicker ─────────────────────────────────────────────────────────────

const ElderPicker = ({
  selected,
  onSelect,
}: {
  selected: SearchUser | null;
  onSelect: (u: SearchUser | null) => void;
}) => {
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const containerRef        = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useSearch(
    { q: query, role: "ELDER" },
    query.trim().length >= 2
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-primary/40 bg-primary-light/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
            {selected.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text truncate">{selected.full_name}</p>
            {(selected.city || selected.state) && (
              <p className="text-xs text-text/50">{[selected.city, selected.state].filter(Boolean).join(", ")}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => { onSelect(null); setQuery(""); }}
          className="p-1 rounded-lg text-text/40 hover:text-text/70 hover:bg-white/60 transition-colors flex-shrink-0"
          aria-label="Remover seleção"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <label className="text-xs font-bold text-text/50 uppercase tracking-wide">
        Idoso <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/35 pointer-events-none" />
        <input
          type="text"
          value={query}
          placeholder="Buscar por nome..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-sm text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {isFetching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary/50" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-border shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {isFetching ? (
            <div className="flex items-center justify-center py-6 text-text/40">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-sm">Buscando...</span>
            </div>
          ) : !data?.results.length ? (
            <div className="flex flex-col items-center py-6 gap-2 text-text/40">
              <UserX size={20} />
              <span className="text-sm">Nenhum idoso encontrado</span>
            </div>
          ) : (
            data.results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onSelect(u); setOpen(false); setQuery(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                  {u.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{u.full_name}</p>
                  {(u.city || u.state) && (
                    <p className="text-xs text-text/45">{[u.city, u.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-text/40">Digite ao menos 2 caracteres</p>
      )}
    </div>
  );
};

// ─── LinkCard ─────────────────────────────────────────────────────────────────

const LinkCard = ({ link, isElder }: { link: LinkType; isElder: boolean }) => {
  const typeConfig   = LINK_TYPE_CONFIG[link.link_type];
  const statusConfig = STATUS_CONFIG[link.status];
  const StatusIcon   = statusConfig.icon;
  const TypeIcon     = typeConfig.Icon;
  const { mutate: respond, isPending: isResponding } = useRespondLink();
  const { mutate: endLink, isPending: isEnding } = useEndLink();
  const [respondError, setRespondError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd]     = useState(false);

  const initials = link.other_party_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handleRespond = (action: "approve" | "reject") => {
    setRespondError(null);
    respond(
      { link_type: link.link_type, link_id: link.id, action },
      { onError: (err) => setRespondError(resolveApiError(err, "Erro ao responder vínculo.")) }
    );
  };

  const handleEnd = () => {
    endLink(
      { link_type: link.link_type, link_id: link.id },
      { onError: (err) => setRespondError(resolveApiError(err, "Erro ao encerrar vínculo.")) }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/20 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${typeConfig.avatarClass}`}>
            {initials || <TypeIcon size={18} />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[15px] text-text leading-tight truncate">
              {link.other_party_name}
            </p>
            <p className="text-xs text-text/50 font-medium mt-0.5">{link.other_party_role}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${statusConfig.className}`}>
          <StatusIcon size={10} />
          {statusConfig.label}
        </span>
      </div>

      {/* Bio / summary */}
      {link.other_party_bio && (
        <p className="text-xs text-text/60 leading-relaxed bg-gray-50 rounded-xl px-3 py-2 border border-border/40">
          {link.other_party_bio}
        </p>
      )}

      {/* Role-specific detail chips */}
      {link.other_party_extra && link.other_party_extra.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {link.other_party_extra.map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${typeConfig.avatarClass} border-current/10`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes from requestor — shown to ELDER on PENDING links */}
      {isElder && link.status === "PENDING" && link.notes && (
        <div className="flex gap-2 items-start bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2">
          <MessageSquare size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">{link.notes}</p>
        </div>
      )}

      {/* Respond actions — only for ELDER on PENDING links */}
      {isElder && link.status === "PENDING" && (
        <div className="space-y-2">
          {respondError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              {respondError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond("approve")}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {isResponding ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Aceitar
            </button>
            <button
              onClick={() => handleRespond("reject")}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isResponding ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              Recusar
            </button>
          </div>
        </div>
      )}

      {/* End active link */}
      {link.status === "ACTIVE" && (
        <div className="space-y-1.5">
          {respondError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              {respondError}
            </p>
          )}
          {confirmEnd ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 h-9 rounded-xl border border-border text-xs font-semibold text-text/60 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnd}
                disabled={isEnding}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {isEnding ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                Confirmar encerramento
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmEnd(true)}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-semibold text-text/40 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <Unlink size={12} />
              Encerrar vínculo
            </button>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${typeConfig.avatarClass}`}>
          <TypeIcon size={11} />
          {typeConfig.label}
        </span>
        <div className="flex items-center gap-1 text-text/35">
          <Calendar size={11} />
          <span className="text-[11px] font-medium">{formatRelativeTime(link.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Stat ─────────────────────────────────────────────────────────────────────

const Stat = ({ label, value, highlight }: { label: string; value: number; highlight?: string }) => (
  <div className="text-center">
    <p className={`text-xl font-bold leading-none ${highlight ?? "text-text"}`}>{value}</p>
    <p className="text-[11px] text-text/45 font-medium mt-0.5">{label}</p>
  </div>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────

const EmptyState = ({
  hasLinks, canCreate, onNew,
}: { hasLinks: boolean; canCreate: boolean; onNew: () => void }) => (
  <div className="bg-white rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary-light/60 flex items-center justify-center">
      <LinkIcon size={30} className="text-primary/60" />
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-text text-lg">
        {hasLinks ? "Nenhum resultado encontrado" : "Nenhum vínculo ainda"}
      </h3>
      <p className="text-sm text-text/50 font-medium max-w-xs">
        {hasLinks
          ? "Tente ajustar os filtros ou a busca."
          : "Conecte-se a um idoso para começar a acompanhar seu cuidado."}
      </p>
    </div>
    {!hasLinks && canCreate && (
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity mt-2"
      >
        <Plus size={16} />
        Solicitar primeiro vínculo
      </button>
    )}
  </div>
);

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 animate-pulse">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between">
          <div className="h-6 w-24 bg-gray-100 rounded-lg" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-text/40 hover:text-text/70 hover:bg-gray-100 transition-colors"
      >
        <X size={16} />
      </button>
      {children}
    </div>
  </div>
);
