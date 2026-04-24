# AMPARO — Documentação da API

Plataforma de rede de cuidados voltada para idosos, cuidadores, responsáveis legais, profissionais de saúde e instituições. Desenvolvida com **Django REST Framework** e autenticação via **JWT**.

---

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Padrão de Resposta](#padrão-de-resposta)
- [Enums e Tipos](#enums-e-tipos)
- [Autenticação e Conta](#autenticação-e-conta)
- [Perfil do Idoso](#perfil-do-idoso-elder)
- [Perfil do Cuidador](#perfil-do-cuidador-caregiver)
- [Perfil do Responsável](#perfil-do-responsável-guardian)
- [Perfil do Profissional de Saúde](#perfil-do-profissional-de-saúde-professional)
- [Perfil da Instituição](#perfil-da-instituição-institution)
- [Postagens](#postagens-posts)
- [Feed](#feed)
- [Likes](#likes)
- [Comentários](#comentários)
- [Vínculos](#vínculos-links)
- [Busca](#busca)
- [Health Check](#health-check)
- [Tabela de Permissões](#tabela-de-permissões)

---

## Visão Geral

**Base URL:** `http://localhost:8000/api/v1/`

**Autenticação:** JWT Bearer Token (`Authorization: Bearer <access_token>`)

**Documentação interativa (dev):**
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI Schema: `/api/schema/`

---

## Autenticação

Todos os endpoints (exceto os marcados como **público**) exigem o header:

```
Authorization: Bearer <access_token>
```

O token é obtido via `POST /api/v1/auth/token/` e renovado via `POST /api/v1/auth/token/refresh/`.

---

## Padrão de Resposta

A maioria dos endpoints retorna respostas no formato abaixo. Exceções são indicadas em cada endpoint.

### Sucesso

```json
{
  "success": true,
  "data": { ... }
}
```

### Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação nos dados enviados.",
    "details": { ... }
  },
  "request_id": "uuid-do-request"
}
```

> **Atenção:** Alguns endpoints retornam a estrutura DRF padrão sem o wrapper `{success, data}` — detalhado em cada seção.

---

## Enums e Tipos

### `role` (tipo de usuário)
| Valor | Descrição |
|-------|-----------|
| `ELDER` | Idoso |
| `GUARDIAN` | Responsável |
| `CAREGIVER` | Cuidador |
| `INSTITUTION` | Instituição |
| `PROFESSIONAL` | Profissional de saúde |

### `gender` (ElderProfile)
| Valor | Descrição |
|-------|-----------|
| `MALE` | Masculino |
| `FEMALE` | Feminino |
| `OTHER` | Outro |
| `NOT_INFORMED` | Não informado |

### `mobility_level` (ElderProfile)
| Valor | Descrição |
|-------|-----------|
| `INDEPENDENT` | Independente |
| `NEEDS_ASSISTANCE` | Necessita de assistência |
| `WHEELCHAIR` | Cadeirante |
| `BEDRIDDEN` | Acamado |

### `cognitive_status` (ElderProfile)
| Valor | Descrição |
|-------|-----------|
| `LUCID` | Lúcido |
| `MILD_IMPAIRMENT` | Comprometimento leve |
| `DEMENTIA` | Demência |
| `NOT_INFORMED` | Não informado |

### `care_types` (CaregiverProfile)
| Valor | Descrição |
|-------|-----------|
| `HOME` | Cuidado domiciliar |
| `HOSPITAL` | Acompanhamento hospitalar |
| `NIGHT_SHIFT` | Plantão noturno |
| `DAY_SHIFT` | Plantão diurno |
| `COMPANION` | Companhia |

### `profession` (ProfessionalProfile)
| Valor | Descrição |
|-------|-----------|
| `PHYSIOTHERAPIST` | Fisioterapeuta |
| `SPEECH_THERAPIST` | Fonoaudiólogo |
| `OCCUPATIONAL_THERAPIST` | Terapeuta ocupacional |
| `PSYCHOLOGIST` | Psicólogo |
| `NUTRITIONIST` | Nutricionista |
| `OTHER` | Outro |

### `service_mode` (ProfessionalProfile / ProfessionalElderLink)
| Valor | Descrição |
|-------|-----------|
| `HOME` | Domiciliar |
| `CLINIC` | Clínica |
| `ONLINE` | Online |
| `OTHER` | Outro |

### `relationship` (GuardianProfile / GuardianElderLink)
| Valor | Descrição |
|-------|-----------|
| `CHILD` | Filho(a) |
| `SPOUSE` | Cônjuge |
| `SIBLING` | Irmão/Irmã |
| `RELATIVE` | Parente |
| `LEGAL_GUARDIAN` | Responsável legal |
| `OTHER` | Outro |

### `institution_type` (InstitutionProfile)
| Valor | Descrição |
|-------|-----------|
| `ILPI` | ILPI |
| `SHELTER` | Abrigo |
| `CLINIC` | Clínica |
| `HOSPITAL` | Hospital |
| `OTHER` | Outro |

### `status` (Vínculos)
| Tipo de vínculo | Valores possíveis |
|-----------------|-------------------|
| CaregiverElderLink | `PENDING`, `ACTIVE`, `ENDED`, `CANCELLED` |
| GuardianElderLink | `PENDING`, `ACTIVE`, `CANCELLED` |
| ProfessionalElderLink | `PENDING`, `ACTIVE`, `ENDED`, `CANCELLED` |
| InstitutionElderLink | `PENDING`, `ACTIVE`, `DISCHARGED`, `TRANSFERRED`, `CANCELLED`, `OTHER` |

### `status` (Post)
| Valor | Descrição |
|-------|-----------|
| `DRAFT` | Rascunho |
| `PUBLISHED` | Publicado |
| `ARCHIVED` | Arquivado |
| `BLOCKED` | Bloqueado |
| `DELETED` | Deletado |

### `visibility_scope` (Post)
| Valor | Descrição |
|-------|-----------|
| `PUBLIC` | Visível para todos |
| `CAREGIVERS` | Apenas cuidadores |
| `ELDERS` | Apenas idosos |
| `INSTITUTIONS` | Apenas instituições |
| `PROFESSIONALS` | Apenas profissionais |
| `GUARDIANS` | Apenas responsáveis |
| `PRIVATE` | Privado |

---

## Autenticação e Conta

### `POST /api/v1/auth/token/` — Login
**Acesso:** Público

**Request:**
```json
{
  "email": "string (obrigatório)",
  "password": "string (obrigatório)"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "access": "string (JWT access token)",
    "refresh": "string (JWT refresh token)"
  }
}
```

**Erros:** `400` credenciais inválidas ou usuário inativo.

---

### `POST /api/v1/auth/token/refresh/` — Renovar Token
**Acesso:** Público

**Request:**
```json
{
  "refresh": "string (obrigatório)"
}
```

**Response `200`:**
```json
{
  "access": "string (novo JWT access token)"
}
```

> Resposta sem wrapper `{success, data}` — formato padrão SimpleJWT.

**Erros:** `401` token refresh inválido ou expirado.

---

### `POST /api/v1/auth/signup/` — Cadastro
**Acesso:** Público

**Request:**
```json
{
  "email": "string (único, obrigatório)",
  "password": "string (obrigatório)",
  "full_name": "string (máx 150, obrigatório)",
  "role": "string (ELDER | CAREGIVER | GUARDIAN | PROFESSIONAL | INSTITUTION, obrigatório)",
  "phone": "string (máx 40, opcional)",
  "address_line": "string (máx 255, opcional — obrigatório para INSTITUTION)",
  "city": "string (máx 120, opcional — obrigatório para INSTITUTION)",
  "state": "string (máx 10, opcional — obrigatório para INSTITUTION)",
  "zip_code": "string (máx 20, opcional)"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "address_line": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string"
  }
}
```

**Erros:** `400` email duplicado, senha fraca, campos obrigatórios ausentes.

---

### `GET /api/v1/auth/me/` — Dados do Usuário Autenticado
**Acesso:** Autenticado

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "avatar": "string (URL) | null",
    "role": "string",
    "is_verified": true,
    "address_line": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string"
  }
}
```

---

### `PATCH /api/v1/auth/me/` — Atualizar Usuário Autenticado
**Acesso:** Autenticado  
**Content-Type:** `application/json` ou `multipart/form-data` (quando enviando avatar)

**Request (todos opcionais):**
```json
{
  "full_name": "string",
  "phone": "string",
  "address_line": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "avatar": "file (imagem JPEG/PNG/WebP)"
}
```

**Response `200`:** Mesma estrutura do `GET /auth/me/`.

---

### `POST /api/v1/auth/password/change/` — Alterar Senha
**Acesso:** Autenticado

**Request:**
```json
{
  "old_password": "string (obrigatório)",
  "new_password": "string (obrigatório)"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully."
}
```

**Erros:** `400` senha antiga incorreta ou nova senha inválida.

---

## Perfil do Idoso (ELDER)

### `GET /api/v1/elders/me/` — Obter Perfil
**Acesso:** Autenticado · role `ELDER`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "preferred_name": "string",
    "birth_date": "YYYY-MM-DD",
    "gender": "MALE | FEMALE | OTHER | NOT_INFORMED",
    "mobility_level": "INDEPENDENT | NEEDS_ASSISTANCE | WHEELCHAIR | BEDRIDDEN",
    "cognitive_status": "LUCID | MILD_IMPAIRMENT | DEMENTIA | NOT_INFORMED",
    "has_fall_risk": false,
    "needs_medication_support": false,
    "requires_24h_care": false,
    "medical_conditions": "string",
    "allergies": "string",
    "medications": "string",
    "medical_notes": "string",
    "emergency_contact_name": "string",
    "emergency_contact_phone": "string",
    "emergency_contact_relationship": "string",
    "is_active": true
  }
}
```

---

### `PATCH /api/v1/elders/me/` — Atualizar Perfil (Parcial)
**Acesso:** Autenticado · role `ELDER`

**Request (todos opcionais):** Qualquer campo do GET acima.

**Response `200`:** Mesma estrutura do GET.

---

### `PUT /api/v1/elders/me/` — Atualizar Perfil (Completo)
**Acesso:** Autenticado · role `ELDER`

**Request:** Todos os campos do GET (tratados como obrigatórios).

**Response `200`:** Mesma estrutura do GET.

---

## Perfil do Cuidador (CAREGIVER)

### `GET /api/v1/caregivers/me/` — Obter Perfil
**Acesso:** Autenticado · role `CAREGIVER`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "bio": "string",
    "experience_years": 5,
    "is_available": true,
    "city": "string",
    "state": "string",
    "care_types": ["HOME", "NIGHT_SHIFT"]
  }
}
```

---

### `PATCH /api/v1/caregivers/me/` — Atualizar Perfil (Parcial)
**Acesso:** Autenticado · role `CAREGIVER`

**Request (todos opcionais):**
```json
{
  "bio": "string",
  "experience_years": 5,
  "is_available": true,
  "city": "string",
  "state": "string",
  "care_types_input": ["HOME", "NIGHT_SHIFT"]
}
```

> `care_types_input` é write-only e substitui completamente o conjunto anterior. `care_types` é read-only no response.

**Response `200`:** Mesma estrutura do GET.

---

### `PUT /api/v1/caregivers/me/` — Atualizar Perfil (Completo)
**Acesso:** Autenticado · role `CAREGIVER`

**Request:** Todos os campos do PATCH.

**Response `200`:** Mesma estrutura do GET.

---

## Perfil do Responsável (GUARDIAN)

### `GET /api/v1/guardians/me/` — Obter Perfil
**Acesso:** Autenticado · role `GUARDIAN`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "relationship": "CHILD | SPOUSE | SIBLING | RELATIVE | LEGAL_GUARDIAN | OTHER",
    "is_legal_guardian": false,
    "preferred_contact": "string"
  }
}
```

---

### `PATCH /api/v1/guardians/me/` — Atualizar Perfil (Parcial)
**Acesso:** Autenticado · role `GUARDIAN`

**Request (todos opcionais):** Qualquer campo do GET.

**Response `200`:** Mesma estrutura do GET.

---

### `PUT /api/v1/guardians/me/` — Atualizar Perfil (Completo)
**Acesso:** Autenticado · role `GUARDIAN`

**Request:** Todos os campos do GET.

**Response `200`:** Mesma estrutura do GET.

---

## Perfil do Profissional de Saúde (PROFESSIONAL)

### `GET /api/v1/professionals/me/` — Obter Perfil
**Acesso:** Autenticado · role `PROFESSIONAL`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "profession": "PHYSIOTHERAPIST | SPEECH_THERAPIST | OCCUPATIONAL_THERAPIST | PSYCHOLOGIST | NUTRITIONIST | OTHER",
    "council": "string (ex: CREFITO, CRP)",
    "license_number": "string",
    "bio": "string",
    "service_mode": "HOME | CLINIC | ONLINE | OTHER",
    "hourly_rate": "100.00",
    "is_available": true,
    "registration_verified": false,
    "city": "string",
    "state": "string"
  }
}
```

> `registration_verified` é read-only (gerenciado internamente).

---

### `PATCH /api/v1/professionals/me/` — Atualizar Perfil (Parcial)
**Acesso:** Autenticado · role `PROFESSIONAL`

**Request (todos opcionais, `registration_verified` ignorado):**
```json
{
  "profession": "string",
  "council": "string",
  "license_number": "string",
  "bio": "string",
  "service_mode": "string",
  "hourly_rate": "decimal",
  "is_available": true,
  "city": "string",
  "state": "string"
}
```

**Response `200`:** Mesma estrutura do GET.

---

### `PUT /api/v1/professionals/me/` — Atualizar Perfil (Completo)
**Acesso:** Autenticado · role `PROFESSIONAL`

**Request:** Todos os campos do PATCH.

**Response `200`:** Mesma estrutura do GET.

---

## Perfil da Instituição (INSTITUTION)

### `GET /api/v1/institutions/me/` — Obter Perfil
**Acesso:** Autenticado · role `INSTITUTION`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "legal_name": "string (razão social)",
    "trade_name": "string (nome fantasia)",
    "cnpj": "string (apenas números)",
    "institution_type": "ILPI | SHELTER | CLINIC | HOSPITAL | OTHER",
    "capacity": 50,
    "website": "string (URL)",
    "license_number": "string",
    "is_verified": false
  }
}
```

> `is_verified` é read-only.

---

### `PATCH /api/v1/institutions/me/` — Atualizar Perfil (Parcial)
**Acesso:** Autenticado · role `INSTITUTION`

**Request (todos opcionais, `is_verified` ignorado):**
```json
{
  "legal_name": "string",
  "trade_name": "string",
  "cnpj": "string",
  "institution_type": "string",
  "capacity": 50,
  "website": "string",
  "license_number": "string"
}
```

**Response `200`:** Mesma estrutura do GET.

---

### `PUT /api/v1/institutions/me/` — Atualizar Perfil (Completo)
**Acesso:** Autenticado · role `INSTITUTION`

**Request:** Todos os campos do PATCH.

**Response `200`:** Mesma estrutura do GET.

---

## Postagens (Posts)

### `GET /api/v1/posts/my-posts/` — Listar Minhas Postagens
**Acesso:** Autenticado

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "string",
      "image": "string (URL) | null",
      "image_alt_text": "string",
      "status": "DRAFT | PUBLISHED | ARCHIVED | BLOCKED | DELETED",
      "visibility_scope": "PUBLIC | CAREGIVERS | ELDERS | INSTITUTIONS | PROFESSIONALS | GUARDIANS | PRIVATE",
      "likes_count": 0,
      "comments_count": 0,
      "created_at": "datetime",
      "updated_at": "datetime",
      "published_at": "datetime | null",
      "edited_at": "datetime | null"
    }
  ]
}
```

> Retorna apenas postagens do usuário autenticado. Exclui soft-deletadas. Ordena por `created_at` decrescente.

---

### `POST /api/v1/posts/my-posts/` — Criar Postagem
**Acesso:** Autenticado  
**Content-Type:** `multipart/form-data` ou `application/json`

**Request:**
```json
{
  "text": "string (obrigatório, não pode estar vazio após trim)",
  "image": "file (opcional)",
  "image_alt_text": "string (opcional)",
  "status": "string (opcional, default: PUBLISHED)",
  "visibility_scope": "string (opcional, default: PUBLIC)",
  "parent_post": "integer (ID de postagem para repost, opcional)"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "text": "string",
    "image": "string | null",
    "image_alt_text": "string",
    "status": "PUBLISHED",
    "visibility_scope": "PUBLIC",
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "datetime",
    "updated_at": "datetime",
    "published_at": "datetime",
    "edited_at": null
  }
}
```

---

### `GET /api/v1/posts/my-posts/{post_id}/` — Obter Postagem por ID
**Acesso:** Autenticado · dono da postagem

**Response `200`:** Mesma estrutura de um item do `GET /my-posts/`.

**Erros:** `403` não é dono · `404` não encontrada.

---

### `PUT /api/v1/posts/my-posts/{post_id}/` — Atualizar Postagem (Completo)
**Acesso:** Autenticado · dono da postagem

**Request:**
```json
{
  "text": "string (obrigatório)",
  "image": "file (opcional)",
  "image_alt_text": "string (opcional)",
  "status": "string (opcional)",
  "visibility_scope": "string (opcional)"
}
```

> Atualiza `edited_at`. Se mudar para `PUBLISHED`, seta `published_at`. `parent_post` não pode ser alterado após criação.

**Response `200`:** Mesma estrutura do GET.

---

### `PATCH /api/v1/posts/my-posts/{post_id}/` — Atualizar Postagem (Parcial)
**Acesso:** Autenticado · dono da postagem

**Request:** Mesma estrutura do PUT (todos os campos opcionais).

**Response `200`:** Mesma estrutura do GET.

---

### `DELETE /api/v1/posts/my-posts/{post_id}/` — Deletar Postagem
**Acesso:** Autenticado · dono da postagem

**Response `200`:**
```json
{
  "success": true,
  "data": null
}
```

> Soft delete via service layer (seta `deleted_at`, não remove do banco).

---

## Feed

### `GET /api/v1/posts/feed/` — Feed de Postagens
**Acesso:** Público

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `cursor` | string | Cursor de paginação (próxima página) |

**Response `200`:**
```json
{
  "next": "string (URL com cursor) | null",
  "previous": "string (URL com cursor) | null",
  "results": [
    {
      "id": 1,
      "author_id": 1,
      "author_name": "string",
      "author_role": "ELDER | CAREGIVER | GUARDIAN | PROFESSIONAL | INSTITUTION",
      "author_avatar": "string (URL) | null",
      "text": "string",
      "image": "string (URL) | null",
      "image_alt_text": "string",
      "likes_count": 0,
      "comments_count": 0,
      "liked_by_me": false,
      "shared_post": {
        "id": 1,
        "author_name": "string",
        "author_role": "string",
        "text": "string",
        "image": "string | null",
        "image_alt_text": "string",
        "created_at": "datetime"
      } ,
      "created_at": "datetime",
      "published_at": "datetime"
    }
  ]
}
```

> Resposta **sem wrapper** `{success, data}` — formato DRF cursor pagination puro.  
> `liked_by_me` é `false` para usuários não autenticados.  
> `shared_post` é `null` quando não é um repost.  
> Resultados cacheados por 60 segundos no servidor.

---

## Likes

### `POST /api/v1/posts/like/{post_id}` — Curtir Postagem
**Acesso:** Autenticado

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "post_id": 1,
    "user_id": 1,
    "likes_count": 5,
    "created_at": "datetime"
  }
}
```

**Erros:** `400` já curtida · `404` postagem não encontrada.

---

### `DELETE /api/v1/posts/unlike/{post_id}` — Descurtir Postagem
**Acesso:** Autenticado

**Response `204`:** Sem corpo.

**Erros:** `404` like ou postagem não encontrado.

---

## Comentários

### `GET /api/v1/posts/comment/{post_id}` — Listar Comentários
**Acesso:** Autenticado

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `cursor` | string | Cursor de paginação |

**Response `200`:**
```json
{
  "next": "string | null",
  "previous": "string | null",
  "results": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 1,
      "content": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

> Resposta **sem wrapper** `{success, data}` — formato DRF cursor pagination puro.

**Erros:** `404` postagem não encontrada.

---

### `POST /api/v1/posts/comment/{post_id}` — Criar Comentário
**Acesso:** Autenticado

**Request:**
```json
{
  "content": "string (obrigatório, máx 500 caracteres, não pode estar vazio após trim)"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "post_id": 1,
    "user": 1,
    "user_id": 1,
    "content": "string",
    "comments_count": 3,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Erros:** `400` conteúdo vazio ou > 500 chars · `404` postagem não encontrada.

---

### `PATCH /api/v1/posts/comment/{post_id}/{comment_id}` — Editar Comentário
**Acesso:** Autenticado · autor do comentário

**Request:**
```json
{
  "content": "string (obrigatório)"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "post_id": 1,
    "user": 1,
    "user_id": 1,
    "content": "string (conteúdo atualizado)",
    "comments_count": 3,
    "created_at": "datetime",
    "updated_at": "datetime (atualizado)"
  }
}
```

**Erros:** `400` conteúdo inválido · `403` não é o autor · `404` não encontrado.

---

### `DELETE /api/v1/posts/comment/{post_id}/{comment_id}` — Deletar Comentário
**Acesso:** Autenticado · autor do comentário

**Response `204`:** Sem corpo.

**Erros:** `403` não é o autor · `404` não encontrado.

---

## Vínculos (Links)

Vínculos representam relações entre idosos e os demais perfis. Todo novo vínculo é criado com status `PENDING` e precisa ser aceito pelo idoso.

### `GET /api/v1/links/` — Listar Meus Vínculos
**Acesso:** Autenticado

**Response `200`:**
```json
[
  {
    "id": 1,
    "status": "PENDING | ACTIVE | ENDED | CANCELLED",
    "link_type": "caregiver | guardian | professional | institution",
    "created_at": "datetime",
    "elder_id": 5,
    "other_party_id": 3,
    "other_party_name": "string",
    "other_party_role": "Cuidador | Responsável | Profissional | Instituição | Idoso"
  }
]
```

> Resposta **sem wrapper** `{success, data}` — array direto.  
> Se o usuário for ELDER: lista vínculos com cuidadores, responsáveis, profissionais e instituições.  
> Se for outro tipo: lista vínculos com idosos.  
> Ordenado por `created_at` decrescente.

---

### `GET /api/v1/links/{user_id}/` — Vínculos de um Usuário Específico
**Acesso:** Autenticado

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `user_id` | integer | ID do usuário |

**Response `200`:** Mesmo formato do `GET /links/`, porém filtrado para status `ACTIVE` e `ENDED` apenas.

**Erros:** `404` usuário não encontrado.

---

### `POST /api/v1/links/` — Criar Vínculo
**Acesso:** Autenticado (usuário deve ter o perfil correspondente ao `link_type`)

**Response `201`:**
```json
{
  "status": "success",
  "message": "Vínculo solicitado com sucesso.",
  "data": {
    "id": 1,
    "status": "PENDING"
  }
}
```

> O vínculo sempre inicia com status `PENDING`.  
> Um usuário não pode criar dois vínculos ativos com o mesmo idoso.

#### Vínculo de Cuidador (`link_type: "caregiver"`)
```json
{
  "link_type": "caregiver",
  "elder": 5,
  "agreed_hourly_rate": "50.00",
  "started_at": "2024-02-01",
  "notes": "string"
}
```
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `link_type` | string | ✅ |
| `elder` | integer (ID do ElderProfile) | ✅ |
| `agreed_hourly_rate` | decimal | ❌ |
| `started_at` | date | ❌ |
| `notes` | string | ❌ |

#### Vínculo de Responsável (`link_type: "guardian"`)
```json
{
  "link_type": "guardian",
  "elder": 5,
  "relationship": "CHILD",
  "is_legal_guardian": true,
  "can_view_medical": true,
  "can_hire": true
}
```
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `link_type` | string | ✅ |
| `elder` | integer | ✅ |
| `relationship` | `CHILD \| SPOUSE \| RELATIVE \| LEGAL_GUARDIAN \| OTHER` | ✅ |
| `is_legal_guardian` | boolean | ❌ |
| `can_view_medical` | boolean | ❌ (default: `true`) |
| `can_hire` | boolean | ❌ (default: `true`) |

#### Vínculo de Profissional (`link_type: "professional"`)
```json
{
  "link_type": "professional",
  "elder": 5,
  "service_mode": "HOME",
  "goals": "Fisioterapia respiratória 3x semana",
  "agreed_hourly_rate": "120.00",
  "started_at": "2024-02-01",
  "notes": "string"
}
```
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `link_type` | string | ✅ |
| `elder` | integer | ✅ |
| `service_mode` | `HOME \| CLINIC \| ONLINE \| OTHER` | ✅ |
| `goals` | string | ❌ |
| `agreed_hourly_rate` | decimal | ❌ |
| `started_at` | date | ❌ |
| `notes` | string | ❌ |

#### Vínculo de Instituição (`link_type: "institution"`)
```json
{
  "link_type": "institution",
  "elder": 5,
  "admitted_at": "2024-01-01",
  "room": "104",
  "bed": "B",
  "notes": "string"
}
```
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `link_type` | string | ✅ |
| `elder` | integer | ✅ |
| `admitted_at` | date | ❌ |
| `room` | string | ❌ |
| `bed` | string | ❌ |
| `notes` | string | ❌ |

**Erros:** `400` usuário sem perfil adequado, vínculo duplicado ativo, `service_mode` ou `relationship` ausente quando obrigatório.

---

### `POST /api/v1/links/respond/` — Responder a um Vínculo
**Acesso:** Autenticado (normalmente o idoso)

**Request:**
```json
{
  "link_type": "caregiver | guardian | professional | institution",
  "link_id": 1,
  "action": "approve | reject"
}
```

**Response `200`:**
```json
{
  "status": "success",
  "message": "Vínculo approve com sucesso.",
  "data": {
    "id": 1,
    "status": "ACTIVE"
  }
}
```

> `action: "approve"` → status vira `ACTIVE`  
> `action: "reject"` → status vira `CANCELLED`

**Erros:** `400` vínculo já respondido · `403` sem permissão · `404` vínculo não encontrado.

---

## Busca

### `GET /api/v1/search/` — Buscar Usuários
**Acesso:** Público

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `role` | string | ❌ | Filtra por tipo: `ELDER`, `GUARDIAN`, `CAREGIVER`, `PROFESSIONAL`, `INSTITUTION` |
| `q` | string | ❌ | Busca textual livre (campo varia por role) |
| `city` | string | ❌ | Filtra por cidade |
| `state` | string | ❌ | Filtra por estado (insensível a maiúsculas) |
| `is_available` | boolean | ❌ | Disponibilidade (CAREGIVER / PROFESSIONAL) |
| `experience_years` | integer | ❌ | Mínimo de anos de experiência (CAREGIVER) |
| `profession` | string | ❌ | Profissão exata (PROFESSIONAL) |
| `service_mode` | string | ❌ | Modo de atendimento (PROFESSIONAL) |
| `min_price` | decimal | ❌ | Valor mínimo por hora (PROFESSIONAL) |
| `max_price` | decimal | ❌ | Valor máximo por hora (PROFESSIONAL) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "next": "string | null",
    "previous": "string | null",
    "role": "string | null",
    "results": [ ... ]
  }
}
```

**Estrutura de resultado por role:**

**ELDER:**
```json
{
  "id": 1,
  "role": "ELDER",
  "full_name": "string",
  "preferred_name": "string",
  "gender": "string",
  "mobility_level": "string"
}
```

**GUARDIAN:**
```json
{
  "id": 1,
  "role": "GUARDIAN",
  "full_name": "string",
  "relationship": "string",
  "is_legal_guardian": false
}
```

**CAREGIVER:**
```json
{
  "id": 1,
  "role": "CAREGIVER",
  "full_name": "string",
  "bio": "string",
  "experience_years": 5,
  "city": "string",
  "state": "string",
  "is_available": true
}
```

**PROFESSIONAL:**
```json
{
  "id": 1,
  "role": "PROFESSIONAL",
  "full_name": "string",
  "profession": "PHYSIOTHERAPIST",
  "profession_display": "Fisioterapeuta",
  "bio": "string",
  "service_mode": "HOME",
  "hourly_rate": "100.00",
  "is_available": true,
  "registration_verified": false,
  "city": "string",
  "state": "string"
}
```

**INSTITUTION:**
```json
{
  "id": 1,
  "role": "INSTITUTION",
  "full_name": "string",
  "legal_name": "string",
  "trade_name": "string",
  "institution_type": "ILPI",
  "city": "string",
  "state": "string",
  "is_verified": false
}
```

> Retorna apenas usuários com `is_active=True`. Usa cursor pagination. Ordena por `created_at` decrescente.  
> Quando `role` não é fornecido, busca em todas as roles e retorna resultados mistos.

**Erros:** `400` role inválida.

---

## Health Check

### `GET /api/v1/health/` — Status da API
**Acesso:** Público

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "API de rede de cuidados ativa"
  }
}
```

---

## Tabela de Permissões

| Endpoint | Método | Auth | Role |
|----------|--------|------|------|
| `/auth/token/` | POST | ❌ | — |
| `/auth/token/refresh/` | POST | ❌ | — |
| `/auth/signup/` | POST | ❌ | — |
| `/auth/me/` | GET | ✅ | Qualquer |
| `/auth/me/` | PATCH | ✅ | Qualquer |
| `/auth/password/change/` | POST | ✅ | Qualquer |
| `/elders/me/` | GET / PATCH / PUT | ✅ | ELDER |
| `/caregivers/me/` | GET / PATCH / PUT | ✅ | CAREGIVER |
| `/guardians/me/` | GET / PATCH / PUT | ✅ | GUARDIAN |
| `/professionals/me/` | GET / PATCH / PUT | ✅ | PROFESSIONAL |
| `/institutions/me/` | GET / PATCH / PUT | ✅ | INSTITUTION |
| `/posts/my-posts/` | GET / POST | ✅ | Qualquer |
| `/posts/my-posts/{id}/` | GET / PUT / PATCH / DELETE | ✅ | Dono |
| `/posts/feed/` | GET | ❌ | — |
| `/posts/like/{id}` | POST | ✅ | Qualquer |
| `/posts/unlike/{id}` | DELETE | ✅ | Qualquer |
| `/posts/comment/{post_id}` | GET / POST | ✅ | Qualquer |
| `/posts/comment/{post_id}/{comment_id}` | PATCH / DELETE | ✅ | Autor |
| `/links/` | GET | ✅ | Qualquer |
| `/links/{user_id}/` | GET | ✅ | Qualquer |
| `/links/` | POST | ✅ | Qualquer (com perfil) |
| `/links/respond/` | POST | ✅ | Qualquer (Elder/outro lado) |
| `/search/` | GET | ❌ | — |
| `/health/` | GET | ❌ | — |
