# Plano de carregamento sob demanda

## Objetivo

Reduzir consultas e payloads iniciais carregando apenas os dados necessários para a tela que o usuário abriu ou para a ação que ele executou.

Ao fazer login e entrar no feed, a aplicação deve carregar somente a primeira página com 10 posts e os campos mínimos que aparecem no card:

- id do post
- conteúdo textual
- imagem do post, quando existir
- data de criação
- autor mínimo: id, nome, username e foto
- contagem de curtidas
- contagem de comentários
- estado de curtida do usuário autenticado, se o botão precisar renderizar ativo
- dados mínimos de repost, se o card continuar mostrando reposts

Comentários, listas de curtidas, perfil completo, seguidores, oportunidades, inscritos e detalhes enriquecidos devem ser carregados somente quando o usuário clicar ou navegar para a área correspondente.

## Problema atual

O front usa React Query, mas algumas superfícies ainda montam queries junto com a tela principal ou dependem de DTOs ricos demais:

- `FeedHome` monta o feed e também renderiza superfícies laterais que podem disparar oportunidades.
- `Post` recebe `Post` com `likes` e `comments` como listas, embora o card só precise das contagens.
- `Comments` deve buscar comentários apenas quando o modal/drawer estiver aberto.
- Perfis e oportunidades usam DTOs completos, o que incentiva carregamento de dados de relacionamento antes do clique.
- No backend, `PostDTO`, `OpportunityDTO` e `UserDTO` são modelos amplos para muitas telas, misturando lista, detalhe e edição.

## Princípios

- Lista carrega resumo; clique carrega detalhe.
- Não montar query em componente oculto.
- Query de detalhe sempre usa `enabled` baseado em clique, rota ou modal aberto.
- Contagens vêm do backend como números, não como `array.length` de coleções completas.
- DTO de lista não deve carregar relacionamentos pesados.
- Evitar prefetch automático, exceto quando houver intenção clara do usuário e benefício mensurável.
- Manter paginação no banco de dados.

## Contratos propostos

### Feed

Criar um read model dedicado para a lista:

```java
public record FeedPostSummaryDTO(
    Long id,
    String text,
    String imageUrl,
    Instant createdAt,
    UserSummaryDTO user,
    long likesCount,
    long commentsCount,
    boolean likedByViewer,
    UserSummaryDTO repostedBy,
    Instant repostedAt) {}
```

Criar `UserSummaryDTO` compartilhado para cards:

```java
public record UserSummaryDTO(
    String id,
    String name,
    String username,
    String profileImg) {}
```

Manter `PostDTO` para detalhe, edição e fluxos que realmente precisam de comentários, curtidas ou reposts completos.

### Comentários

Manter comentários em endpoint paginado por post, mas garantir que o hook só rode quando o modal/drawer estiver aberto:

```ts
useGetComments(postId, { enabled: isOpen === true });
```

O card do post deve abrir comentários por clique em `MessageCircle` ou no contador de comentários. Antes disso, a tela só renderiza `commentsCount`.

### Oportunidades

Criar ou adaptar listagem para resumo:

```java
public record OpportunitySummaryDTO(
    Long id,
    String title,
    String location,
    LocalDate dateEnd,
    Instant createdAt,
    UserSummaryDTO company,
    int subscribersCount) {}
```

Carregar oportunidades somente quando:

- o usuário navegar para `/opportunity`
- o usuário abrir a aba/seção de oportunidades no perfil
- o usuário clicar explicitamente em uma aba "Oportunidades" em qualquer tela que tenha abas

Detalhes, skills completas, inscrição, salvos e inscritos continuam em queries de detalhe/ação.

### Perfil

Usar `UserSummaryDTO` em cards do feed, comentários, oportunidades e busca compacta.

Carregar `UserDTO` completo apenas quando:

- o usuário navegar para `/profile`
- o usuário clicar em avatar/nome/username
- uma tela de edição de perfil for aberta

Dados secundários do perfil devem ser separados:

- posts do usuário: carregar quando a aba posts estiver ativa
- oportunidades da empresa: carregar quando a aba oportunidades estiver ativa
- seguidores/seguindo: carregar quando o modal/aba correspondente abrir
- skills/atributos detalhados: carregar no detalhe do perfil, não no feed

## Plano de implementação

### Fase 1: Inventário e medição

- Ativar logs SQL e medir o fluxo atual: login, feed, abrir comentários, abrir oportunidade e abrir perfil.
- Registrar número de requests HTTP por rota e queries SQL por endpoint.
- Mapear todos os hooks `useQuery` e `useInfiniteQuery` sem `enabled`.
- Mapear componentes ocultos que montam queries mesmo quando modais, drawers ou abas estão fechados.

Arquivos iniciais:

- `apps/web/src/features/feed/state/usePosts.ts`
- `apps/web/src/features/feed/state/useComments.ts`
- `apps/web/src/features/opportunities/state/useOpportunities.ts`
- `apps/web/src/features/profile/hooks/useUserProfile.ts`
- `apps/web/src/features/profile/state/useUsers.ts`
- `apps/api/src/main/java/com/weunite/api/posts/*`
- `apps/api/src/main/java/com/weunite/api/opportunities/*`
- `apps/api/src/main/java/com/weunite/api/users/*`

### Fase 2: Feed mínimo

- Criar `FeedPostSummaryDTO` e `UserSummaryDTO`.
- Ajustar repositório de posts para retornar feed summary com contagens agregadas.
- Evitar `JOIN FETCH` de comentários, likes e perfil completo no endpoint de feed.
- Alterar `getPostsRequest` e tipos TS para consumir `FeedPostSummary`.
- Alterar `Post` para usar `likesCount` e `commentsCount`, não `post.likes.length` e `post.comments.length`.
- Preservar endpoint de detalhe do post para carregar dados ricos sob demanda.

Critério de aceite:

- Ao entrar no feed, só deve haver request para a primeira página de posts, health/auth essenciais e assets.
- O endpoint do feed retorna 10 posts por padrão e não retorna arrays de comentários/curtidas.

### Fase 3: Comentários por clique

- Alterar `useGetComments(postId, options)` para aceitar `enabled`.
- Chamar `useGetComments(Number(post.id), { enabled: isOpen === true })`.
- Garantir que o modal/drawer de comentários não busque nada antes do clique.
- Invalidar apenas `commentKeys.listByPost(postId)` e atualizar `commentsCount` do post após criar/deletar comentário.
- Considerar `placeholderData` somente para manter página anterior dentro do modal, nunca para pré-carregar comentários.

Critério de aceite:

- Clicar no ícone/comentário dispara a primeira query de comentários.
- Fechar o modal não dispara novas queries.

### Fase 4: Oportunidades por navegação ou aba

- Remover busca de oportunidades do feed inicial, especialmente sidebars/carrosséis montados junto com `Home`.
- Se houver sidebar de oportunidades na home, trocar por CTA ou componente que só carrega após clique explícito.
- Adicionar `enabled` aos hooks de oportunidades usados em abas/modais.
- Separar `OpportunitySummary` de `OpportunityDetail`.
- Carregar detalhes e skills completas ao abrir card/modal de oportunidade.

Critério de aceite:

- Login/feed não chama endpoints de oportunidades.
- Entrar em `/opportunity` chama apenas a listagem resumida.
- Abrir uma oportunidade chama o detalhe.

### Fase 5: Perfil por clique

- Garantir que cards usem `UserSummaryDTO`.
- Fazer `ProfileRoutes`/`Profile` carregar o perfil completo somente quando a rota for visitada.
- Adicionar `enabled` em queries de posts do usuário, oportunidades da empresa, seguidores e seguindo, baseado na aba ativa ou modal aberto.
- Evitar carregar perfil completo para autores do feed, autores de comentários ou empresas em cards de oportunidade.

Critério de aceite:

- Feed não chama endpoint de perfil completo de cada autor.
- Clicar em avatar/nome navega para o perfil e só então carrega `UserDTO` completo.

### Fase 6: Cache e invalidação

- Definir `staleTime` por tipo:
  - feed summary: 1 a 5 minutos
  - comentários abertos: 30 a 60 segundos
  - perfil completo: 5 minutos
  - oportunidades: 2 a 5 minutos
- Invalidar somente chaves afetadas por mutações.
- Evitar `invalidateQueries` amplo em criação de comentário, curtida, follow e salvar oportunidade.
- Usar update otimista para contagens simples quando possível.

### Fase 7: Testes e validação

- Backend:
  - testes de repository/service para feed summary com `likesCount`, `commentsCount` e `likedByViewer`
  - testes de paginação de comentários
  - testes de oportunidade summary
- Frontend:
  - teste ou verificação manual de que `useGetComments` não roda com modal fechado
  - verificação de que oportunidades não carregam no login/feed
  - verificação de que perfil completo só carrega na rota de perfil
- Observabilidade:
  - capturar waterfall de rede antes/depois
  - comparar número de SQL statements no login/feed

## Sequência de PRs sugerida

1. `feat(api): add feed summary read model`
   - Backend DTO/repository/service/controller para feed mínimo.
   - Tipos TS de feed summary.

2. `feat(web): lazy load post comments`
   - Hook de comentários com `enabled`.
   - Post card usando contagens.
   - Modal/drawer carregando comentários só ao abrir.

3. `feat(web): defer opportunity queries`
   - Remover oportunidades do carregamento inicial.
   - `enabled` por rota/aba/modal.
   - Opportunity summary/detail no front.

4. `feat(api): add opportunity summary read model`
   - DTO/repository/service para listagem resumida.
   - Detalhe preserva dados completos.

5. `feat(web): defer profile detail queries`
   - Cards usam user summary.
   - Perfil completo, posts, oportunidades e seguidores só por rota/aba/modal.

6. `chore(perf): tighten query invalidation`
   - Ajustar invalidações amplas.
   - Adicionar update otimista para contagens.

## Riscos

- Alguns componentes podem assumir `post.likes` e `post.comments` como arrays; será preciso migrar para contagens antes de trocar o contrato.
- Comentários aninhados ou curtidas de comentário podem precisar de contratos próprios para não reintroduzir listas completas.
- O endpoint de auth/current user pode continuar retornando perfil completo do usuário autenticado; isso é aceitável para sessão, mas não deve ser usado para autores de cards.
- Separar DTOs pode exigir adaptação em web/mobile se ambos consumirem os mesmos contratos.

## Definição de pronto

- Login/feed carrega apenas a página inicial de 10 posts resumidos.
- Nenhum endpoint de oportunidades é chamado até clique/navegação para oportunidades.
- Nenhum endpoint de comentários é chamado até clique no post/comentários.
- Nenhum perfil completo de autor é carregado até clique no perfil.
- Cards mostram corretamente autor, foto, texto, imagem, data, curtidas e comentários usando contagens.
- CI passa para API e web.
