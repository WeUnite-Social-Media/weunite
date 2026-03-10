# Sistema Administrativo WeUnite

## Visão Geral

O sistema administrativo foi implementado seguindo os padrões de código existentes no projeto WeUnite, criando uma estrutura bem organizada e modular para o gerenciamento da plataforma.

## Estrutura de Pastas

```
src/
├── @types/admin/           # Tipos TypeScript específicos do admin
│   ├── auth.types.ts       # Tipos de autenticação administrativa
│   ├── dashboard.types.ts  # Tipos do dashboard
│   ├── report.types.ts     # Tipos de denúncias
│   └── user.types.ts       # Tipos de gerenciamento de usuários
├── api/services/admin/     # Serviços de API administrativos
│   ├── authService.ts      # Autenticação de admin
│   ├── dashboardService.ts # Estatísticas do dashboard
│   ├── reportService.ts    # Gerenciamento de denúncias
│   └── userService.ts      # Gerenciamento de usuários
├── components/admin/       # Componentes administrativos
│   ├── AdminHeader.tsx     # Cabeçalho do painel admin
│   ├── AdminLayout.tsx     # Layout base do admin
│   ├── AdminSidebar.tsx    # Menu lateral administrativo
│   ├── DashboardOverview.tsx # Visão geral do dashboard
│   └── StatsCard.tsx       # Card de estatísticas
├── pages/admin/           # Páginas administrativas
│   ├── AdminDashboardPage.tsx # Dashboard principal
│   ├── AdminUsersPage.tsx     # Gerenciamento de usuários
│   └── AdminReportsPage.tsx   # Gerenciamento de denúncias
├── routes/admin/          # Rotas administrativas
│   └── AdminRoutes.tsx    # Configuração de rotas protegidas
├── state/admin/           # Estados específicos do admin
└── stores/admin/          # Stores Zustand do admin
    ├── useAdminAuthStore.ts      # Store de autenticação
    └── useAdminDashboardStore.ts # Store do dashboard
```

## Funcionalidades Implementadas

### 1. Controle de Acesso

- **Verificação por email**: Lista temporária de emails administrativos
- **Rotas protegidas**: Apenas usuários autorizados podem acessar
- **Redirecionamento**: Usuários não-admin são redirecionados para home
- **Integração com menu**: Botão de acesso visível apenas para admins

### 2. Dashboard Administrativo

- **Estatísticas gerais**: Posts, oportunidades, usuários ativos, engajamento
- **Gráficos**: Atividade mensal e distribuição por categoria
- **Comparação temporal**: Tendências comparadas ao mês anterior
- **Cards informativos**: Métricas visuais com indicadores de crescimento

### 3. Gerenciamento de Usuários

- **Listagem completa**: Todos os usuários da plataforma
- **Filtros avançados**: Por status, tipo (atleta/empresa), busca por texto
- **Ações administrativas**: Suspender, ativar, banir, definir como admin
- **Informações detalhadas**: Posts, denúncias, último login

### 4. Gerenciamento de Denúncias

- **Listagem de reports**: Todas as denúncias organizadas
- **Filtros por status**: Pendente, em análise, resolvido, rejeitado
- **Ações de moderação**: Revisar, resolver, rejeitar denúncias
- **Estatísticas rápidas**: Contadores por status

## Padrões de Código Seguidos

### 1. Organização de Arquivos

- Estrutura similar ao resto do projeto
- Separação clara entre tipos, serviços, componentes e páginas
- Nomenclatura consistente com o padrão existente

### 2. Componentes React

- TypeScript com tipagem forte
- Props interfaces bem definidas
- Composição de componentes modulares
- Hooks personalizados quando necessário

### 3. Serviços de API

- Padrão de retorno consistente (success, data, message, error)
- Tratamento de erro com AxiosError
- Tipagem completa das respostas
- Configuração baseada na instância axios existente

### 4. Stores Zustand

- Estados imutáveis
- Actions bem definidas
- Persistência quando necessário
- Padrão similar ao useAuthStore existente

### 5. Roteamento

- Proteção de rotas
- Estrutura aninhada
- Redirecionamentos apropriados
- Integração com sistema de autenticação existente

## Controle de Acesso Temporário

### Lista de Administradores

```typescript
const ADMIN_EMAILS = [
  "admin@weunite.com",
  "luiz@weunite.com",
  "matheus@weunite.com",
];
```

### Verificação

```typescript
const isAdmin =
  user?.isAdmin || (user?.email && ADMIN_EMAILS.includes(user.email));
```

## Integração com Backend

### Endpoints Esperados

```
POST /admin/auth/login          # Login administrativo
GET  /admin/auth/validate       # Validação de token
POST /admin/auth/refresh        # Renovação de token

GET  /admin/dashboard/stats     # Estatísticas gerais
GET  /admin/dashboard/activity  # Atividade mensal
GET  /admin/dashboard/opportunities-by-category

GET  /admin/users              # Listagem de usuários
GET  /admin/users/:id          # Usuário específico
POST /admin/users/action       # Ações administrativas
DELETE /admin/users/:id        # Exclusão de usuário

GET  /admin/reports            # Listagem de denúncias
GET  /admin/reports/:id        # Denúncia específica
POST /admin/reports/action     # Ações de moderação
GET  /admin/reports/stats      # Estatísticas de denúncias
```

## Como Usar

### 1. Acesso ao Painel

- Faça login com uma conta autorizada
- Clique no menu do usuário (canto inferior esquerdo)
- Selecione "Painel Admin" (visível apenas para admins)

### 2. Navegação

- Use o menu lateral para navegar entre seções
- Dashboard: Visão geral e estatísticas
- Usuários: Gerenciamento de contas
- Denúncias: Moderação de conteúdo

### 3. Filtros e Buscas

- Use os filtros disponíveis em cada página
- Busque por nome, email, username nos usuários
- Filtre denúncias por status

## Próximos Passos

1. **Integração com Backend**: Substituir dados mock por API real
2. **Permissões Granulares**: Implementar sistema de permissões detalhado
3. **Auditoria**: Logs de ações administrativas
4. **Notificações**: Sistema de alertas para administradores
5. **Relatórios**: Exportação de dados e relatórios detalhados

## Dados Mock

Enquanto o backend não estiver pronto, o sistema utiliza dados mock para demonstração:

- 3 usuários de exemplo
- 3 denúncias de exemplo
- Estatísticas fictícias do dashboard
- Gráficos com dados simulados

Os dados mock seguem a estrutura exata esperada do backend, facilitando a integração futura.
