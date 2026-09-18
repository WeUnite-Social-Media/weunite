# PROGRESS — Backlog mobile WeUnite (rodada 2)

> **Leia `HANDOFF.md` primeiro** (contexto completo). Este arquivo é o status resumido por item. Depois confira `git log` e `git status` na branch indicada e continue do **Próximo item**.

_Atualizado em 2026-09-17, após o commit `19b6435`._

## Contexto para retomar

- **Clone de trabalho:** `C:\Users\Caio\weunite-mobile-agent` (repo `WeUnite-Social-Media/weunite`).
- **Branch de trabalho:** `feat/mobile-backlog` (publicada). Cadeia: `feat/mobile-feed-interactions-and-creation` → fases 0..7 → `feat/mobile-post-image-and-profile-posts` → `feat/mobile-backlog`.
- **App:** Flutter em `apps/mobile` (Clean Architecture `data/domain/presentation`, Cubits, Dio, go_router). Regras em `apps/mobile/AGENTS.md` — seguir.
- **"Desktop"** = `apps/web` (React). Referência visual/comportamental. Correções de API beneficiam a web também.
- **API:** Spring em `apps/api`, roda no Docker **a partir deste clone**. `.env` real (e-mail + Cloudinary + JWT) na raiz do clone (gitignored).
  - Subir/recriar API: `docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api up -d --force-recreate api`.
  - Testes da API: `docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api run --rm --no-deps -T --entrypoint mvn api -B test "-Dtest=Classe1,Classe2"`.
  - **Não commitar o resultado de `spotless:apply`**: no Windows ele converte ~250 arquivos para LF.
  - As chaves JWT do `.env` foram **regeneradas** durante o QA — tokens antigos (scripts de teste) precisam ser refeitos.
- **Rodar app:** emulador `Pixel_8_API_35`; `cd apps/mobile; flutter run -d emulator-5554 --dart-define-from-file=config/dev.json`.
- **QA no emulador:** helpers PowerShell (adb + `uiautomator dump`) para ler elementos e tocar por label. Screenshots em `/data/local/tmp` (não `/sdcard`, para não poluir a galeria). Não usar `keyevent 111` (fecha bottom sheets).
- **Contas de teste** (senha `WeUnite@2026`): `caiogodas` (atleta, id 1), `anateste` (atleta, id 2), `marcateste` (empresa, id 3).
  Dados: posts 1–4; comentário da Ana no post 3; conversa id 1 (Caio↔Ana) com mensagens de texto e imagem; oportunidade id 1 (empresa 3, skill Futebol).
- **Validação obrigatória por item:** `dart format lib test`, `flutter analyze` (0 issues), `flutter test` (tudo verde), teste manual no emulador, persistência conferida (banco/após reiniciar app), commit, atualizar este arquivo, **push**.
- **Push:** autorizado e funcionando (GitHub CLI autenticado). Commitar e dar push a cada item.

## Status dos itens

Legenda: ✅ concluído e validado no emulador · 🟡 parcial · ⏳ pendente · ⛔ bloqueado

| # | Item | Status | Observações |
|---|------|--------|-------------|
| 1 | Barra de pesquisa na Home | ✅ | Barra no topo do feed → `/search` (debounce 300ms). Seções Pessoas/Posts/Oportunidades, loading, vazio, erro. Commit `3277333`. |
| 2 | Pesquisa de usuários (nome/username) | ✅ | Seção "Pessoas" com `GET /user/search`; avatar, nome, @username, chip Empresa; toque abre o perfil. |
| 3 | Imagem em posts | ✅ | Picker, preview, remover, "Trocar imagem", upload Cloudinary, feed e perfil, persiste. ("Trocar imagem" só analisado, não exercitado no emulador.) |
| 4 | Post atualiza no perfil | ✅ | `PostEvents` sincroniza feed↔perfil. Validado após force-stop + relaunch. |
| 5 | Nome do autor no feed | ✅ | **Bug de backend**: alias `u.name AS userName` colidia com `username`. Alias → `authorName` (`ac901c4`) + teste de persistência. Corrige também a web. |
| 6 | Abrir perfil ao clicar no usuário | ✅ | `openUserProfile` em PostCard, comentários, card/detalhe de oportunidade e busca. Chat **não** alterado (regra do item). `UserProfileScreen` lista os posts do usuário. |
| 7 | Salvar oportunidade | ✅ | Toggle + leitura de volta (`isSaved`), ícone preenchido, flag carregada na listagem, persiste. |
| 8 | Candidatura | ✅ | Toggle + `isSubscribed`, contador ajusta, duplo toque bloqueado (`pendingIds`), persiste. |
| 9 | Detalhes da oportunidade | ✅ | Sheet com status, empresa clicável, descrição, skills, local, prazo, publicação, candidatos e ações. Campos inexistentes no banco (requisitos/modalidade/vagas) **não foram inventados**. |
| 10 | Etiquetas de habilidade ilegíveis | ✅ | `chipTheme` com cores explícitas + teste de contraste WCAG (`bc5ec0f`). |
| 11 | Edição do perfil | 🟡 | **Implementado e com testes verdes; NÃO validado no emulador.** Tela "Editar perfil" (nome, username, bio, privado, altura, peso, posição, perna, nascimento, skills, foto, capa, remover capa) → `PUT /user/update/{username}` + `DELETE /user/banner/delete/{username}`. Commit `19b6435`. |
| 12 | Chat atualiza automaticamente | ✅ | `ChatCubit` assina o tópico STOMP de todas as conversas; prévia, horário, badge e reordenação. |
| 13 | Estado vazio no chat | ✅ | Ícone + texto + CTA "Procurar pessoas" + pull-to-refresh. **O CTA ainda aponta para `/search`; o item 19 pede a busca do chat.** |
| 14 | Marcar mensagens como lidas | ✅ | `PUT /conversations/{id}/read/{userId}` ao abrir e ao receber com a tela aberta; badge zera; conferido no banco. |
| 15 | Destaque dos itens da lista de chat | ✅ | Card branco com borda (verde quando não lida), avatar, nome, prévia, horário relativo e badge vermelho. |
| 16 | Fotos no chat | ✅ | `POST /messages/upload` → URL → mensagem STOMP `type: IMAGE`; bolha renderiza a imagem. |
| 17 | Emojis no chat | ✅ | UTF-8 preservado (`jsonEncode`) + seletor rápido de 20 emojis no compositor. |
| 18 | PROGRESS.md / continuidade | ✅ | Este arquivo + `HANDOFF.md`. |
| 19 | Nova conversa a partir do chat | 🟡 | **Só camada de dados.** `ChatRepository.startConversationWith(userId)` → `POST /conversations/create` (idempotente para 1:1). **Falta UI**: busca só de usuários dentro do Chat, toque abre a conversa (nunca o perfil), CTA "Nova conversa", repontar o botão do estado vazio. |
| 20 | Oportunidades da empresa no perfil | 🟡 | **Só camada de dados.** `OpportunityRepository.getCompanyOpportunities(companyId)` → `GET /opportunities/get/company/{companyId}`. **Falta cubit + UI** na aba "Oportunidades" do perfil próprio (empresa) e no `UserProfileScreen` de empresa, abrindo o detalhe. |

## Próximo item

1. **Validar o item 11** no emulador (checklist na seção 26 do `HANDOFF.md`) e corrigir o que aparecer.
2. **Item 19 (UI)**: `chat/presentation/cubit/user_search_cubit.dart` + `chat/presentation/screens/new_conversation_screen.dart`, rota `/chat/new`, busca/FAB na aba Chat, CTA do estado vazio apontando para lá. Toque = `startConversationWith` → `pushReplacement('/chat/{id}')`; **não** abrir perfil.
3. **Item 20 (UI)**: `company_opportunities_cubit.dart` + seção nas telas de perfil, abrindo o detalhe.
4. Testes + `dart format`/`analyze`/`test`, validação no emulador, commit e push por item.

## Bugs conhecidos (fora da lista, encontrados em QA)

- `/posts/:postId` (`PostDetailScreen`) é placeholder.
- `GET /api/user/search` também casa por e-mail (possível exposição) — decisão do time.
- Pull-to-refresh em `UserProfileScreen` mostra spinner de tela cheia — cosmético.
- `ChatController` confia no `senderId` do payload STOMP (backend; decisão do time).
- `AppUser` em cache não reflete edição de nome/foto até novo login.

## Decisões técnicas

- (2026-09-17) `PostEvents` sincroniza listas de posts entre telas; **app-scoped** porque rotas empilhadas fora do shell não enxergam providers do shell.
- (2026-09-17) Ids de autor (`Post.authorId`, `Comment.authorId`, `Opportunity.companyId`) são opcionais para não quebrar testes/construções existentes.
- (2026-09-17) `openUserProfile` lê `AuthCubit.state.user?.id` apenas para decidir a rota (exceção de navegação à regra do `CurrentUserProvider`).
- (2026-09-17) Toggles de oportunidade **retornam o estado lido da API** (`isSaved`/`isSubscribed`) em vez de assumir o inverso — evita divergência front/back.
- (2026-09-17) Flags de oportunidade resolvidas com 2 requisições por listagem (conjuntos salvos/inscritos), não 1 por card; falha delas não quebra a listagem (conta empresa).
- (2026-09-17) Detalhe da oportunidade é aberto **ligado ao cubit** (`showOpportunityDetailBound`): com uma cópia da entidade os botões não reagiam.
- (2026-09-17) Busca de oportunidades é filtrada **no cliente** (igual à web); só posts ganharam endpoint novo na API.
- (2026-09-17) `imageMediaTypeFor` vive em `core/network` porque uma feature não pode importar a camada `data` de outra.
- (2026-09-17) `markAsRead` via REST (não pelo STOMP): já existia, é idempotente e não depende da conexão.
- (2026-09-17) Imagem no chat em duas etapas (upload REST → mensagem STOMP): o endpoint de upload não cria a mensagem.
- (2026-09-17) Ações de oportunidade escondidas para conta empresa (endpoints são athlete-only).

## Registro de trabalho

### Rodada anterior (já commitada)
- Branch `feat/mobile-post-image-and-profile-posts`: `image_picker`; imagem em post; `ProfilePostsCubit` + aba Posts do perfil; `PostEvents`; fix pull-to-refresh do feed. 148 testes verdes.

### Rodada atual (branch `feat/mobile-backlog`)
- `93691e2` — cria o PROGRESS.md.
- `bc5ec0f` — item 10: `app_colors.dart`, `app_theme.dart`, novo `test/core/theme/app_theme_test.dart`.
- `ac901c4` — item 5 (API): `PostRepository`, `FeedPostSummaryProjection`, `PostService`, `PostServiceTest`, `PostInteractionPersistenceTest`.
- `0a1e1e1` — item 3: botão "Trocar imagem" em `create_post_sheet.dart`.
- `c4e3439` — item 6: `open_user_profile.dart`, `profile_posts_list.dart`, entidades com id de autor, `getUserPosts`, `UserProfileScreen` com posts, `PostCard`/comentários/oportunidade clicáveis, `PostEvents` app-scoped.
- `9ced220` — atualiza o PROGRESS.md.
- `3277333` — itens 1 e 2: **API** `GET /posts/search` (`PostRepository.searchFeedSummaries`, `PostService.searchPosts`, `PostController`, teste de persistência) + **mobile** módulo `search` (cubit, tela, `HomeSearchBar`) e `FeedRepository.searchPosts` / `ProfileRepository.searchUsers`.
- `5d29a2e` — itens 7, 8 e 9: flags na listagem (`CurrentUserProvider` no repositório), toggles com reconciliação, `pendingIds`, detalhe rico e ligado ao cubit (`opportunity_detail_route.dart`).
- `d187729` — itens 12–17: realtime na lista de conversas, `markConversationAsRead`, estado vazio + refresh, redesign dos cards, `sendImage` (upload + STOMP `IMAGE`), seletor de emoji.
- `19b6435` — item 11 (edição de perfil: `UpdateUserRequestDto`, `EditProfileCubit`, `EditProfileScreen`, novos campos em `UserDto`/`Profile`, `SkillDto.toJson`) + **base dos itens 19 e 20** (`startConversationWith`, `createConversation`, `getCompanyOpportunities`).

## Testes

- Mobile: `dart format` limpo; `flutter analyze` **0 issues**; `flutter test` **177 verdes**.
- API: `PostInteractionPersistenceTest` (10) + `PostServiceTest` (10) verdes no container.
- Emulador: itens 1–10 e 12–17 validados (detalhe do que foi exercitado na seção 25 do `HANDOFF.md`).
- Pendentes de validação: item 11 no emulador, "Trocar imagem" no emulador, itens 19 e 20 (sem UI).
