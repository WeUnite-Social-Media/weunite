# Sistema de Moderação de Posts - Admin

## 📋 Visão Geral

Sistema de moderação de posts denunciados para administradores da plataforma WeUnite. Permite revisar, ocultar e deletar posts reportados pelos usuários.

## 🎯 Componentes Criados

### 1. `PostReviewModal`

**Localização:** `src/components/admin/PostReviewModal.tsx`

Modal centralizado para revisar denúncias de posts com as seguintes funcionalidades:

- ✅ Visualização completa do post e suas informações
- ✅ Dados do usuário que criou o post
- ✅ Métricas de engajamento (curtidas, comentários, shares)
- ✅ Ações de moderação (Ocultar e Deletar)
- ✅ Design responsivo e acessível

**Propriedades:**

```typescript
interface PostReviewModalProps {
  isOpen: boolean; // Controla se o modal está aberto
  onOpenChange: (open: boolean) => void; // Callback para fechar
  post: Post | null; // Post sendo revisado
}
```

**Exemplo de uso:**

```tsx
import { PostReviewModal } from "@/components/admin/PostReviewModal";
import { useState } from "react";

function MyComponent() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PostReviewModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      post={selectedPost}
    />
  );
}
```

### 2. `ReportedPostsPage`

**Localização:** `src/pages/admin/ReportedPostsPage.tsx`

Página completa para gerenciamento de posts denunciados com:

- ✅ Tabela de posts reportados
- ✅ Filtros e badges de status
- ✅ Integração com o modal de revisão
- ✅ Estado de loading e empty states

### 3. Serviços de API

**Localização:** `src/api/services/admin/moderationService.ts`

Funções para comunicação com o backend:

```typescript
// Buscar posts denunciados
getReportedPostsRequest(): Promise<ApiResponse<ReportedPost[]>>

// Ocultar um post
hidePostRequest(postId: string, reason?: string): Promise<ApiResponse<void>>

// Deletar um post
deletePostRequest(postId: string, reason?: string): Promise<ApiResponse<void>>

// Rejeitar denúncia
dismissReportRequest(postId: string, reason?: string): Promise<ApiResponse<void>>

// Executar ação de moderação genérica
moderatePostRequest(action: ModerationAction): Promise<ApiResponse<void>>
```

### 4. Tipos TypeScript

**Localização:** `src/@types/admin.types.ts`

```typescript
interface PostReport {
  id: string;
  postId: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface ReportedPost {
  post: Post;
  reports: PostReport[];
  totalReports: number;
  status: "pending" | "hidden" | "deleted";
}

interface ModerationAction {
  action: "hide" | "delete" | "dismiss";
  postId: string;
  reason?: string;
}
```

## 🚀 Como Integrar

### 1. Adicionar rota admin

```tsx
// src/routes/admin/AdminRoutes.tsx
import { ReportedPostsPage } from "@/pages/admin/ReportedPostsPage";

{
  /* Adicione dentro das rotas admin */
}
<Route path="/admin/posts/reported" element={<ReportedPostsPage />} />;
```

### 2. Adicionar ao menu lateral

```tsx
// src/components/admin/AdminSidebar.tsx
const menuItems = [
  // ... outros itens
  {
    title: "Posts Denunciados",
    url: "/admin/posts/reported",
    icon: Flag,
  },
];
```

### 3. Usar o modal em qualquer lugar

```tsx
import { PostReviewModal } from "@/components/admin/PostReviewModal";

function AnyComponent() {
  const [post, setPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleReviewPost = (postToReview) => {
    setPost(postToReview);
    setModalOpen(true);
  };

  return (
    <>
      <Button onClick={() => handleReviewPost(somePost)}>Revisar Post</Button>

      <PostReviewModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        post={post}
      />
    </>
  );
}
```

## 🎨 Customizações Realizadas

### ✅ Removido do design original:

- ❌ Campo "Categoria" (não era necessário)
- ❌ Botão "Sinalizar Post" (redundante)
- ❌ Sidebar lateral (substituído por modal centralizado)

### ✅ Adicionado ao design:

- ✨ Modal centralizado e responsivo
- ✨ Métricas de engajamento visuais
- ✨ Cards com ícones coloridos
- ✨ Hover states nos botões de ação
- ✨ Integração com React Query para cache
- ✨ Estados de loading automáticos
- ✨ Feedback visual de ações

## 📡 Endpoints do Backend (A implementar)

O frontend está preparado para os seguintes endpoints:

```
GET  /api/admin/posts/reported          // Lista posts denunciados
POST /api/admin/posts/:id/hide          // Oculta um post
DELETE /api/admin/posts/:id             // Deleta um post
POST /api/admin/posts/:id/dismiss       // Rejeita denúncia
```

## 🔄 Próximos Passos

1. **Backend:**
   - Implementar os endpoints de moderação
   - Adicionar sistema de permissões
   - Criar logs de ações de moderação

2. **Frontend:**
   - Adicionar sistema de toast/notificações
   - Implementar filtros na tabela
   - Adicionar paginação
   - Criar histórico de ações
   - Adicionar confirmação antes de deletar

3. **Melhorias:**
   - Permitir adicionar motivo ao moderar
   - Mostrar histórico de denúncias
   - Adicionar estatísticas de moderação
   - Sistema de appeals (recursos)

## 📝 Notas de Desenvolvimento

- O componente usa **React Query** para gerenciamento de estado e cache
- Não depende de emails hardcoded (usa autenticação real quando backend estiver pronto)
- Design mobile-first e totalmente responsivo
- Acessível com suporte a teclado e screen readers
- Pronto para internacionalização (i18n)

## 🎯 Status Atual

- ✅ Modal de revisão funcional
- ✅ Integração com API preparada
- ✅ Tipos TypeScript completos
- ✅ Componentes reutilizáveis
- ⏳ Aguardando implementação do backend
- ⏳ Sistema de notificações pendente
