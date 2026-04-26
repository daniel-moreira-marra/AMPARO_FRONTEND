# Atualizações — Branch `attGabrielCarrijo`

Resumo de todas as alterações feitas no frontend em relação à branch `main`.

---

## Infraestrutura e Roteamento

### `src/App.tsx`
- Adicionou rotas `/search`, `/signup-success`, `/onboarding` e `/profile/:userId`
- Aplicou guards em camadas: `PublicOnlyRoute` → `VerifiedRoute` → `OnboardedRoute`

### Rotas (`src/routes/`)
- **`VerifiedRoute.tsx`** — criado: redireciona para `/login` se não autenticado, para `/signup-success` se não verificado
- **`OnboardedRoute.tsx`** — criado: bloqueia acesso ao app enquanto onboarding não estiver completo
- **`UnverifiedOnlyRoute.tsx`** — criado: impede usuário já verificado de acessar `/signup-success`
- **`PublicOnlyRoute.tsx`** — criado: redireciona usuário logado que tenta acessar `/login` ou `/signup`

---

## Constantes e Utilitários

### `src/constants/roles.ts` — NOVO
- Exporta `ROLE_LABELS` (mapa de papel → label em PT-BR)
- Exporta `ROLE_OPTIONS` para uso em selects
- Exporta `ROLE_STYLES` com paleta de cores por papel (cor, fundo claro, texto acessível)
- Exporta `getRoleStyle(role)` com fallback seguro


### `src/utils/masks.ts` — NOVO
- `maskPhone(value)`: formata telefone brasileiro com DDD
- `maskCEP(value)`: formata CEP no padrão `00000-000`
- `maskCNPJ(value)`: formata CNPJ no padrão `00.000.000/0000-00`
- Exporta `CEP_REGEX` para validação no Zod

### `src/utils/formatDate.ts` — NOVO
- `formatRelativeTime(dateStr)`: formata data relativa em PT-BR ("há 2 horas", "há 3 dias")

### `src/utils/viaCep.ts` — NOVO
- `fetchAddressByCEP(cep)`: busca endereço na API ViaCEP e retorna campos formatados

---

## Tipagem (`src/types/index.ts`)
- Adicionou `UserRole` como union type
- Expandiu `User` com: `avatar`, `is_verified`, `onboarding_completed`, `role` (obrigatório), campos de endereço e privacidade
- Adicionou interfaces completas para perfis por papel: `ElderProfile`, `CaregiverProfile`, `GuardianProfile`, `ProfessionalProfile`, `InstitutionProfile`
- Expandiu `Post` com: `images[]`, `image_alt_text`, `tags[]`, `shared_post`, `author.role`, `author.avatar`
- Adicionou `SharedPost`, `Comment`, `SearchUser`, `SearchFilters`
- Adicionou `ApiResponse<T>`, `Notification`, `NotificationsResponse`
- Corrigiu `AuthResponse` para refletir estrutura real da API (sem envelope `{ success, data }`)

---

## Hooks de Dados

### `src/hooks/useFeed.ts`
- Corrigiu bug crítico: `author.id` era mapeado para `post.id` — agora usa `post.author_id`
- Removeu hardcode `liked_by_me: false` — usa valor real da API
- Adicionou suporte a múltiplas imagens (`images[]`) e post compartilhado (`shared_post`)
- Adicionou `staleTime: 30_000`
- Adicionou suporte a filtros (`FeedFilters`: q, role, tag) na query key e nos params
- `useCreatePost` agora aceita múltiplas imagens e tags; usa endpoint correto

### `src/hooks/useNotifications.ts` — NOVO
- `useNotifications()`: busca notificações com refetch automático a cada 30s, staleTime 15s
- `useMarkNotificationRead(id)`: marca uma notificação como lida
- `useMarkAllNotificationsRead()`: marca todas como lidas

---

## Páginas

### `src/pages/LandingPage.tsx`
- Refatorada para compor seções independentes: `StatsBar`, `Features`, `ForWho`, `HowItWorks`, `Testimonials`, `CTASection`


### `src/pages/onboarding/OnboardingPage.tsx` — NOVO
- Formulário multi-step por papel (ELDER, CAREGIVER, GUARDIAN, PROFESSIONAL, INSTITUTION)
- Validação Zod por etapa
- Submissão via `useOnboarding()`

### `src/pages/feed/FeedPage.tsx`
- Usa `FeedLayout` com sidebars
- Suporta filtros passados pelo `FeedHeader`

### `src/pages/links/LinksPage.tsx`
- Reescrita completa:
  - Tabs: Todos / Ativos / Pendentes (removidos ENDED e CANCELLED)
  - Links ENDED e CANCELLED filtrados da lista
  - Cards com bio, chips de informações extras (experiência, localização, especialidade, etc.)
  - Notas do solicitante visíveis para o idoso em vínculos pendentes
  - Botão "Encerrar vínculo" com confirmação em dois passos
  - Responder solicitação (aceitar/rejeitar) para o idoso
  - Feedback de loading em todas as ações

### `src/pages/profile/ProfilePage.tsx`
- Usada para perfil próprio e de outros usuários (via `/profile/:userId`)
- Sidebar de vínculos filtra apenas ACTIVE e PENDING
- Avatar usa `user.avatar` em vez de string vazia
- Usa `ROLE_LABELS` para tradução de papel

### `src/pages/profile/PublicProfilePage.tsx`
- Estados de botão de vínculo: sem vínculo / pendente / ativo
- Modal de prontuário para usuários com vínculo ativo

### `src/pages/search/SearchPage.tsx` — NOVO
- Busca por papel com tabs (Todos, Cuidadores, Profissionais, etc.)
- Cards de resultado com informações específicas por papel
- Integrado com `useSearch` e `useCreateLink`

---

## Componentes de Layout



## Componentes de Feed

### `src/components/feed/FeedItem.tsx`
- Usa `ROLE_LABELS` para papel do autor
- Renderiza `post.tags` reais (não hardcoded)
- Renderiza `post.images[]` (múltiplas imagens)
- Renderiza post compartilhado (`shared_post`)
- `aria-label` nos botões de ação

### `src/components/feed/CreatePostWidget.tsx`
- Suporte a múltiplas imagens com preview
- `URL.revokeObjectURL()` no cleanup (evita memory leak)
- Validação de tipo e tamanho de arquivo
- Campo de tags

### `src/components/feed/CommentSection.tsx` — NOVO
- Lista de comentários de um post
- Criar, editar e deletar comentários

---


## Componentes de Perfil

### `src/components/profile/RoleProfileSection.tsx`
- Exibe campos específicos por papel com labels corretas
- Usa `ROLE_LABELS`

---

## Outros

### `index.html`
- `lang` alterado de `en` para `pt-BR`
- Título atualizado: `Amparo — Cuidar de quem importa, juntos`

### `src/index.css`
- Refinamentos de variáveis CSS e tipografia

### `tailwind.config.js`
- Ajustes de paleta e animações customizadas

### Arquivos removidos / limpos
- `src/App.css`: arquivo de estilos legados do template Vite removido (não era importado em lugar algum)
