# 📘 Guia de Estilo de Componentes - WeUnite Frontend

## Baseado nos Padrões dos Componentes Admin

---

## 📋 Índice

1. [Estrutura de Componentes](#estrutura-de-componentes)
2. [Nomenclatura](#nomenclatura)
3. [Exports](#exports)
4. [TypeScript](#typescript)
5. [Documentação](#documentação)
6. [Imports](#imports)
7. [Props](#props)
8. [Hooks](#hooks)
9. [Event Handlers](#event-handlers)
10. [Renderização](#renderização)
11. [Estilização](#estilização)
12. [Exemplos](#exemplos)

---

## 1. Estrutura de Componentes

### ✅ Estrutura Padrão

```tsx
// 1. Imports
import { UIComponent } from "@/components/ui/component";
import { Icon } from "lucide-react";
import type { TypeName } from "@/@types/type-name.types";
import { useHook } from "@/hooks/useHook";

// 2. Documentação JSDoc
/**
 * Descrição do componente
 */

// 3. Interface de Props (se necessário)
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

// 4. Componente
export function ComponentName({ prop1, prop2 = 0 }: ComponentNameProps) {
  // 4.1. Hooks
  const { data } = useHook();
  const [state, setState] = useState();

  // 4.2. Funções auxiliares
  const handleClick = () => {
    // lógica
  };

  // 4.3. Early returns
  if (!data) return <Loading />;

  // 4.4. Render principal
  return <div>{/* conteúdo */}</div>;
}
```

---

## 2. Nomenclatura

### ✅ Componentes

- **PascalCase** para nomes de componentes
- Nome descritivo e específico
- Evitar abreviações desnecessárias

```tsx
// ✅ BOM
export function UserProfileCard() {}
export function PostReviewModal() {}
export function MonthlyActivityChart() {}

// ❌ RUIM
export function Card() {} // Muito genérico
export function PRM() {} // Abreviação não clara
export function comp1() {} // Não descritivo
```

### ✅ Arquivos

- Nome do arquivo = Nome do componente
- PascalCase
- Extensão `.tsx` para componentes React

```
✅ UserProfileCard.tsx → export function UserProfileCard()
✅ PostReviewModal.tsx → export function PostReviewModal()

❌ userProfile.tsx
❌ post-review.tsx
❌ MODAL.tsx
```

### ✅ Props Interfaces

- Nome do componente + "Props"
- Sempre definir interface, nunca inline

```tsx
// ✅ BOM
interface UserProfileCardProps {
  userId: string;
  showActions?: boolean;
}

export function UserProfileCard({
  userId,
  showActions,
}: UserProfileCardProps) {}

// ❌ RUIM
export function UserProfileCard({
  userId,
  showActions,
}: {
  userId: string;
  showActions?: boolean;
}) {}
```

### ✅ Event Handlers

- Prefixo `handle` para funções de evento
- Verbo que descreve a ação

```tsx
// ✅ BOM
const handleClick = () => {};
const handleSubmit = () => {};
const handleDelete = () => {};
const handleUserSelect = () => {};

// ❌ RUIM
const onClick = () => {};
const submit = () => {};
const del = () => {};
const userSel = () => {};
```

---

## 3. Exports

### ✅ SEMPRE usar Named Exports

```tsx
// ✅ BOM - Named Export
export function ComponentName() {}

// ❌ RUIM - Default Export
export default function ComponentName() {}
```

### 📝 Motivos:

1. **Melhor suporte de IDE** - Autocompletar e refactoring
2. **Tree-shaking** - Bundlers conseguem eliminar código não usado
3. **Imports consistentes** - Sempre o mesmo nome
4. **Facilita renomeação** - IDE renomeia em todos os lugares

### ✅ Múltiplos exports no mesmo arquivo

```tsx
// ✅ Permitido quando faz sentido
export function MainComponent() {}
export function SubComponent() {}

// Exemplo real: AdminSidebar.tsx
export function AdminSidebar() {}
export function AdminMobileSidebar() {}
```

---

## 4. TypeScript

### ✅ Type Imports

- SEMPRE usar palavra-chave `type` para imports de tipos

```tsx
// ✅ BOM
import type { User } from "@/@types/user.types";
import type { Post } from "@/@types/post.types";

// ❌ RUIM
import { User } from "@/@types/user.types";
```

### ✅ Props Tipagem

- Interface nomeada (não type alias)
- Props opcionais com `?`
- Default values na desestruturação

```tsx
// ✅ BOM
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatsCard({ title, value, icon, trend = 0 }: StatsCardProps) {}

// ❌ RUIM
type Props = {
  title: string;
  value: any; // Evitar 'any'
};

export function StatsCard(props: Props) {} // Não desestruturar
```

### ✅ Tipos de Retorno

- Deixar TypeScript inferir quando óbvio
- Explicitar em casos complexos

```tsx
// ✅ BOM - Inferência automática
export function getStatusText(status: string) {
  return status === "pending" ? "Pendente" : "Ativo";
}

// ✅ BOM - Explícito quando complexo
export function processData(data: RawData): ProcessedData {
  // lógica complexa
}
```

---

## 5. Documentação

### ✅ JSDoc Obrigatório

- TODOS os componentes devem ter JSDoc
- Descrição clara e concisa
- Exemplos quando necessário

```tsx
/**
 * Cartão de estatísticas do dashboard administrativo
 * Exibe métricas com indicador de tendência e comparação com período anterior
 *
 * @example
 * <StatsCard
 *   title="Total de Posts"
 *   value={1234}
 *   trend={12.5}
 *   icon={<FileText className="h-4 w-4" />}
 * />
 */
interface StatsCardProps {}
```

### ✅ Template Mínimo

```tsx
/**
 * [Descrição em uma linha do que o componente faz]
 */
```

### ✅ Template Completo

```tsx
/**
 * [Descrição principal]
 * [Detalhes adicionais se necessário]
 *
 * @example
 * <ComponentName prop="value" />
 *
 * @param props - [Descrição das props se muito complexo]
 * @returns [Descrição do retorno se não for JSX óbvio]
 */
```

### ✅ Comentários Internos

- Usar para lógica complexa
- Evitar comentários óbvios

```tsx
// ✅ BOM
// Calcula a diferença percentual entre o período atual e anterior
const calculateTrend = (current: number, previous: number) => {
  return ((current - previous) / previous) * 100;
};

// ❌ RUIM
// Incrementa o contador
setCount(count + 1); // Comentário óbvio
```

---

## 6. Imports

### ✅ Ordem de Imports

```tsx
// 1. Bibliotecas externas (React, etc)
import { useState, useEffect } from "react";

// 2. Componentes UI (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 3. Ícones
import { Heart, MessageCircle } from "lucide-react";

// 4. Types (com palavra-chave 'type')
import type { User } from "@/@types/user.types";
import type { Post } from "@/@types/post.types";

// 5. Componentes internos
import { CustomComponent } from "@/components/custom";

// 6. Hooks personalizados
import { useCustomHook } from "@/hooks/useCustomHook";

// 7. Stores/State
import { useAuthStore } from "@/stores/useAuthStore";

// 8. Utils/Helpers
import { formatDate } from "@/utils/formatDate";

// 9. Constantes
import { API_URL } from "@/constants/api";
```

### ✅ Imports Agrupados

```tsx
// ✅ BOM - Agrupar imports relacionados
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ❌ RUIM - Imports separados do mesmo módulo
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
```

---

## 7. Props

### ✅ Desestruturação

- SEMPRE desestruturar props
- Default values na desestruturação

```tsx
// ✅ BOM
export function Component({
  title,
  count = 0,
  isActive = false,
}: ComponentProps) {
  return <div>{title}</div>;
}

// ❌ RUIM
export function Component(props: ComponentProps) {
  return <div>{props.title}</div>;
}
```

### ✅ Props Opcionais

- Usar `?` para props opcionais
- Fornecer defaults quando faz sentido

```tsx
interface CardProps {
  title: string; // Obrigatório
  subtitle?: string; // Opcional
  showIcon?: boolean; // Opcional com default
  onClick?: () => void; // Callback opcional
}

export function Card({ title, subtitle, showIcon = true, onClick }: CardProps) {
  // Usar optional chaining
  onClick?.();
}
```

### ✅ Children

- Usar `React.ReactNode` para children

```tsx
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <div>{children}</div>;
}
```

---

## 8. Hooks

### ✅ Ordem de Hooks

1. Context hooks (`useContext`)
2. State hooks (`useState`)
3. Effect hooks (`useEffect`)
4. Ref hooks (`useRef`)
5. Custom hooks

```tsx
export function Component() {
  // 1. Context
  const { user } = useAuthStore();
  const { theme } = useTheme();

  // 2. State
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Data[]>([]);

  // 3. Effects
  useEffect(() => {
    // effect
  }, []);

  // 4. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 5. Custom hooks
  const { mutate } = useCustomMutation();

  // Resto do componente...
}
```

### ✅ Nomear Queries/Mutations

- Nomes descritivos para mutations

```tsx
// ✅ BOM
const createPostMutation = useCreatePost();
const deleteUserMutation = useDeleteUser();

// ❌ RUIM
const mutation1 = useCreatePost();
const m = useDeleteUser();
```

---

## 9. Event Handlers

### ✅ Nomenclatura

- Prefixo `handle` + ação

```tsx
// ✅ BOM
const handleClick = () => {};
const handleSubmit = async (e: FormEvent) => {};
const handleDelete = (id: string) => {};
const handleModalOpen = () => {};

// ❌ RUIM
const onClick = () => {};
const submit = () => {};
const delUser = () => {};
```

### ✅ Callbacks como Props

- Prefixo `on` para callbacks

```tsx
interface ModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  onDelete?: (id: string) => void;
}
```

### ✅ Async Handlers

- Marcar como `async` quando necessário
- Tratar erros

```tsx
const handleSubmit = async (values: FormValues) => {
  try {
    await mutation.mutateAsync(values);
    toast.success("Sucesso!");
  } catch (error) {
    toast.error("Erro ao salvar");
    console.error(error);
  }
};
```

---

## 10. Renderização

### ✅ Early Returns

- Usar para loading, erro, casos especiais

```tsx
export function Component({ data }: Props) {
  // Early returns primeiro
  if (!data) {
    return <Loading />;
  }

  if (data.length === 0) {
    return <EmptyState />;
  }

  // Render principal
  return <div>{/* conteúdo */}</div>;
}
```

### ✅ Conditional Rendering

- Usar ternário para alternativas simples
- Usar `&&` para renderização condicional

```tsx
// ✅ BOM
{
  isLoading ? <Spinner /> : <Content />;
}
{
  showButton && <Button />;
}
{
  count > 0 && <Badge>{count}</Badge>;
}

// ❌ RUIM
{
  isLoading && <Spinner />;
}
{
  !isLoading && <Content />;
}
```

### ✅ Lists

- Sempre usar `key` única
- Preferir ID ao invés de index

```tsx
// ✅ BOM
{
  posts.map((post) => <Post key={post.id} post={post} />);
}

// ⚠️ Aceitável se não há ID
{
  items.map((item, index) => <Item key={index} item={item} />);
}
```

---

## 11. Estilização

### ✅ Tailwind CSS

- Usar classes utilitárias
- Ordem: layout → spacing → tipografia → cores → efeitos

```tsx
// ✅ BOM - Ordem lógica
className =
  "flex items-center gap-4 p-4 text-lg font-bold text-foreground hover:bg-accent";

// ❌ RUIM - Ordem aleatória
className =
  "text-lg hover:bg-accent flex font-bold p-4 items-center text-foreground gap-4";
```

### ✅ Classes Condicionais

- Usar template literals ou `cn()` helper

```tsx
// ✅ BOM - Template literal
className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}

// ✅ BOM - cn() helper (shadcn)
className={cn(
  "base-class",
  isActive && "active-class",
  isError && "error-class"
)}
```

### ✅ Classes Customizadas

- Evitar estilos inline quando possível
- Usar Tailwind primeiro

```tsx
// ✅ BOM
<div className="w-full max-w-md mx-auto" />

// ⚠️ Use apenas quando Tailwind não atende
<div style={{ width: `${dynamicWidth}px` }} />
```

---

## 12. Exemplos Completos

### 📝 Exemplo 1: Componente Simples

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Cartão de estatísticas
 * Exibe uma métrica com ícone e indicador de tendência
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs mt-1 ${getTrendColor(trend)}`}
          >
            {trend > 0 ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 📝 Exemplo 2: Componente com Estado e Ações

```tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/@types/user.types";
import { useUpdateUser } from "@/hooks/useUpdateUser";

/**
 * Modal de edição de perfil de usuário
 * Permite atualizar nome e email do usuário
 */
interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProfileModal({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const updateMutation = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        name,
        email,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## ✅ Checklist de Revisão

Antes de fazer commit, verifique:

- [ ] Componente usa **named export**
- [ ] Tem **JSDoc** documentando o componente
- [ ] Props têm **interface nomeada**
- [ ] Type imports usam palavra-chave **`type`**
- [ ] Imports estão na **ordem correta**
- [ ] Event handlers têm prefixo **`handle`**
- [ ] Callbacks props têm prefixo **`on`**
- [ ] Hooks estão na **ordem correta**
- [ ] Tem **early returns** para casos especiais
- [ ] Classes Tailwind em **ordem lógica**
- [ ] Sem **console.logs** esquecidos
- [ ] Sem código **comentado** desnecessário
- [ ] Nome do arquivo = nome do componente

---

## 🚀 Ferramentas Recomendadas

### ESLint Rules

```json
{
  "rules": {
    "import/no-default-export": "error",
    "react/function-component-definition": [
      "error",
      {
        "namedComponents": "arrow-function"
      }
    ]
  }
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### Prettier Config

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

**Mantenha esse guia como referência ao desenvolver novos componentes!** 🎯
