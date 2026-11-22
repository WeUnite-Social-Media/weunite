# Seguidores em comum ("Seguido por quem você segue")

Documento de apoio para explicar a funcionalidade: o que foi feito, como o código funciona, qual estrutura de dados foi usada e por quê.

## 1. O que a funcionalidade faz

Ao abrir o perfil de outra pessoa, o app mostra quem, entre as pessoas que **eu sigo**, também **segue essa pessoa**.

Exemplo: eu sigo o Leo, e o Leo segue o Manoel. No perfil do Manoel aparece:

> (●●●) Seguido por leo, ana, carlos **+3**

- Até 3 avatares e 3 nomes (cada nome leva ao perfil da pessoa).
- `+N` com a quantidade restante, só quando há mais de 3 em comum.
- Em perfil próprio nada aparece.
- Em conta privada a informação aparece mesmo assim (decisão de produto).

## 2. O problema, formulado como algoritmo

Sejam dois conjuntos de IDs de usuário:

- **A** = usuários que eu sigo.
- **B** = usuários que seguem o perfil que estou vendo.

A resposta é a **interseção A ∩ B**. O `total` é `|A ∩ B|` e a amostra exibida são os primeiros elementos dela.

## 3. Estrutura de dados escolhida: Mapa / Conjunto (hash)

### Como é usada

1. **`HashSet<Long>`** guarda os IDs de A (quem eu sigo).
2. A lista B é percorrida **uma vez**; para cada ID, `viewerFollowingIds.contains(id)` decide se entra no resultado.
3. **`Map<Long, User>`** (id → usuário) guarda os usuários da amostra, para montar a resposta na ordem correta sem buscar usuário por usuário.

### Por que essa estrutura

- `contains` em uma tabela hash custa **O(1)** em média.
- Sem ela, a alternativa direta seria comparar cada elemento de B com cada elemento de A (dois loops aninhados), custo **O(|A|·|B|)**.
- Com o `HashSet`, o custo cai para **O(|A| + |B|)**: montar o conjunto (|A|) mais uma passada em B (|B|).

Exemplo numérico: eu sigo 500 pessoas e o perfil tem 10 000 seguidores.

| Abordagem                       | Comparações              |
| ------------------------------- | ------------------------ |
| Dois loops (array contra array) | 500 × 10 000 = 5 000 000 |
| `HashSet` + uma passada         | 500 + 10 000 = 10 500    |

### Por que não as outras estruturas

- **Array/lista com loop duplo:** funciona, mas é quadrático.
- **Pilha / Fila:** servem quando a ordem de processamento importa (LIFO/FIFO, como em busca em grafo). Aqui a ordem não importa para decidir quem está em comum, só o pertencimento.
- **Árvore:** daria busca O(log n) por elemento, pior que O(1) da hash, e traria complexidade desnecessária.

## 4. Passo a passo do que foi implementado

### 4.1 Backend (`apps/api`, módulo `follow`)

1. **Repositório** (`FollowRepository`): duas queries que devolvem **apenas IDs** (`List<Long>`), ambas filtrando por `status = ACCEPTED`:
   - `findFollowedIdsByFollowerId(userId, status)`: quem o usuário segue (conjunto A).
   - `findFollowerIdsByFollowedId(userId, status)`: quem segue o usuário, do mais recente para o mais antigo (lista B).

   Buscar só IDs evita carregar entidades `User` inteiras, que não seriam usadas.

2. **DTO** (`MutualFollowersDTO`): `record` com `total` e `users`.
3. **Service** (`FollowService.getMutualFollowers(viewerId, targetId, sample)`):
   1. Se o alvo não existe, lança `UserNotFoundException`.
   2. Se `viewerId == targetId`, devolve vazio.
   3. Monta o `HashSet` com A.
   4. Filtra B mantendo só quem está no conjunto → `mutualIds` (a ordem de B é preservada).
   5. Limita a amostra (`sample`, entre 0 e 10; padrão 3).
   6. Busca os usuários da amostra em **uma única query** (`findAllById`) e os coloca em um `Map<Long, User>`.
   7. Monta a lista de `UserDTO` seguindo a ordem de `sampleIds` e devolve `total = mutualIds.size()`.
4. **Controller** (`FollowController`): `GET /api/follow/mutual/{targetUserId}?sample=3`. O visualizador vem do **JWT** (`requireUserId`), nunca da URL, então ninguém consegue consultar a rede de outra pessoa.

### 4.2 Frontend web (`apps/web`)

1. **Tipos** (`shared/types/follower.type.ts`): `MutualFollowers` e `GetMutualFollowers`.
2. **Chamada HTTP** (`features/profile/api/followerService.ts`): `getMutualFollowersRequest`.
3. **Hook** (`features/profile/state/useFollow.ts`): `useGetMutualFollowers` com chave de cache própria.
   - Quando eu sigo ou deixo de seguir alguém, o cache de seguidores em comum é invalidado, porque mudou o conjunto A.
4. **Componente** (`features/profile/components/MutualFollowers.tsx`): avatares empilhados, nomes com link e `+N`. Não renderiza nada se não houver ninguém em comum.
5. **Integração** (`HeaderProfile.tsx`): o componente aparece nos dois layouts (desktop e mobile web), apenas em perfis de outras pessoas.

### 4.3 Mobile (`apps/mobile`, Flutter)

O mobile consome o **mesmo endpoint**, sem reimplementar nenhuma regra (a interseção continua só no backend). Segue a Clean Architecture do app:

1. **Domínio**: entidade `MutualFollowers` (`total`, `users`, e `extra = total - users.length`, o "+N") e novo método `getMutualFollowers` em `ProfileRepository`.
2. **Dados**: `ProfileRemoteDataSource.getMutualFollowers` chama `GET /follow/mutual/{id}?sample=3` e converte a resposta; `ProfileRepositoryImpl` apenas delega.
3. **Cubit**: `UserProfileCubit` carrega "seguido por" depois do perfil (o perfil aparece sem esperar). Se a chamada falhar, a linha só some, sem erro em tela. Ao seguir ou deixar de seguir, recarrega, pois o conjunto A mudou.
4. **UI**: widget `MutualFollowersRow` (avatares sobrepostos, nomes e `+N`), exibido em `UserProfileScreen` abaixo do cabeçalho. Em perfil próprio a tela é outra (`ProfileScreen`), então nada aparece.

Testes: parse da resposta no repositório (com total, vazio e erro) e três cenários do cubit (carrega, falha silenciosa, recarrega após seguir).

## 5. Exemplo de execução

Dados:

- Eu (id 1) sigo: `{10, 20, 30}` → A.
- Seguidores do Manoel (id 5), mais recente primeiro: `[40, 30, 20, 50]` → B.

Execução:

1. `HashSet` de A = `{10, 20, 30}`.
2. Percorre B: 40 (não), 30 (sim), 20 (sim), 50 (não).
3. `mutualIds = [30, 20]`, `total = 2`.
4. Com `sample = 3`, a amostra é `[30, 20]`; os usuários são buscados e a tela mostra "Seguido por user30, user20".

## 6. Decisões e consequências

| Decisão                                         | Motivo                                                                   | Consequência                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Só pessoas que **eu sigo** (grafo dirigido)     | Simples, igual ao padrão de redes sociais, reaproveita o modelo `Follow` | Não calcula amigos de amigos nem graus de conexão                                                                         |
| Só follows `ACCEPTED`                           | Pedidos pendentes/recusados não são relação real                         | Quem tem pedido pendente não conta                                                                                        |
| Visualizador vem do JWT                         | Segurança                                                                | O endpoint não aceita consultar a rede de terceiros                                                                       |
| Mostra mesmo em conta privada                   | Decisão de produto                                                       | Revela que uma pessoa que eu sigo segue aquela conta privada; só expõe seguidores que eu já poderia encontrar seguindo-os |
| Buscar só IDs e carregar usuários só da amostra | Menos dados trafegados                                                   | Máximo de 3 queries por requisição                                                                                        |
| Amostra limitada a 10                           | Evita respostas grandes                                                  | `total` continua exato, só a lista é limitada                                                                             |
| Lógica na API                                   | Regra do repositório: o backend é a única fonte de regra de negócio      | O mobile pode reaproveitar o mesmo endpoint sem reimplementar nada                                                        |

Limite conhecido: a lista B inteira (IDs) é carregada em memória. Para perfis com milhões de seguidores seria melhor fazer a interseção no banco (SQL `INNER JOIN` das duas relações) ou paginar. Para a escala atual o custo é pequeno, pois são só IDs.

## 7. Testes

`FollowServiceTest` (service, com repositórios simulados):

- Retorna só a interseção, na ordem correta.
- Limita a amostra, mas mantém o `total` completo.
- Retorna vazio quando não há interseção, sem consultar usuários.
- Retorna vazio no perfil próprio, sem consultar o repositório de follows.
- Lança erro quando o usuário alvo não existe.

`FollowControllerTest`: confirma que o visualizador usado é o do JWT.

## 8. Como validar

```bash
# API: testes do módulo
pnpm --filter @weunite/api test

# Web
pnpm --filter @weunite/web typecheck
pnpm --filter @weunite/web lint

# Mobile (dentro de apps/mobile)
flutter test
```

Teste manual (web ou mobile): crie 3 contas (eu, Leo, Manoel); eu sigo o Leo, o Leo segue o Manoel; entre no perfil do Manoel logado como eu e confira "Seguido por leo".

## 9. Perguntas prováveis na banca

- **Por que `HashSet`/`Map`?** Porque a operação central é "este ID está no conjunto?", e a tabela hash responde em O(1). Isso reduz o custo de O(n·m) para O(n+m).
- **Qual a complexidade?** Tempo O(|A| + |B|) e memória O(|A|) para o conjunto, mais O(k) para a amostra de k usuários.
- **Por que não pilha ou fila?** A ordem de processamento não importa para decidir pertencimento; essas estruturas resolveriam outro problema (por exemplo, busca em grafo).
- **O que muda para a aplicação?** Cada visita a perfil alheio faz uma chamada extra à API (até 3 queries). O dado é cacheado no frontend e atualizado quando o usuário segue ou deixa de seguir alguém.
- **Por que no backend?** O backend concentra a regra de negócio; web e mobile só consomem o endpoint.
- **Qual o ponto fraco?** Carregar todos os IDs de seguidores em memória; a evolução natural é fazer a interseção no banco.

## 10. Arquivos alterados

Backend:

- `apps/api/src/main/java/com/weunite/api/follow/controller/FollowController.java`
- `apps/api/src/main/java/com/weunite/api/follow/service/FollowService.java`
- `apps/api/src/main/java/com/weunite/api/follow/repository/FollowRepository.java`
- `apps/api/src/main/java/com/weunite/api/follow/dto/MutualFollowersDTO.java` (novo)
- `apps/api/src/test/java/com/weunite/api/service/FollowServiceTest.java`
- `apps/api/src/test/java/com/weunite/api/follow/controller/FollowControllerTest.java`

Mobile:

- `apps/mobile/lib/features/profile/domain/entities/mutual_followers.dart` (novo)
- `apps/mobile/lib/features/profile/presentation/widgets/mutual_followers_row.dart` (novo)
- `apps/mobile/lib/features/profile/domain/repositories/profile_repository.dart`
- `apps/mobile/lib/features/profile/data/profile_remote_data_source.dart`
- `apps/mobile/lib/features/profile/data/profile_repository_impl.dart`
- `apps/mobile/lib/features/profile/presentation/cubit/user_profile_cubit.dart`
- `apps/mobile/lib/features/profile/presentation/cubit/user_profile_state.dart`
- `apps/mobile/lib/features/profile/presentation/screens/user_profile_screen.dart`
- testes em `apps/mobile/test/features/profile/` e fakes atualizados em `test/app/` e `test/features/search/`

Frontend web:

- `apps/web/src/features/profile/components/MutualFollowers.tsx` (novo)
- `apps/web/src/features/profile/components/HeaderProfile.tsx`
- `apps/web/src/features/profile/state/useFollow.ts`
- `apps/web/src/features/profile/api/followerService.ts`
- `apps/web/src/shared/types/follower.type.ts`
- `apps/web/src/features/profile/AGENTS.md`

## 11. Próximos passos

- Tornar os nomes tocáveis no mobile (hoje só o web tem link para o perfil).
- Se a escala crescer, mover a interseção para o banco.
