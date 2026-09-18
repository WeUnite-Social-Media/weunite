# HANDOFF — WeUnite mobile (sessão 2026-09-16/18)

> Documento de transferência de contexto. Foi escrito para que **outro agente/desenvolvedor continue sem ter acesso ao histórico da conversa**. Leia inteiro antes de mudar código. Complemento: `PROGRESS.md` (status resumido por item).

---

## 1. OBJETIVO GERAL DO PROJETO

**Sistema:** WeUnite — rede social esportiva que conecta atletas, empresas/marcas e oportunidades (peneiras, vagas). Monorepo `WeUnite-Social-Media/weunite`:

- `apps/api` — **Spring Boot 3.4.5 / Java 17**, PostgreSQL 15 + Flyway, STOMP/WebSocket para chat, Cloudinary para imagens, JWT RSA para autenticação. Build Maven (`mvnw`).
- `apps/mobile` — **Flutter** (Dart 3.13, Flutter 3.47). Clean Architecture por feature (`data` / `domain` / `presentation`), **Cubits (flutter_bloc)**, **Dio**, **go_router**, `flutter_secure_storage`.
- `apps/web` — React + Vite + TanStack Query (referência de comportamento/visual, chamado de "desktop" pelo usuário).
- `packages/*` — configs TS/eslint e contratos TS (não usados pelo mobile).

**Objetivo atual do desenvolvimento:** deixar o **cliente mobile Flutter** utilizável de ponta a ponta contra a API real: corrigir bugs, completar funcionalidades que estavam só esboçadas (botões sem ação, telas placeholder) e validar tudo no emulador Android com dados reais.

**Solicitação original (resumo cronológico):**

1. O usuário pediu ajuda para instalar Flutter/Docker e rodar o projeto (feito — app roda no emulador contra a API em Docker).
2. Depois pediu QA completo do app; encontrei vários bugs.
3. Depois mandou uma **lista numerada de 18 itens** (pesquisa, posts, perfil, oportunidades, chat…) e, mais tarde, **os itens 19 e 20**.
4. Regras explícitas do usuário (valem para o próximo agente):
   - Lista é **acumulativa**: considerar todos os itens anteriores a cada nova mensagem.
   - **Não quebrar nem remover** o que já funciona.
   - **Não fazer só ajuste visual**: validar funcionamento, backend, persistência e atualização do frontend.
   - **Testar o fluxo completo** antes de considerar um item concluído.
   - Manter comportamento **consistente entre mobile e desktop** quando fizer sentido.
   - Registrar progresso (`PROGRESS.md`) e, perto do limite de contexto, escrever este `HANDOFF.md`.
   - **Commitar e dar push continuamente**, para o time acompanhar.
   - Evitar duplicar lógica; reaproveitar implementação existente antes de criar nova.

---

## 2. LISTA COMPLETA DE REQUISITOS (com status)

Status: `[CONCLUÍDO]` = implementado **e validado no emulador**; `[PRECISA TESTAR]` = implementado, testes automatizados passam, falta validar no app; `[PARCIAL]`; `[PENDENTE]`; `[BLOQUEADO]`.

### 1. Barra de pesquisa na Home — [CONCLUÍDO]
Restaurar busca na Home: usuários, posts, oportunidades; padrão visual do app; loading; estado vazio; navegação ao clicar; não quebrar outras buscas; reaproveitar implementação anterior.
**Feito:** barra na Home abre `/search` (tela dedicada, campo com autofoco, debounce 300 ms igual à web). Seções **Pessoas / Posts / Oportunidades**, com loading, vazio (`Nenhum resultado para "x".`) e erro com "Tentar novamente". Validado no emulador (busca "ana", "futebol", "zzzzz").

### 2. Pesquisa específica de usuários — [CONCLUÍDO]
Buscar por nome e username, mostrar dados suficientes e abrir o perfil.
**Feito:** seção "Pessoas" usa `GET /api/user/search?query=`; mostra avatar, nome, `@username` e chip "Empresa"; toque abre o perfil. (Obs.: a API também casa por e-mail — decisão do time, registrado como risco.)

### 3. Envio de imagem em posts — [CONCLUÍDO]
Selecionar imagem, pré-visualizar, remover/trocar, publicar junto do conteúdo, aparecer no feed e no perfil; validar upload, persistência e carregamento.
**Feito:** `image_picker` + multipart `image` em `POST /posts/create/{userId}`; preview, botão remover e botão **Trocar imagem**; imagem some/aparece corretamente; renderiza no feed e no perfil; persiste após reiniciar. Validado (upload real no Cloudinary). *Obs.: o botão "Trocar imagem" foi adicionado depois e não foi exercitado no emulador (só análise/testes).*

### 4. Post não atualiza no perfil — [CONCLUÍDO]
Post novo deve aparecer no perfil imediatamente, sem refresh manual, e persistir após reiniciar.
**Feito:** barramento `PostEvents` (ver §31). Ao publicar, feed e perfil recarregam juntos; validado com `force-stop` + relaunch.

### 5. Nome do autor no feed — [CONCLUÍDO]
Exibir o nome da pessoa (ex.: "Caio Godas"), username como secundário.
**Feito:** era **bug de backend** (alias SQL colidindo — §6). Corrigido na API; o app já exibia `name`/`@username`.

### 6. Abrir perfil ao clicar no usuário — [CONCLUÍDO]
Foto/nome abrem o perfil no feed, posts, comentários, oportunidades, resultados de busca e listagens. **Exceção: não aplicar dentro do chat.**
**Feito:** helper `openUserProfile` (próprio id → aba `/profile`; outros → `/profile/:userId`). Aplicado em PostCard, comentários (fecha o sheet antes), card/detalhe de oportunidade e resultados de busca. Chat não alterado. Validado no emulador.

### 7. Botão "Salvar oportunidade" — [CONCLUÍDO]
Salvar/remover, indicar visualmente, persistir, sem inconsistência front/back.
**Feito:** `POST /saved-opportunities/toggle/...` + leitura de volta (`isSaved`); ícone preenchido/verde; estado carregado na listagem; persiste após reiniciar. Validado (banco `saved_opportunities`).

### 8. Candidatura a oportunidades — [CONCLUÍDO]
Abrir, candidatar, confirmação visual, ver que já se candidatou, impedir duplicidade, manter após reiniciar.
**Feito:** `POST /subscriber/toggleSubscriber/...` + `isSubscribed`; botão vira "Candidatura enviada" (toque cancela); contador de inscritos ajusta; duplo toque bloqueado por `pendingIds`. Validado: candidatar → cancelar → candidatar (linhas na tabela `subscriber`).

### 9. Faltam informações nas oportunidades — [CONCLUÍDO]
Mostrar tudo que existir no banco; organizar visualmente; não inventar dados.
**Feito:** sheet de detalhe com status (Aberta/Encerrada), empresa (clicável), descrição, habilidades, local, "Inscrições até", "Publicada em", nº de candidatos e ações. **Campos inexistentes no banco (requisitos, modalidade, vagas) não foram inventados** — ver §15.

### 10. Etiquetas de habilidades ilegíveis — [CONCLUÍDO]
Contraste/cores/bordas, claro e escuro.
**Feito:** `chipTheme` com verde-800 sobre verde-100 + borda (~7:1). Só existe tema claro no app. Teste de widget garante a cor e o contraste.

### 11. Edição do perfil — [CONCLUÍDO]
Bio, características, habilidades, foto, banner; persistir, refletir na hora e após reabrir; trocar/remover imagem.
**Feito:** tela "Editar perfil" (nome, username, bio, privado, altura, peso, posição, pé dominante, data de nascimento, habilidades via catálogo, foto e capa, remover capa) → `PUT /user/update/{username}` multipart e `DELETE /user/banner/delete/{username}`; ao salvar, o perfil recarrega. Validado no emulador: alterações gravadas em `athlete_profile` e refletidas na aba "Sobre".

### 12. Chat não atualiza automaticamente — [CONCLUÍDO]
Novas mensagens aparecem sozinhas; conversa e lista atualizam; última mensagem, horário e contador.
**Feito:** `ChatCubit` assina o tópico STOMP de cada conversa; atualiza prévia/horário/badge e reordena. Validado (mensagem enviada pela Ana via script STOMP apareceu sem refresh).

### 13. Tela em branco quando não existem conversas — [CONCLUÍDO]
Estado vazio + ação para procurar usuários/nova conversa.
**Feito:** ícone + "Voce ainda nao possui conversas." + botão "Procurar pessoas" (hoje abre `/search`; **o item 19 pede que passe a abrir a busca exclusiva do chat**). Validado com a conta empresa.

### 14. Mensagens não são marcadas como lidas — [CONCLUÍDO]
Marcar ao visualizar, atualizar backend e contador, sumir indicador, manter estado.
**Feito:** `PUT /conversations/{id}/read/{userId}` ao abrir a conversa e a cada mensagem recebida com a tela aberta; badge zerado local + recarga ao voltar. Validado no banco (`tb_message.is_read`).

### 15. Destaque das conversas no mobile — [CONCLUÍDO]
Item destacado do fundo, como no desktop; avatar, nome, última mensagem, horário, contador; estados lido/não lido.
**Feito:** card branco com borda (verde quando não lida), avatar 24, nome em peso maior, prévia, horário e badge vermelho. Validado visualmente.

### 16. Envio de fotos no chat — [CONCLUÍDO]
Botão, seleção, upload, envio, exibição, persistência.
**Feito:** botão de imagem no compositor → `POST /messages/upload` (retorna `fileUrl`) → mensagem STOMP `type: IMAGE` com a URL; bolha renderiza a imagem. Validado (mensagem id 4 no banco).

### 17. Emojis no chat — [CONCLUÍDO]
Digitados normalmente, armazenados/exibidos corretamente, sem quebrar envio/histórico/preview; se possível um seletor.
**Feito:** conteúdo vai por `jsonEncode` (UTF-8 preservado); adicionado **seletor rápido** com 20 emojis no compositor. Validado (⚽ gravado e exibido).

### 18. PROGRESS.md / continuidade — [CONCLUÍDO]
`PROGRESS.md` criado e atualizado; este `HANDOFF.md` completa o protocolo.

### 19. Iniciar nova conversa pelo chat — [CONCLUÍDO]
A busca **dentro do Chat** deve: pesquisar **apenas usuários**; não exibir posts nem oportunidades; mostrar foto, nome e username; ao clicar, **abrir a conversa** (existente ou nova) e **não** o perfil; botão claro "Nova conversa". Manter a busca geral abrindo perfil nas outras áreas.
**Feito:** `/chat/new` (`NewConversationScreen` + `UserSearchCubit`) busca **apenas usuários** (debounce 300 ms), deixa o próprio usuário de fora e, ao tocar, chama `ChatRepository.startConversationWith(userId)` → `POST /conversations/create` (a API devolve a existente quando já há uma 1:1) e abre `/chat/:id`. Entradas: barra "Buscar pessoas para conversar" no topo da aba Chat, FAB "Nova conversa" e o botão do estado vazio. Validado: criou a conversa 2 (empresa↔atleta), a lista passou a mostrá-la, e repetir a busca abriu a **mesma** conversa.

### 20. Exibir oportunidades criadas pela empresa — [CONCLUÍDO]
Seção "Oportunidades da empresa" deve listar as oportunidades daquela empresa (título, status, modalidade, localização, data, vagas quando existir), abrir detalhes ao clicar, refletir criação/edição/remoção e persistir.
**Feito:** `CompanyOpportunitiesCubit` + `CompanyOpportunitiesList` (`GET /opportunities/get/company/{companyId}`) na aba "Oportunidades" do perfil da empresa e numa seção do `/profile/:userId` quando o perfil é de empresa; toque abre o detalhe. O pull-to-refresh do perfil recarrega a lista (`refreshTick`). Campos inexistentes (modalidade/vagas) continuam não sendo inventados. Validado com 3 oportunidades, incluindo uma criada pela API durante o teste.

### 21. Enviar mensagem pelo perfil de outro usuário — [CONCLUÍDO]
Reutilizar a ação que a web já tem no perfil; abrir a conversa existente ou criar, indo direto para a tela de mensagens.
**Referência na web:** `apps/web/src/features/profile/components/HeaderProfile.tsx` — botão "Conversar" (ícone `Send`, "Abrindo..." enquanto cria), só quando `!isOwnProfile`.
**Feito:** `UserProfileActions` no cabeçalho de `/profile/:userId` com o mesmo par de botões. Usa `startConversationWith` (o mesmo método do item 19) e navega para `/chat/:id`. Validado: abriu a conversa existente com a Ana, com histórico, sem criar duplicata.

### 22. Seguir usuários — [CONCLUÍDO]
Seguir, deixar de seguir, refletir no visual, persistir e manter após recarregar.
**Referência na web:** `HeaderProfile.tsx` / `CardFollowing.tsx` + `useFollowAction` → `POST /follow/followAndUnfollow/{a}/{b}`, status por `GET /follow/get/{a}/{b}` (`status === 'ACCEPTED'`).
**Feito:** mesmo par de rótulos ("Seguir" / "Deixar de seguir") em `UserProfileActions`; `Profile.isFollowing` vem de `GET /follow/get/...` no carregamento e o toggle **relê** o estado (a web deduz pela string da mensagem, o que é frágil); contador de seguidores acompanha, com reversão em caso de erro. Validado: seguir → reabrir o perfil → deixar de seguir, conferindo a tabela `follow`.

### 23. Seguir clubes — [CONCLUÍDO]
**Feito:** é o **mesmo** componente e o mesmo endpoint — a web não diferencia papel no botão de seguir e a API também não (`FollowService` só valida `follower != followed`). Nenhuma solução paralela foi criada. Validado no perfil da empresa.

### 25. Características do atleta no Editar perfil — [CONCLUÍDO]
**Referência na web:** `EditProfile.tsx` (bloco "Informações do atleta", só para `role === 'athlete'`): `height` (m, step 0.01), `weight` (kg), `footDomain` (select Direito/Esquerdo/Ambos), `position` (texto), `birthDate` (`YYYY-MM-DD`), `skills`; e `AboutProfile.tsx`, que mostra Idade, Posição, Pé dominante, Altura (`${height}m`), Peso (`${weight}kg`) com fallback "N/A".
**Feito:** os campos já existiam no mobile, mas com duas divergências reais, agora corrigidas:
- a altura era pedida em **centímetros** e gravada como `182`, que a web renderiza como "182m" — agora é em **metros** (`1.82`);
- o pé dominante era texto livre — virou a mesma seleção de três opções da web, mantendo como opção o valor já salvo para não apagar dado legado ao salvar.
Além disso, a aba **"Sobre"** (que mostrava só a bio) passou a replicar o `AboutProfile`: características do atleta, CNPJ/`N/A` quando for empresa e as habilidades. Validado: 1.82m / 78kg / Destro / Meio-campo aparecendo em "Sobre" e no banco.

### 26. Peneiras — inscrição do atleta — [CONCLUÍDO]
**Referência na web:** o botão de candidatura fica no **rodapé do card** (`OpportunityCard.tsx`) e também no detalhe; visível só quando `isAthlete && !isOwner`; rótulos "Candidatar-se" / "Cancelar candidatura" / "Prazo encerrado" (desabilitado) / "Processando...".
**Causa do problema relatado:** no mobile a ação existia **apenas dentro do detalhe e abaixo da dobra** — era preciso rolar o bottom sheet para vê-la; numa conta empresa ela é escondida de propósito.
**Feito:** `SubscribeButton` (rótulos iguais aos da web) no rodapé do card e, no detalhe, fixado no rodapé do sheet. Validado: candidatura gravada em `subscriber` a partir do perfil da empresa e refletida na aba Oportunidades.

### 27. Peneiras — salvar — [CONCLUÍDO]
**Referência na web:** ícone `Bookmark` no card, só para atleta (`OpportunityCard.tsx`); o detalhe da web **não** tem o botão.
**Feito:** o bookmark já existia na aba Oportunidades (item 7); o que faltava era nas oportunidades listadas **no perfil da empresa** — agora aparecem lá para quem vê como atleta, com `isSaved`/`isSubscribed` resolvidos pela mesma rotina da listagem principal (`_withViewerFlags`). Validado no emulador.

> Observação: não houve item 24 na lista enviada pelo usuário.

### Requisitos/descobertas adicionais (não pedidos, encontrados em QA)
- Feed não fazia pull-to-refresh com poucos posts — **corrigido**.
- `GET /api/user/search` casa também por e-mail — **apenas registrado** (decisão do time).
- `/posts/:postId` (`PostDetailScreen`) é placeholder — **pendente**.
- `UserProfileScreen` (perfil de terceiros) não listava posts — **corrigido** (item 6).
- Pull-to-refresh no perfil de terceiros mostra spinner de tela cheia — **cosmético, pendente**.

---

## 3. O QUE FOI FEITO NESTA SESSÃO (detalhado)

### 3.1 Etiquetas ilegíveis (item 10) — commit `bc5ec0f`
**Errado:** `chipTheme` definia só `fontWeight`; no Material 3 a cor do label acabava resolvida como branca sobre fundo claro → texto invisível.
**Solução:** cores explícitas no tema (`labelStyle`/`secondaryLabelStyle` com `AppColors.accentGreenStrong`, `backgroundColor` `accentGreenSurface`, borda `accentGreen 40%`). Duas cores novas em `AppColors`.
**Por quê:** corrigir no tema conserta todos os chips (oportunidades, detalhe, perfil) de uma vez.
**Teste:** widget test verifica a cor do label e calcula contraste WCAG ≥ 4.5.

### 3.2 Nome do autor no feed (item 5) — commit `ac901c4` (**backend**)
**Errado:** o feed exibia o username no lugar do nome. Causa real: nas queries nativas de feed, os aliases `u.name AS userName` e `u.username AS username` **colidem** — o banco faz case-folding de aliases não citados, os dois viram `username` e o nome se perde na projeção.
**Solução:** alias renomeado para `authorName` nas duas queries (`findFeedSummaries` e `findFeedSummariesByUserId`), getter da projeção `getUserName()` → `getAuthorName()`, ajuste no `PostService` e no fake do teste unitário.
**Por quê:** o teste unitário usava projeção falsa e nunca pegaria colisão de alias; por isso foi adicionado **teste de persistência** (`@DataJpaTest`) que executa as duas queries e compara nome vs username.
**Efeito colateral positivo:** corrige também a web, que consome o mesmo DTO.

### 3.3 Abrir perfil ao tocar no usuário (item 6) — commit `c4e3439`
**Errado:** avatar/nome não eram clicáveis; entidades não carregavam o id do autor; perfil de terceiros só mostrava o cabeçalho.
**Solução:**
- `Post.authorId`, `Comment.authorId`, `Opportunity.companyId` (opcionais, preenchidos pelos DTOs) — opcionais para não quebrar construções existentes em testes.
- `openUserProfile(context, id, {closeCurrentRoute})` + função pura `profileLocationFor` (testada): próprio id → `context.go('/profile')` (troca de aba), outros → `context.push('/profile/:id')`.
- `PostCard` ganhou `enableAuthorNavigation` (desligado dentro do próprio perfil).
- `UserProfileScreen` passou a listar os posts do usuário reutilizando `ProfilePostsCubit(userId:)` e o novo widget `ProfilePostsList`.
- **`PostEvents` passou a ser app-scoped** (criado em `WeUniteMobileApp`), porque rotas empilhadas fora do shell (`/profile/:userId`, `/search`) não enxergam providers criados dentro do `StatefulShellRoute`.

### 3.4 Busca (itens 1 e 2) — commit `3277333` (**backend + mobile**)
**Errado:** não existia busca no mobile; a API não tinha busca de posts.
**Solução backend:** `GET /api/posts/search?query=&page=&size=` — query nativa nova (`searchFeedSummaries`) que filtra `post.text ILIKE %query%` respeitando `deleted = false`, reutilizando a mesma projeção do feed; `PostService.searchPosts` (query vazia ⇒ lista vazia, `size` limitado a 100); teste de persistência cobrindo case-insensitive e post apagado.
**Solução mobile:** `SearchCubit` (debounce 300 ms, `Future.wait` de 3 fontes) + `/search`:
- usuários: `GET /user/search` (via `ProfileRepository.searchUsers`);
- posts: endpoint novo (via `FeedRepository.searchPosts`);
- oportunidades: **filtro no cliente** sobre `GET /opportunities/get` (título, descrição, empresa, local, skills) — **mesma estratégia do `apps/web`**, já que a API não tem busca de oportunidades.
**Limitação conhecida:** nos resultados de busca o post é exibido sem ação de curtir (só comentários), para não duplicar a lógica otimista de likes num terceiro cubit.

### 3.5 Oportunidades: salvar, candidatar, detalhes (itens 7, 8, 9) — commit `5d29a2e`
**Errado:** `onPressed: () {}` no bookmark e no "Candidatar-se"; a listagem não sabia se o usuário salvou/se candidatou; detalhe pobre.
**Solução:**
- `OpportunityRepositoryImpl` recebeu `CurrentUserProvider`; `getOpportunities` busca **uma vez** os conjuntos salvos (`/saved-opportunities/athlete/{id}`) e inscritos (`/subscriber/athlete/{id}`) e marca `isSaved`/`isSubscribed` (falha desses dois não quebra a listagem — conta empresa recebe erro, flags ficam falsas).
- `toggleSaved`/`toggleSubscription` no repositório **não recebem mais `athleteId`** (regra do projeto: id do usuário logado vem do `CurrentUserProvider`) e **retornam o estado final lido da API** (`isSaved`/`isSubscribed`), evitando divergência front/back.
- `OpportunitiesCubit` faz atualização otimista + reconciliação + reversão com mensagem; `pendingIds` bloqueia toque duplo.
- Detalhe (`OpportunityDetailSheet`) reescrito e **ligado ao cubit** via `showOpportunityDetailBound` — antes o sheet recebia uma cópia e os botões não reagiam (bug observado no emulador).
- Ações escondidas para conta empresa (endpoints são athlete-only).

### 3.6 Chat (itens 12, 13, 14, 15, 16, 17) — commit `d187729`
**Errado:** lista sem realtime, sem pull-to-refresh e sem estado vazio; itens sem contraste; mensagens nunca marcadas como lidas (badge preso); sem envio de imagem; sem seletor de emoji.
**Solução:**
- `ChatCubit` agora assina `watchConversation(id)` de **todas** as conversas carregadas; ao receber mensagem atualiza prévia/horário/tipo/badge e reordena (mais recente primeiro). Recebe `currentUserId` (vindo do `AuthCubit` no router) só para decidir se a mensagem é do outro lado.
- `Conversation` ganhou `lastMessageAt` e `lastMessageType` (prévia "Imagem"/"Arquivo").
- `ConversationCubit.start()` chama `markAsRead()`; também marca ao receber mensagem com a tela aberta. Falha é silenciosa (read receipt é best-effort).
- Lista redesenhada (cards, borda verde quando não lida, badge vermelho, horário relativo `formatConversationTime`), `RefreshIndicator` e estado vazio com CTA.
- Imagem: `POST /messages/upload` devolve só a URL (não cria a mensagem) → o app envia a mensagem por STOMP com `type: IMAGE`; `SendMessageRequestDto` ganhou o campo `type`; bolha renderiza `Image.network` com loading/erro.
- Emoji: seletor simples (sem dependência nova) que insere no ponto do cursor.

### 3.7 Edição de perfil (item 11) + base dos itens 19/20 — commit `19b6435`
- `UserDto`/`Profile` ganharam `isPrivate`, `height`, `weight`, `footDomain`, `position`, `birthDate`, `skills`.
- `UpdateUserRequestDto` (novo) monta o JSON do part `user` — só envia campos preenchidos (a API mantém o valor atual em `null` e limpa a bio com string vazia).
- `EditProfileCubit`/`EditProfileScreen`: formulário completo, catálogo de skills (`GET /opportunities/skills`), seleção de foto/capa (10 MB), remoção de capa, salvar com estado `isSaving` e erro; ao concluir, `ProfileCubit.loadMyProfile()`.
- `SkillDto` ganhou `toJson` (necessário porque `UserDto` é serializado no cache de sessão).
- Base dos itens 19/20 (repositórios + data sources), sem UI.

---

## 4. ARQUIVOS ALTERADOS (nesta sessão, branch `feat/mobile-backlog`)

> Use `git show --stat <commit>` para o detalhe fino. Lista por área:

**Backend (`apps/api`)**
- `src/main/java/com/weunite/api/posts/repository/PostRepository.java` — alias `authorName` nas 2 queries de feed; **nova** query `searchFeedSummaries`.
- `src/main/java/com/weunite/api/posts/repository/FeedPostSummaryProjection.java` — `getUserName()` → `getAuthorName()`.
- `src/main/java/com/weunite/api/posts/service/PostService.java` — usa `getAuthorName()`; **novo** `searchPosts(...)`.
- `src/main/java/com/weunite/api/posts/controller/PostController.java` — **novo** `GET /posts/search`.
- `src/test/java/com/weunite/api/service/PostServiceTest.java` — fake da projeção atualizado.
- `src/test/java/com/weunite/api/posts/domain/PostInteractionPersistenceTest.java` — 2 testes novos (nome vs username; busca por texto).

**Mobile — core**
- `lib/core/theme/app_colors.dart` — `accentGreenStrong`, `accentGreenSurface`.
- `lib/core/theme/app_theme.dart` — `chipTheme` legível.
- `lib/core/contracts/user_dto.dart` — novos campos do usuário.
- `lib/core/contracts/skill_dto.dart` — `toJson`.
- `lib/core/network/image_media_type.dart` — **novo** (extraído do feed; usado por posts, chat e perfil).
- `lib/app/app.dart` — `PostEvents` app-scoped + provider.
- `lib/app/router.dart` — rota `/search`; `ProfilePostsCubit` na sessão; `ChatCubit(currentUserId:)`.
- `lib/app/bootstrap.dart` — `OpportunityRepositoryImpl` recebe `CurrentUserProvider`.

**Mobile — feed**
- `data/feed_remote_data_source.dart` — `searchPosts`, `getUserPosts`, imagem no `createPost`, helper movido para core.
- `data/feed_repository_impl.dart`, `domain/repositories/feed_repository.dart` — `getMyPosts`, `getUserPosts`, `searchPosts`, `createPost(imagePath)`.
- `domain/entities/post.dart` / `comment.dart` — `authorId`.
- `domain/post_events.dart` — **novo** (barramento).
- `presentation/cubit/feed_cubit.dart` — eventos, publicação de mudanças.
- `presentation/cubit/create_post_cubit.dart` + `create_post_state.dart` — imagem.
- `presentation/widgets/create_post_sheet.dart` — picker, preview, remover/trocar, `showCreatePostSheet`.
- `presentation/widgets/comments_sheet.dart` — `showCommentsSheet`, evento de comentário, autor clicável.
- `presentation/widgets/post_card.dart` — imagem com limite/placeholder, autor clicável.
- `presentation/screens/feed_screen.dart` — barra de busca, `AlwaysScrollableScrollPhysics`, helpers de sheet.

**Mobile — profile**
- `data/profile_remote_data_source.dart` — `searchUsers`, `updateUser`, `deleteBanner`, `getSkills`.
- `data/profile_models.dart` — mapeia novos campos.
- `data/update_profile_models.dart` — **novo**.
- `data/profile_repository_impl.dart`, `domain/repositories/profile_repository.dart` — `searchUsers`, `updateMyProfile`, `deleteMyBanner`, `getAvailableSkills`.
- `domain/entities/profile.dart` — novos campos.
- `presentation/cubit/profile_posts_cubit.dart` (+ state) — **novo** (posts do perfil, `userId` opcional).
- `presentation/cubit/edit_profile_cubit.dart` (+ state) — **novo**.
- `presentation/navigation/open_user_profile.dart` — **novo**.
- `presentation/widgets/profile_posts_list.dart` — **novo**.
- `presentation/screens/profile_screen.dart` — aba Posts real, botão "Editar perfil", pull-to-refresh.
- `presentation/screens/user_profile_screen.dart` — posts do usuário, refresh, paginação.
- `presentation/screens/edit_profile_screen.dart` — **novo**.

**Mobile — opportunities**
- `data/opportunity_models.dart` — `createdAt`, `SavedOpportunityDto`, `SubscriberDto`.
- `data/opportunity_remote_data_source.dart` — salvos, inscrições, `isSaved`, `isSubscribed`, `getCompanyOpportunities`.
- `data/opportunity_repository_impl.dart`, `domain/repositories/opportunity_repository.dart` — flags, toggles sem `athleteId`, `getCompanyOpportunities`.
- `domain/entities/opportunity.dart` — `companyId`, `createdAt`, `isSaved`, `isSubscribed`, `copyWith`.
- `presentation/cubit/opportunities_cubit.dart` (+ state) — toggles otimistas, `pendingIds`.
- `presentation/widgets/opportunity_card.dart` — card + detalhe completo + helpers (`formatOpportunityDate`, `isOpportunityClosed`).
- `presentation/widgets/opportunity_detail_route.dart` — **novo** (sheet ligado ao cubit).
- `presentation/screens/opportunities_screen.dart` — ações, `pendingIds`, gate de atleta.

**Mobile — chat**
- `data/chat_models.dart` — `type` no `SendMessageRequestDto`; `lastMessageAt`/`lastMessageType`.
- `data/chat_realtime_client.dart` — `sendMessage(type:)`.
- `data/chat_remote_data_source.dart` — `markAsRead`, `uploadAttachment`, `createConversation`.
- `data/chat_repository_impl.dart`, `domain/repositories/chat_repository.dart` — `sendImage`, `markConversationAsRead`, `startConversationWith`.
- `domain/entities/conversation.dart` — `lastMessageAt`, `lastMessageType`, `copyWith`.
- `presentation/cubit/chat_cubit.dart` — realtime da lista, ordenação, `markAsRead`.
- `presentation/cubit/conversation_cubit.dart` (+ state) — `markAsRead`, `sendImage`, `readTick`.
- `presentation/screens/conversations_screen.dart` — redesign, refresh, vazio.
- `presentation/screens/conversation_screen.dart` — bolha de imagem, botões de imagem/emoji.

**Mobile — search (novo módulo)**
- `presentation/cubit/search_cubit.dart` (+ state), `presentation/screens/search_screen.dart`, `presentation/widgets/home_search_bar.dart`.

**Testes alterados/criados** — ver §25.

**Documentação** — `apps/mobile/AGENTS.md`, `apps/mobile/README.md` (imagens em post, PostEvents, posts do perfil), `PROGRESS.md`, este `HANDOFF.md`.

---

## 5. ARQUIVOS CRIADOS (resumo de finalidade)

| Arquivo | Para que serve | Quem usa | Pendências |
|---|---|---|---|
| `lib/core/network/image_media_type.dart` | Content-type de imagem por extensão (Cloudinary rejeita octet-stream) | feed, chat, profile (data) | — |
| `lib/features/feed/domain/post_events.dart` | Barramento de eventos de post (criado/alterado/comentado) | `FeedCubit`, `ProfilePostsCubit`, sheets | — |
| `lib/features/profile/presentation/navigation/open_user_profile.dart` | Decide e executa navegação para perfil | feed, comentários, oportunidades, busca | — |
| `lib/features/profile/presentation/widgets/profile_posts_list.dart` | Lista de posts embutida no perfil | `ProfileScreen`, `UserProfileScreen` | — |
| `lib/features/profile/presentation/cubit/profile_posts_cubit.dart` (+state) | Posts de um perfil (próprio ou de terceiro) | telas de perfil | — |
| `lib/features/profile/presentation/cubit/edit_profile_cubit.dart` (+state) | Estado do formulário de perfil | `EditProfileScreen` | validar no emulador |
| `lib/features/profile/presentation/screens/edit_profile_screen.dart` | Formulário de edição | `ProfileScreen` | validar no emulador |
| `lib/features/profile/data/update_profile_models.dart` | Body do part `user` do update | `ProfileRemoteDataSource` | — |
| `lib/features/opportunities/presentation/widgets/opportunity_detail_route.dart` | Abre o detalhe ligado ao cubit | `OpportunitiesScreen` | — |
| `lib/features/search/**` | Busca geral (Home) | rota `/search` | — |
| `apps/mobile/test/**` (vários) | Testes novos | CI/local | — |

---

## 6. BACKEND (o que mudou)

Somente o módulo `posts`:

- **Repository** (`PostRepository.java`): correção de alias (`authorName`) + nova query nativa `searchFeedSummaries(viewerId, query, pageable)` (mesma projeção do feed; campos de repost como `NULL` tipado).
- **Projection** (`FeedPostSummaryProjection.java`): `getAuthorName()`.
- **Service** (`PostService.java`): `searchPosts(viewerId, query, page, size)`; usa `getAuthorName()`.
- **Controller** (`PostController.java`): `GET /api/posts/search`.
- **Testes**: `PostInteractionPersistenceTest` (H2 em modo PostgreSQL) cobre alias e busca; `PostServiceTest` atualizado.

Nada foi alterado em: segurança/JWT, WebSocket/STOMP, Cloudinary, migrations, DTOs de chat/oportunidade, middlewares.
**Atenção:** o `spotless:apply` no Windows reescreve ~250 arquivos só por fim de linha — **não commitar** esse ruído (ver §31).

---

## 7. API / ENDPOINTS (usados, criados, alterados)

> Base: `http://localhost:8080/api`. Autenticação: `Authorization: Bearer <jwt>`.

**Criado**
- `GET /posts/search?query=&page=&size=` — busca posts por texto. Resposta: array de `FeedPostSummaryDTO`. Query vazia ⇒ `[]`. Usado por `FeedRemoteDataSource.searchPosts` (tela `/search`).

**Alterado (comportamento)**
- `GET /posts/get` e `GET /posts/get/user/{userId}` — passaram a devolver `user.name` correto (antes vinha o username).

**Usados pelo mobile (inalterados)**
- Auth: `POST /auth/login`, `POST /auth/signup`, `POST /auth/signup/company`, `POST /auth/verify-email/{email}`.
- Posts: `GET /posts/get`, `GET /posts/get/user/{userId}`, `POST /posts/create/{userId}` (multipart `post` + `image` opcional).
- Likes/comentários: `POST /likes/toggleLike/{userId}/{postId}`, `GET /comment/get/{postId}`, `POST /comment/create?userId=&postId=`.
- Usuários/perfil: `GET /user/search?query=`, `GET /user/id/{id}`, `GET /user/username/{username}`, `PUT /user/update/{username}` (multipart `user` + `profileImage`/`bannerImage`), `DELETE /user/banner/delete/{username}`, `GET /follow/{followers,following}/{userId}/count`, `POST /follow/followAndUnfollow/{a}/{b}`.
- Oportunidades: `GET /opportunities/get`, `GET /opportunities/get/company/{companyId}`, `GET /opportunities/skills`, `POST /opportunities/create/{companyId}` (multipart, usado só no QA via curl).
- Salvos/candidaturas: `POST /saved-opportunities/toggle/{athleteId}/{opportunityId}`, `GET /saved-opportunities/athlete/{athleteId}`, `GET /saved-opportunities/isSaved/{a}/{o}`, `POST /subscriber/toggleSubscriber/{athleteId}/{opportunityId}`, `GET /subscriber/athlete/{athleteId}`, `GET /subscriber/isSubscribed/{a}/{o}`.
- Chat REST: `GET /conversations/user/{userId}`, `GET /conversations/{id}/user/{userId}`, `GET /conversations/{id}/messages/{userId}`, `PUT /conversations/{id}/read/{userId}`, `POST /conversations/create`, `POST /messages/upload` (params `file`, `conversationId`, `senderId` → `{fileUrl, fileType}`).
- Chat STOMP: conecta em `ws://host:8080/ws/websocket` (SockJS), header `Authorization: Bearer ...` no CONNECT; envia em `/app/chat.sendMessage` (`{conversationId, senderId, content, type}`); recebe em `/topic/conversation/{id}`. Existe `/app/chat.markAsRead` (não usado; o app usa o REST).

**Pontos de atenção**
- `GET /user/search` casa por **e-mail** também (possível exposição).
- `POST /messages/upload` **não cria** a mensagem; só devolve a URL.
- `POST /conversations/create` é idempotente para 1:1 (devolve a existente).
- `ChatController.sendMessage` confia no `senderId` do payload (risco documentado na Fase 8 do plano anterior; **não corrigido**, exige decisão do time).

---

## 8. BANCO DE DADOS

**Nenhuma mudança de schema/migration nesta sessão.** Tabelas relevantes (nomes reais):

- `tb_user` (id, name, username, email_verified, verification_token, profile_img, banner_img, bio, is_private…), `tb_role`, `tb_user_roles`, `athlete_profile`, `company_profile`.
- `post` (id, user_id, text, image_url, deleted, created_at, updated_at) → `tb_post_like`, `comment`, `tb_post_repost`.
- `opportunity` (id, title, description, location, date_end, deleted, created_at, company_id) → `opportunity_skills` ↔ `skill`, `subscriber` (candidaturas), `saved_opportunities`.
- `tb_conversation` ↔ `tb_conversation_participants` ↔ `tb_message` (id, conversation_id, sender_id, content, is_read, type, deleted, edited, created_at).
- `follow`, `tb_notification`, `report`, `user_presence`.

**Relacionamentos-chave:** `tb_user → post`, `tb_user(company) → opportunity` (coluna `company_id`, é o **campo que identifica a empresa dona** — usado pelo `GET /opportunities/get/company/{id}`), `tb_user ↔ subscriber ↔ opportunity`, `tb_user ↔ saved_opportunities ↔ opportunity`, `tb_conversation ↔ tb_message`, `tb_user ↔ tb_conversation_participants`.

---

## 9. MIGRATIONS / SQL

Nenhuma migration criada nesta sessão. As existentes ficam em `apps/api/src/main/resources/db/migration` e rodam via Flyway na subida da API. **Não executar nada manualmente.**

---

## 10. AUTENTICAÇÃO E USUÁRIO ATUAL

- Login `POST /auth/login` → `{jwt, expiresIn}`; o app guarda token + instante de expiração em `flutter_secure_storage` (`SecureTokenStorage`) e o `AppUser` serializado.
- `AuthCubit` (único cubit acima do `MaterialApp`) restaura a sessão no boot e reage a expiração.
- `ApiClient` (Dio) injeta o token; em **401 de rota autenticada** limpa o token e emite `SessionEvents.onExpired` → `AuthCubit` vai para `unauthenticated` com "Sessão expirada. Entre novamente." (401 em `/auth/login` é credencial inválida, não expira sessão).
- **Regra do projeto:** telas/cubits **não** leem `AuthCubit.state.user?.id` para agir; quem resolve o id é o `CurrentUserProvider` (implementado sobre `AuthRepository`), injetado nos repositórios. Exceções conscientes: alinhamento das bolhas no chat, `ChatCubit(currentUserId:)` (só compara remetente) e `openUserProfile` (decide a rota).
- **Não existe** `/auth/refresh` na API.

---

## 11. CHAT — COMO FUNCIONA HOJE

- **Carregar conversas:** `ChatCubit.loadConversations()` → `GET /conversations/user/{userId}`; o repositório resolve o "outro participante" (primeiro id de `participantIds` diferente do meu) e busca `GET /user/id/{id}` (dedup por id, 404 vira peer nulo).
- **Realtime da lista:** para cada conversa o cubit assina `/topic/conversation/{id}`; ao chegar mensagem atualiza prévia/horário/tipo, incrementa badge se for do outro e reordena. Assinaturas são canceladas no `close()`.
- **Conversa aberta:** `ConversationCubit.start()` assina o tópico, carrega histórico (`GET /conversations/{id}/messages/{userId}`) e marca como lida. Mensagens são mescladas por `id` (sem duplicar a própria mensagem que volta pelo tópico). Em reconexão (`ChatRealtimeReconnected`) recarrega o histórico.
- **Enviar texto:** STOMP `/app/chat.sendMessage` com `jsonEncode` (aspas/barras/quebras/emoji seguros), `type: TEXT`.
- **Enviar imagem:** `POST /messages/upload` (multipart) → URL → STOMP com `type: IMAGE` e a URL como `content`.
- **Lidas:** `PUT /conversations/{id}/read/{userId}` ao abrir e a cada mensagem recebida com a tela aberta; a lista zera o badge local e recarrega ao voltar.
- **Contador:** vem de `ConversationDTO.unreadCount` no load e é incrementado localmente pelo realtime.
- **Nova conversa:** `ChatRepository.startConversationWith(userId)` → `POST /conversations/create` (devolve existente se houver). **A UI ainda não existe (item 19).**
- **Busca do chat:** **ainda não implementada** — hoje o estado vazio manda para `/search` (busca geral, que mostra posts e abre perfil). É exatamente o que o item 19 manda corrigir.
- **Componentes:** `conversations_screen.dart`, `conversation_screen.dart`, `conversation_route_screen.dart`, `chat_cubit.dart`, `conversation_cubit.dart`, `conversation_lookup_cubit.dart`, `chat_realtime_client.dart`, `chat_remote_data_source.dart`, `chat_repository_impl.dart`, `chat_models.dart`.
- **Problemas conhecidos:** sem edição/remoção de mensagem na UI; sem indicador de "digitando"; sem paginação de histórico; `senderId` confiável só no cliente (ver §7).

---

## 12. PESQUISAS (três coisas diferentes)

1. **Pesquisa da Home (`/search`)** — `HomeSearchBar` (topo do feed) → `SearchScreen` + `SearchCubit`. Busca **usuários + posts + oportunidades**. Clique em pessoa → perfil. **Implementada e validada.**
2. **Pesquisa de usuários (dentro da Home)** — é a seção "Pessoas" da tela acima; fonte `GET /user/search`.
3. **Pesquisa do Chat (item 19)** — **a fazer**: só usuários, sem posts/oportunidades, clique **abre a conversa** (existente ou nova), nunca o perfil; deve ter CTA "Nova conversa". **Não reutilizar `SearchCubit`** como está (ele busca as três fontes): criar um cubit/tela próprios no módulo `chat`, usando `ProfileRepository.searchUsers` + `ChatRepository.startConversationWith`.

---

## 13. POSTS

Criação: sheet do FAB do feed → `CreatePostCubit.submit` → `POST /posts/create/{userId}` multipart (`post` JSON + `image` opcional) → Cloudinary. Feed: `GET /posts/get` paginado (`kFeedPageSize = 20`), pull-to-refresh e scroll infinito. Perfil: `GET /posts/get/user/{userId}` via `ProfilePostsCubit`. Sincronização feed↔perfil por `PostEvents` (criado → recarrega ambos; curtida/comentário → atualiza o mesmo post nas duas listas). Pendente: `/posts/:postId` (detalhe) é placeholder; curtir não está disponível nos resultados de busca.

---

## 14. PERFIL

Próprio perfil: cabeçalho + abas Posts/Sobre (+ Oportunidades para empresa), botão "Editar perfil", pull-to-refresh, paginação. Edição (item 11) cobre nome, username, bio, privacidade, características do atleta, habilidades, foto e capa (com remoção). Persistência é do backend; após salvar o app recarrega o perfil. **Falta validar no emulador** e **a aba "Oportunidades" ainda é texto fixo (item 20)**. Observação: o `AppUser` em cache (`AuthCubit`) não é atualizado após editar nome/foto — as telas usam `ProfileCubit`, mas se algo passar a depender do `AppUser`, isso precisará de refresh.

---

## 15. OPORTUNIDADES

Listagem (`GET /opportunities/get`) já marcada com `isSaved`/`isSubscribed`; card mostra empresa (clicável), descrição, chips de habilidade, data final e nº de inscritos; detalhe mostra status Aberta/Encerrada, empresa, descrição, habilidades, local, "Inscrições até", "Publicada em", candidatos, salvar e candidatar/cancelar. Criação de oportunidade **não existe no mobile** (foi feita via API no QA). **Campos que o usuário pediu e o banco não tem: modalidade, requisitos, quantidade de vagas, período** — não foram inventados; se forem necessários, exigem mudança de modelo/migração no backend (decisão do time).
**"Oportunidades da empresa" (item 20):** `GET /opportunities/get/company/{companyId}`; o vínculo é a coluna `opportunity.company_id`. Repositório pronto; falta cubit + UI nas abas de perfil (próprio perfil de empresa e `/profile/:userId` de empresa).

---

## 16. UPLOAD DE ARQUIVOS / IMAGENS

Tudo vai para **Cloudinary**, sempre pela API (o app nunca fala com o Cloudinary direto). Limite do backend: **10 MB** (`spring.servlet.multipart.max-file-size`); o app reduz para 2048 px / qualidade 85 antes de enviar e recusa acima de 10 MB com mensagem.
- **Post:** `POST /posts/create/{userId}`, part `image` → `post.image_url`.
- **Chat:** `POST /messages/upload` → `{fileUrl}` → mensagem `IMAGE`.
- **Foto de perfil / capa:** `PUT /user/update/{username}`, parts `profileImage` / `bannerImage`; remoção da capa por `DELETE /user/banner/delete/{username}`.
- Erros viram `AppException` com mensagem amigável (`mapDioError`).

---

## 17. GERENCIAMENTO DE ESTADO

`flutter_bloc` (Cubits). Cubits de sessão criados no `StatefulShellRoute` com `ValueKey(user.id)`: `FeedCubit`, `OpportunitiesCubit`, `ChatCubit`, `ProfileCubit`, `ProfilePostsCubit`. Cubits de rota: `ConversationCubit`, `UserProfileCubit`, `ProfilePostsCubit(userId)`, `SearchCubit`, `EditProfileCubit`, `CommentsCubit`, `CreatePostCubit`. Repositórios são singletons via `MultiRepositoryProvider` (bootstrap). **Sem React Query/cache HTTP**: a "invalidação" é recarregar pelo cubit. Atualização otimista em curtidas, salvar e candidatar (com reversão). `PostEvents` sincroniza listas de posts. Estados separam `loadErrorMessage` (tela cheia) de `actionErrorMessage` (SnackBar).

---

## 18. COMPONENTES IMPORTANTES

| Arquivo | Função | Onde é usado | Alterações | Pendências |
|---|---|---|---|---|
| `feed/presentation/widgets/post_card.dart` | Card de post | feed, perfil, busca | imagem, autor clicável | — |
| `feed/presentation/widgets/create_post_sheet.dart` | Criar post | FAB do feed | imagem/preview/trocar | trocar imagem não testado no app |
| `feed/presentation/widgets/comments_sheet.dart` | Comentários | feed, perfis, busca | helper + evento + autor clicável | — |
| `opportunities/presentation/widgets/opportunity_card.dart` | Card + detalhe | oportunidades, busca | salvar/candidatar/detalhe | — |
| `chat/presentation/screens/conversations_screen.dart` | Lista de conversas | aba Chat | redesign, refresh, vazio | precisa da busca do item 19 |
| `chat/presentation/screens/conversation_screen.dart` | Conversa | rota `/chat/:id` | imagem, emoji | sem editar/apagar |
| `profile/presentation/screens/profile_screen.dart` | Perfil próprio | aba Perfil | posts, editar | aba Oportunidades (item 20) |
| `profile/presentation/screens/user_profile_screen.dart` | Perfil de terceiros | `/profile/:userId` | posts | oportunidades se for empresa (item 20) |
| `search/presentation/screens/search_screen.dart` | Busca geral | `/search` | novo | sem curtir nos posts |

---

## 19. ROTAS / NAVEGAÇÃO (go_router — `lib/app/router.dart`)

`/splash`, `/login`, `/signup`; shell com abas `/feed`, `/opportunities`, `/chat`, `/profile`; empilhadas: `/chat/:conversationId`, `/search`, `/profile/:userId`, `/posts/:postId` (placeholder). `redirect` baseado no `AuthCubit`. **Cuidado:** rotas empilhadas **não** enxergam os cubits do shell (por isso `PostEvents` é app-scoped e o detalhe de oportunidade recebe callbacks).

---

## 20. MOBILE × DESKTOP

O desktop (`apps/web`) é a referência. Diferenças tratadas: **lista de conversas** — no mobile os itens tinham quase a cor do fundo; agora usam card branco + borda (verde quando não lida) + badge, aproximando do `ConversationList.tsx`. Ainda não validado em telas maiores/tablet. A busca da web só pesquisa usuários; o mobile ganhou busca mais ampla na Home (pedido do item 1).

---

## 21. DESIGN / ESTILOS

Tema claro único (`AppTheme.light`). Tokens em `AppColors` (+ `accentGreenStrong`, `accentGreenSurface`). Cards `WeUniteCard` (borda `border`, raio 12). Chips legíveis. Estados: loading (`CircularProgressIndicator`), vazio (ícone + texto + CTA), erro (texto + "Tentar novamente"), não lida (borda/realce/badge vermelho). Imagens com `loadingBuilder`/`errorBuilder` e altura máxima (420 no post, 260 no chat).

---

## 22. BUGS ENCONTRADOS (todos)

1. **Nome do autor = username no feed** — causa: colisão de alias SQL. **Corrigido** (`PostRepository`, `FeedPostSummaryProjection`, `PostService`).
2. **Pull-to-refresh do feed não funcionava com poucos posts** — causa: `ListView` com controller não é "primary". **Corrigido** (`physics: AlwaysScrollableScrollPhysics`).
3. **Aba Posts do perfil era placeholder** — **corrigido**.
4. **Botão salvar oportunidade sem ação** — **corrigido**.
5. **Botão candidatar sem ação** — **corrigido**.
6. **Detalhe da oportunidade não reagia aos toggles** (cópia sem cubit) — **corrigido** com `showOpportunityDetailBound`.
7. **Chips ilegíveis** — **corrigido**.
8. **Chat sem realtime na lista / sem pull-to-refresh / tela em branco** — **corrigido**.
9. **Mensagens nunca marcadas como lidas** — **corrigido**.
10. **`MessageDto` com campo `type` duplicado** (erro meu durante a edição) — **corrigido**.
11. **`SkillDto` sem `toJson`** quebrando `UserDto.toJson` — **corrigido**.
12. **Busca de posts inexistente na API** — **corrigido** (endpoint novo).
13. **`GET /user/search` casa e-mail** — **pendente/decisão do time**.
14. **`/posts/:postId` placeholder** — **pendente**.
15. **Spinner de tela cheia no refresh do perfil de terceiros** — **pendente (cosmético)**.
16. **Fuso do emulador diferente do host** (mensagens mostram horário deslocado) — **não é bug do app**.

---

## 23. BUGS CORRIGIDOS
Itens 1–12 da lista acima (com testes automatizados cobrindo 1, 2, 4, 5, 6, 7, 8, 9, 12).

## 24. BUGS PENDENTES (por prioridade)
1. Item 19 (busca do chat abre perfil e mostra posts) — **é requisito ativo**.
2. Item 20 (oportunidades da empresa não listadas) — **requisito ativo**.
3. `/posts/:postId` placeholder.
4. Spinner de tela cheia no refresh do perfil de terceiros.
5. `user/search` casando e-mail (decisão do time).
6. `ChatController` confia no `senderId` do payload (backend, decisão do time).

---

## 25. TESTES REALIZADOS

**Automatizados (mobile): `flutter test` → 197 testes, todos passando.** `flutter analyze` → 0 issues. Arquivos de teste tocados/criados: `core/theme/app_theme_test.dart` (novo), `features/profile/profile_posts_cubit_test.dart` (novo), `features/profile/open_user_profile_test.dart` (novo), `features/search/search_cubit_test.dart` (novo), `features/opportunities/opportunities_cubit_test.dart` (novo), `features/chat/chat_cubit_test.dart` (novo), `features/feed/feed_remote_data_source_test.dart` (novo), `features/feed/create_post_cubit_test.dart` (ampliado), fakes atualizados em `app/router_test.dart`, `app/session_scoped_state_test.dart`, `features/feed/*`, `features/chat/*`, `fixtures/api_payloads.dart`.

**Automatizados (API):** `PostInteractionPersistenceTest` (10) + `PostServiceTest` (10) — **passando** (rodados no container).

**Manuais no emulador (todos PASSOU, salvo indicação):**
- Login, senha errada, sessão restaurada, sessão expirada — PASSOU.
- Curtir (inclusive toque duplo), comentar, criar post, abas preservadas — PASSOU.
- Post com imagem: seleção, preview, publicação, feed, perfil, persistência — PASSOU.
- Nome do autor no feed — PASSOU.
- Abrir perfil pelo feed (próprio e de terceiro), pelo comentário e pela oportunidade — PASSOU.
- Busca: usuários, posts, oportunidades, vazio — PASSOU.
- Salvar oportunidade + persistência — PASSOU. Candidatar/cancelar/recandidatar — PASSOU. Detalhe — PASSOU.
- Chat: atualização automática da lista, marcar como lida (banco), estado vazio, destaque visual, envio de imagem, emoji — PASSOU.
- Edição de perfil (item 11): alterar características, salvar, conferir no banco e na aba "Sobre" — PASSOU.
- Nova conversa pelo chat (item 19): busca só mostra pessoas, abre a conversa, cria quando não existe, não duplica ao repetir, lista atualiza — PASSOU.
- Oportunidades da empresa (item 20): lista no perfil próprio e no perfil de terceiros, detalhe, refresh após criar pela API — PASSOU.
- Conversar pelo perfil (item 21): abriu a conversa existente — PASSOU.
- Seguir/deixar de seguir usuário e empresa (itens 22 e 23), com persistência ao reabrir — PASSOU.
- "Sobre" com características e altura em metros (item 25) — PASSOU.
- Candidatar-se pelo card, inclusive no perfil da empresa (itens 26 e 27) — PASSOU.
- **NÃO TESTADO:** botão "Trocar imagem" no post, qualquer coisa em tablet/tela grande, web.

---

## 26. CHECKLIST PARA O PRÓXIMO AGENTE (testes a fazer)

Pré-requisitos: API no ar (§28), emulador `Pixel_8_API_35`, app rodando, login `caiogodas` / `WeUnite@2026`.

**Item 11 (perfil):**
- [ ] Perfil → "Editar perfil" → alterar bio, altura, peso, posição, perna, data de nascimento, marcar habilidades → Salvar.
- [ ] Voltar: dados aparecem na aba "Sobre"/cabeçalho; conferir no banco (`tb_user`, `athlete_profile`).
- [ ] Trocar foto e capa (galeria); conferir URLs do Cloudinary no banco.
- [ ] Remover capa → conferir `banner_img` nulo.
- [ ] Fechar e abrir o app: mudanças persistem.

**Item 19 (nova conversa):**
- [ ] Aba Chat → busca do chat → digitar "ana" → aparecem **apenas usuários**.
- [ ] Clicar na Ana: abre a conversa existente (id 1), **não** o perfil.
- [ ] Repetir com a empresa (`marcateste`), que não tem conversa: cria e abre conversa nova; conferir `tb_conversation`.
- [ ] Voltar: a conversa nova aparece na lista.

**Item 20 (oportunidades da empresa):**
- [ ] Logar como `marcateste` → Perfil → aba "Oportunidades": lista "Peneira sub-20 QA".
- [ ] Como `caiogodas`, abrir `/profile/3` (perfil da empresa) → seção de oportunidades.
- [ ] Criar outra oportunidade pela API e conferir que aparece após refresh.
- [ ] Abrir o detalhe a partir dessa lista.

**Regressão rápida:** feed carrega, curtir, comentar, criar post, busca, chat recebe mensagem em tempo real.

---

## 27. ERROS / LOGS RELEVANTES

- `The name 'type' is already defined` (chat_models) — erro meu de edição, **resolvido**.
- `The method 'toJson' isn't defined for the type 'SkillDto'` — **resolvido**.
- `Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]` no script STOMP de teste — causado por **JWT antigo** (as chaves JWT foram rotacionadas durante o QA de sessão expirada). Gerar token novo resolve.
- `Exception attempting to connect to the VM Service` no `flutter run` — o processo ficou preso; matar e rodar de novo resolve.
- "Pixel Launcher isn't responding" no emulador — ANR do launcher, não do app.
- No log da API aparecem erros `23505` durante os testes de unicidade — **esperado** (testes de constraint).

---

## 28. COMANDOS IMPORTANTES

```powershell
# API (a partir de C:\Users\Caio\weunite-mobile-agent, com .env na raiz)
docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api up -d --force-recreate api
docker logs weunite-api --tail 50

# Testes da API (container separado)
docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api run --rm --no-deps -T --entrypoint mvn api -B test "-Dtest=PostInteractionPersistenceTest"

# Banco
docker exec weunite-postgres psql -U postgres -d weunite -c "select * from tb_message"

# Mobile
cd apps/mobile
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # após mexer em @JsonSerializable
dart format lib test
flutter analyze
flutter test
flutter run -d emulator-5554 --dart-define-from-file=config/dev.json

# Emulador
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_8_API_35
```

---

## 29. DEPENDÊNCIAS

| Pacote | Versão | Motivo | Onde |
|---|---|---|---|
| `image_picker` | ^1.2.3 | escolher imagem da galeria | criar post, chat, editar perfil |

Nada foi removido. `go_router`, `flutter_bloc`, `dio`, `stomp_dart_client`, `json_annotation`, `intl`, `flutter_secure_storage`, `bloc_test` já existiam.

---

## 30. VARIÁVEIS DE AMBIENTE (apenas nomes)

Raiz do repo, arquivo `.env` (gitignored): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DOCKER_*`, `API_HOST_PORT`, `SERVER_PORT`, `CORS_ALLOWED_ORIGINS`, `JWT_PUBLIC_KEY`, `JWT_PRIVATE_KEY` (base64 de PEM RSA), `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_PORT`, `CLOUDINARY_URL`, `VITE_*`.
Mobile: `WEUNITE_API_URL`, `WEUNITE_WS_URL` (via `--dart-define-from-file=config/dev.json`; no emulador o host é `10.0.2.2`).
**Avisos:** as chaves JWT foram **regeneradas** durante o QA (sessões antigas invalidadas). O `.env` atual contém credenciais reais de e-mail/Cloudinary fornecidas pelo usuário — recomendei trocá-las.

---

## 31. DECISÕES TÉCNICAS IMPORTANTES

1. **`PostEvents` app-scoped** em vez de chamar cubits de outra tela: rotas empilhadas não enxergam providers do shell. Não reverter para chamadas diretas entre cubits.
2. **Toggles retornam o estado lido da API** (`isSaved`/`isSubscribed`) em vez de assumir o inverso: evita divergência quando a API rejeita.
3. **Flags de oportunidade resolvidas em 2 requisições por listagem** (conjuntos salvos/inscritos) em vez de `isSaved`/`isSubscribed` por card (N requisições).
4. **Busca de oportunidades no cliente**, como a web faz; só posts ganharam endpoint novo (a API não tinha nenhuma busca de conteúdo).
5. **`imageMediaTypeFor` movido para `core/network`** porque uma feature não pode importar a camada `data` de outra (regra documentada no próprio projeto).
6. **`markAsRead` via REST** (não pelo STOMP `/app/chat.markAsRead`), porque o REST já existia, é idempotente e não depende da conexão.
7. **Upload de imagem do chat em duas etapas** (upload REST → mensagem STOMP): é o que a API suporta; o endpoint de upload não cria mensagem.
8. **Ids de autor opcionais** nas entidades para não quebrar construções existentes (testes e telas antigas).
9. **Não commitar `spotless:apply` inteiro**: no Windows ele converte ~250 arquivos para LF. Aplicar e restaurar só os arquivos realmente alterados.
10. **Ações de oportunidade escondidas para empresa**, porque os endpoints são athlete-only (evita erro 403 na cara do usuário).

---

## 32. TENTATIVAS QUE NÃO FUNCIONARAM

- **Abrir o detalhe da oportunidade com uma cópia da entidade**: os botões não reagiam ao resultado da API. Substituído pelo sheet ligado ao cubit (`opportunity_detail_route.dart`). Não voltar atrás.
- **`spotless:apply` no repositório inteiro**: gerou ruído de fim de linha em ~250 arquivos; revertido.
- **Escrever/editar arquivos com scripts PowerShell contendo crases (`` ` ``) ou `$`**: quebra o parser; usar as ferramentas de edição de arquivo.
- **Funções PowerShell chamadas `R`**: colidem com o alias `Invoke-History`.
- **`adb shell input keyevent 111` (ESC) para esconder teclado**: fecha bottom sheets e atrapalha o QA.

---

## 33. ESTADO EXATO NO MOMENTO DA PARADA

- **Todos os itens 1–27 estão implementados e validados no emulador** (o único ponto não exercitado é o botão "Trocar imagem" do compositor de post).
- Working tree limpa em `feat/mobile-backlog`; último commit de código: `c9282c2`. `flutter analyze` 0 issues, `flutter test` **197 verdes**.
- App rodando no emulador com o build atual; API e Postgres no Docker.
- Dados de teste no banco após a sessão: conversas 1 (Caio↔Ana) e 2 (Caio↔Marca); oportunidades 1, 2 e 3 da empresa 3; candidaturas do atleta 1 nas oportunidades 1 e 3; nenhuma linha de follow ativa (o teste terminou com "deixar de seguir").

### Histórico da parada anterior (mantido por contexto)

- Trabalhava em: **itens 19 e 20** (após concluir o 11).
- Últimos arquivos alterados: `chat_remote_data_source.dart`, `chat_repository_impl.dart`, `chat_repository.dart`, `opportunity_remote_data_source.dart`, `opportunity_repository_impl.dart`, `opportunity_repository.dart` (+ fakes de teste).
- Última alteração concluída: `startConversationWith` e `getCompanyOpportunities` na camada de dados, com fakes atualizados; `flutter analyze` 0 issues; `flutter test` 177 verdes; **commit `19b6435` feito e enviado**.
- **Não há código incompleto no working tree** (árvore limpa antes deste documento).
- O que falta nos itens 19/20 é **somente UI/cubit** (nada começado).
- Item 11 está implementado e com testes, mas **não foi validado no emulador**.

---

## 34. PRÓXIMOS PASSOS (ordem)

O backlog 1–27 está fechado. Continuidade sugerida, sempre olhando primeiro como a web faz:

1. **Telas de oportunidades que só existem na web**: "Oportunidades salvas" (`/opportunity/saved`), "Minhas candidaturas" / "Minhas oportunidades" (`/opportunity/my-opportunities`) e "Ver inscritos" para a empresa dona (`/opportunity/:id/subscribers`, `GET /subscriber/subscribers/{id}`). Os dados já existem no repositório mobile (`getSavedOpportunities`, `getSubscriptions`).
2. **Detalhe do post** (`/posts/:postId`) — ainda é placeholder.
3. **Criar/editar oportunidade pelo mobile** (hoje só pela web/API).
4. **Listas de seguidores/seguindo** (na web os contadores do perfil abrem modais; endpoints `GET /follow/followers|following/{id}`).
5. Pendências menores da §24.

---

## 35. ARQUIVOS QUE O PRÓXIMO AGENTE DEVE LER PRIMEIRO

1. `HANDOFF.md` (este)
2. `PROGRESS.md`
3. `apps/mobile/AGENTS.md` (regras de arquitetura do app — **obrigatório**)
4. `apps/mobile/lib/app/router.dart` (rotas e escopo de cubits)
5. `apps/mobile/lib/features/chat/presentation/cubit/chat_cubit.dart` e `chat_repository_impl.dart` (base do item 19)
6. `apps/mobile/lib/features/opportunities/data/opportunity_repository_impl.dart` e `presentation/screens/opportunities_screen.dart` (base do item 20)
7. `apps/mobile/lib/features/profile/presentation/screens/profile_screen.dart` (onde entra a aba de oportunidades)
8. `apps/mobile/lib/features/search/presentation/cubit/search_cubit.dart` (modelo de busca com debounce — **não reutilizar direto no chat**)

---

## 36. GIT / ESTADO DO REPOSITÓRIO

- Clone: `C:\Users\Caio\weunite-mobile-agent`; remote `origin` = `https://github.com/WeUnite-Social-Media/weunite.git`; autenticação via GitHub CLI (`gh auth login` já feito pelo usuário).
- Branch atual: **`feat/mobile-backlog`** (publicada). Cadeia empilhada: `feat/mobile-feed-interactions-and-creation` → `chore/mobile-tooling-cleanup` → `fix/mobile-session-expiration` → `fix/mobile-session-scoped-state` → `refactor/mobile-current-user-session` → `refactor/mobile-feed-cubits` → `fix/mobile-chat-realtime` → `feat/mobile-router` → `refactor/mobile-typed-contracts` → `feat/mobile-post-image-and-profile-posts` → `feat/mobile-backlog`. **Revisar/mergear nessa ordem.**
- Commits desta sessão (mais recente por último): `93691e2` (PROGRESS), `bc5ec0f` (chips), `ac901c4` (API nome do autor), `0a1e1e1` (trocar imagem), `c4e3439` (abrir perfil), `9ced220` (PROGRESS), `3277333` (busca), `5d29a2e` (oportunidades), `d187729` (chat), `19b6435` (perfil + base 19/20).
- Working tree limpa (fora este documento). **Nada de reset/descarte.**
- `.env` na raiz do clone é local e gitignored.

---

## 37. CÓDIGOS IMPORTANTES (referências)

- `apps/mobile/lib/features/feed/domain/post_events.dart` — `PostEvents.postCreated/postUpdated/commentAdded`.
- `apps/mobile/lib/features/profile/presentation/navigation/open_user_profile.dart` — `openUserProfile`, `profileLocationFor`.
- `apps/mobile/lib/features/chat/presentation/cubit/chat_cubit.dart` — `_syncSubscriptions`, `_onRealtimeEvent`, `_sorted`.
- `apps/mobile/lib/features/chat/data/chat_repository_impl.dart` — `startConversationWith`, `sendImage`, `_loadPeers`.
- `apps/mobile/lib/features/opportunities/presentation/cubit/opportunities_cubit.dart` — `_toggle` (otimista + reconciliação + reversão).
- `apps/mobile/lib/features/opportunities/data/opportunity_repository_impl.dart` — `getOpportunities` (merge de flags), `_idsOrEmpty`.
- `apps/api/.../posts/repository/PostRepository.java` — queries nativas de feed e busca (cuidado com aliases!).
- `apps/mobile/lib/core/network/api_client.dart` — `mapDioError` e tratamento de 401.

---

## 38. PROBLEMAS NÃO ESCONDIDOS (resumo honesto)

- O botão "Trocar imagem" do compositor de post continua sem teste no emulador.
- Perfis que já tinham altura em centímetros (gravada pelo mobile antes desta sessão) continuam com o valor antigo no banco: é preciso reeditar o perfil para corrigir. Só o perfil de teste foi corrigido.
- O pé dominante aceita valores fora das três opções da web quando vieram de outro cliente; o formulário preserva o valor, mas não o normaliza.
- A web tem telas que o mobile ainda não tem (oportunidades salvas, candidaturas, inscritos, seguidores/seguindo).
- Resultados de busca não permitem curtir.
- Sem paginação no histórico do chat; sem editar/apagar mensagem.
- Criação/edição de oportunidade não existe no mobile.
- `AppUser` em cache não reflete edição de nome/foto até novo login.
- Campos pedidos no item 9/20 (modalidade, vagas, requisitos) **não existem no banco**.
- Testes de widget cobrem pouco: a maior parte da cobertura é de cubits/data sources.

---

# PROMPT PARA CONTINUAR EM OUTRO CONTEXTO

```
Você está continuando um desenvolvimento iniciado por outro agente no projeto WeUnite
(monorepo WeUnite-Social-Media/weunite; clone local em C:\Users\Caio\weunite-mobile-agent,
branch feat/mobile-backlog).

Antes de alterar qualquer código:

1. Leia integralmente HANDOFF.md (raiz do repositório).
2. Leia PROGRESS.md.
3. Analise os arquivos indicados na seção "Arquivos que o próximo agente deve ler primeiro",
   em especial apps/mobile/AGENTS.md (regras de arquitetura).
4. Confira o estado atual do Git e do projeto (git log, git status, flutter analyze, flutter test).
5. Não assuma que itens pendentes estão concluídos.
6. Não refaça itens marcados como concluídos sem encontrar evidência de problema.
7. Continue exatamente do ponto indicado em "Estado exato no momento da parada".
8. Siga a ordem descrita em "Próximos passos".
9. Preserve as decisões técnicas documentadas, a menos que encontre um problema concreto.
10. Atualize HANDOFF.md e PROGRESS.md conforme avançar, e faça commit + push a cada item
    (o usuário acompanha pelo GitHub).

Regras do usuário: lista de requisitos é acumulativa; não quebrar o que funciona; nada de
ajuste apenas visual (validar backend, persistência e atualização da interface); testar o
fluxo completo antes de dar um item como concluído.

ESTADO: o backlog 1-27 esta concluido e validado no emulador (analyze 0 issues, 197 testes
verdes, ultimo commit c9282c2 em feat/mobile-backlog).

REGRA IMPORTANTE DO USUARIO: a interface desktop (apps/web) e a referencia. Antes de criar
qualquer componente novo no mobile, procure a implementacao equivalente na web, identifique
componente, logica, endpoint e estado, e reutilize ao maximo. Nao crie solucoes paralelas
para o que ja existe.

PROXIMO ITEM A EXECUTAR: as telas de oportunidades que so existem na web -- "Oportunidades
salvas" (/opportunity/saved), "Minhas candidaturas"/"Minhas oportunidades"
(/opportunity/my-opportunities) e "Ver inscritos" da empresa dona
(/opportunity/:id/subscribers). Os metodos de dados ja existem no mobile
(getSavedOpportunities, getSubscriptions).

Todo o contexto anterior necessário está documentado nesses arquivos.
Não comece o projeto novamente. Não substitua implementações existentes por preferência.
Não remova funcionalidades que estão funcionando. Primeiro entenda o estado atual, depois continue.
```
