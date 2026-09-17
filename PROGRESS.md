# PROGRESS — Backlog mobile WeUnite (rodada 2)

> **Leia este arquivo primeiro** ao retomar em outra sessão/contexto. Depois confira `git log` e `git status` na branch indicada abaixo e continue do **Próximo item**.

## Contexto para retomar

- **Clone de trabalho:** `C:\Users\Caio\weunite-mobile-agent` (repo `WeUnite-Social-Media/weunite`).
- **Branch de trabalho:** `feat/mobile-backlog` (criada a partir de `feat/mobile-post-image-and-profile-posts`, que por sua vez empilha as fases 0–7).
  Cadeia: `feat/mobile-feed-interactions-and-creation` → fases 0..7 → `feat/mobile-post-image-and-profile-posts` → `feat/mobile-backlog`.
- **App:** Flutter em `apps/mobile` (Clean Architecture `data/domain/presentation`, Cubits, Dio, go_router). Regras em `apps/mobile/AGENTS.md` — seguir.
- **"Desktop"** = `apps/web` (React). Referência visual/comportamental. Só alterar a web se o item exigir. Correções de API beneficiam a web também.
- **API:** Spring em `apps/api`, roda no Docker **a partir deste clone** (desde 2026-09-17). `.env` real (e-mail + Cloudinary + JWT) copiado de `C:\dev\weunite\.env` para a raiz deste clone (gitignored).
  - Subir/recriar API: `docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api up -d --force-recreate api` (na raiz do clone). O Postgres (`weunite-postgres`, volume `docker_weunite_postgres_data`) é compartilhado.
  - Testes da API: `docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api run --rm --no-deps -T --entrypoint mvn api -B test "-Dtest=Classe1,Classe2"`.
  - **Não commitar o resultado de `spotless:apply`**: no Windows ele converte todos os arquivos para LF (ruído em ~250 arquivos). Salvar os arquivos realmente alterados, `git checkout -- apps/api`, e restaurá-los.
- **Rodar app:** emulador `Pixel_8_API_35`; `cd apps/mobile; flutter run -d emulator-5554 --dart-define-from-file=config/dev.json`.
- **QA no emulador:** helpers em PowerShell (adb + `uiautomator dump`) para ler elementos e tocar por label. Screenshots em `/data/local/tmp` (não `/sdcard`, para não poluir a galeria).
- **Contas de teste** (senha `WeUnite@2026`): `caiogodas` (atleta, id 1), `anateste` (atleta, id 2), `marcateste` (empresa, id 3).
  Dados: posts 1–3 (Caio; 3 tem imagem), post 4 (Ana); comentário da Ana no post 3; 1 conversa (id 1, Caio↔Ana, 2 mensagens); 1 oportunidade (id 1, empresa 3, skill Futebol).
- **Validação obrigatória por item:** `dart format lib test`, `flutter analyze` (0 issues), `flutter test` (tudo verde), teste manual no emulador, persistência conferida (banco/após reiniciar app), commit, atualizar este arquivo, push.
- **Push:** autorizado pelo usuário (subir branches e commitar continuamente). Em 2026-09-17 falhou por credencial GitHub inválida — o usuário precisa rodar um `git push` no terminal dele para logar (Git Credential Manager). Até lá, commits ficam locais.

## Status dos itens

Legenda: ✅ concluído e validado · 🟡 parcial · ⏳ pendente · ⛔ bloqueado

| # | Item | Status | Observações |
|---|------|--------|-------------|
| 1 | Barra de pesquisa na Home | ⏳ | Web só pesquisa usuários (`/user/search`, debounce 300ms) e filtra oportunidades no cliente (`OpportunitySearch`). API não tem busca de posts. |
| 2 | Pesquisa de usuários (nome/username) | ⏳ | `GET /api/user/search?query=` → `ResponseDTO<List<UserDTO>>` (só e-mail verificado; também casa por e-mail). Resultado deve usar `openUserProfile`. |
| 3 | Imagem em posts | ✅ | Rodada anterior + botão "Trocar imagem" (0a1e1e1). Validado no emulador: seleção (photo picker), preview, remover, upload Cloudinary, feed e perfil, persiste após reiniciar. Troca de imagem: só analisado, ainda não exercitado no emulador. |
| 4 | Post atualiza no perfil | ✅ | `PostEvents` sincroniza feed↔perfil. Validado após force-stop + relaunch (post com imagem continua no perfil, sessão restaurada). |
| 5 | Nome do autor no feed | ✅ | **Bug de backend**: queries nativas do feed tinham `u.name AS userName` + `u.username AS username` — aliases colidem (case-folding) e `user.name` vinha = username. Alias → `authorName` (ac901c4) + teste de persistência. Validado na API (Postgres) e no emulador ("Caio Godas" / "@caiogodas"). Também corrige a web. |
| 6 | Abrir perfil ao clicar no usuário | 🟡 | Implementado (c4e3439), **falta validar no emulador**. `openUserProfile` (próprio id → aba `/profile`; outros → `/profile/:id`) em PostCard, comentários (fecha o sheet), card e detalhe de oportunidade. `UserProfileScreen` lista posts do usuário. Chat não alterado. Busca: aplicar nos itens 1/2. |
| 7 | Salvar oportunidade | ⏳ | `POST /saved-opportunities/toggle/{athleteId}/{opportunityId}`, `GET .../isSaved/...`, `GET .../athlete/{athleteId}`. Botão hoje é `onPressed: () {}`. |
| 8 | Candidatura | ⏳ | `POST /subscriber/toggleSubscriber/{athleteId}/{opportunityId}`, `GET /subscriber/isSubscribed/...`, `GET /subscriber/athlete/{athleteId}`. Botão "Candidatar-se" do detalhe é `onPressed: () {}`. |
| 9 | Detalhes da oportunidade | ⏳ | Campos reais: title, description, location, dateEnd, skills, createdAt, updatedAt, company (UserDTO), subscribersCount. Não existem requisitos/modalidade/vagas/status no banco — não inventar. Detalhe hoje é bottom sheet em `opportunity_card.dart`. |
| 10 | Etiquetas de habilidade ilegíveis | ✅ | `chipTheme` com cores explícitas (verde-800 sobre verde-100 + borda), teste de widget com contraste WCAG (bc5ec0f). Validado no emulador. Só existe tema claro no app. |
| 11 | Edição do perfil | ⏳ | `PUT /api/user/update/{username}` multipart (`user` JSON: name, username, bio, isPrivate, height, weight, footDomain, position, birthDate, skills; `profileImage`, `bannerImage`). `DELETE /api/user/banner/delete/{username}`. |
| 12 | Chat atualiza automaticamente | ⏳ | Conversa aberta já recebe via STOMP. Lista de conversas não assina nada. |
| 13 | Estado vazio no chat | ⏳ | Tela em branco e sem pull-to-refresh (`conversations_screen.dart` não tem `RefreshIndicator`). |
| 14 | Marcar mensagens como lidas | ⏳ | `PUT /conversations/{id}/read/{userId}` e STOMP `/app/chat.markAsRead`. App nunca chama; banco mostra `is_read=false`. |
| 15 | Destaque dos itens da lista de chat | ⏳ | Comparar com web `features/chat/components/ConversationList.tsx`. |
| 16 | Fotos no chat | ⏳ | `POST /api/messages/upload` (params `file`, `conversationId`, `senderId`). `Message.type` é enum. |
| 17 | Emojis no chat | ⏳ | Validar UTF-8 ponta a ponta (STOMP, banco, preview). Avaliar seletor. |
| 18 | PROGRESS.md / continuidade | ✅ | Este arquivo. Atualizar a cada item. |

## Próximo item

1. Validar **item 6** no emulador: no feed tocar em "Caio Godas" (deve ir para a aba Perfil) e no post da Ana (deve abrir `/profile/2` com o post 4); abrir comentários do post 3 e tocar em "Ana Teste QA"; em Oportunidades tocar em "Marca Teste QA".
2. Depois: **1/2 → 7 → 8 → 9 → 13 → 14 → 12 → 15 → 16 → 17 → 11**.

## Bugs conhecidos (fora da lista, encontrados em QA)

- `/posts/:postId` (`PostDetailScreen`) é placeholder.
- `GET /api/user/search` também casa por e-mail (possível exposição de e-mail em busca) — só registrar; decisão do time.
- Pull-to-refresh em `UserProfileScreen` mostra spinner de tela cheia (o `UserProfileCubit.load` emite `isLoading`) — cosmético.

## Decisões técnicas

- (2026-09-17) `PostEvents` sincroniza listas de posts entre telas; não chamar cubit de outra tela diretamente. É **app-scoped** (criado em `WeUniteMobileApp`) porque rotas empilhadas fora do shell (`/profile/:userId`) precisam dele.
- (2026-09-17) Ids de autor (`Post.authorId`, `Comment.authorId`, `Opportunity.companyId`) são opcionais para não quebrar testes/construções existentes; toque só habilitado quando presentes.
- (2026-09-17) `openUserProfile` lê `AuthCubit.state.user?.id` apenas para decidir a rota (exceção de navegação à regra do `CurrentUserProvider`).

## Registro de trabalho

### Rodada anterior (já commitada)
- Branch `feat/mobile-post-image-and-profile-posts`: `image_picker`; imagem em post (multipart `image`); `ProfilePostsCubit` + aba Posts do perfil; `PostEvents`; fix pull-to-refresh do feed. 148 testes verdes.

### Rodada atual (branch `feat/mobile-backlog`)
- 93691e2 — cria este PROGRESS.md.
- bc5ec0f — item 10: `core/theme/app_colors.dart`, `core/theme/app_theme.dart`, novo `test/core/theme/app_theme_test.dart`.
- ac901c4 — item 5 (API): `PostRepository` (2 queries nativas), `FeedPostSummaryProjection`, `PostService`, `PostServiceTest`, `PostInteractionPersistenceTest`.
- 0a1e1e1 — item 3: botão "Trocar imagem" em `feed/presentation/widgets/create_post_sheet.dart`.
- c4e3439 — item 6: novos `profile/presentation/navigation/open_user_profile.dart`, `profile/presentation/widgets/profile_posts_list.dart`, `test/features/profile/open_user_profile_test.dart`; alterados entidades Post/Comment/Opportunity, mappers de DTO, `FeedRepository.getUserPosts`, `ProfilePostsCubit(userId)`, `user_profile_screen.dart`, `profile_screen.dart`, `post_card.dart`, `comments_sheet.dart`, `opportunity_card.dart`, `app/app.dart`, `app/router.dart`, fakes de teste.

## Testes

- Mobile: `flutter analyze` 0 issues; `flutter test` 155 verdes (após item 6).
- API: `PostInteractionPersistenceTest` + `PostServiceTest` (19 testes) verdes.
- Emulador: itens 3, 4, 5, 10 validados.
- Pendentes: item 6 no emulador; troca de imagem no emulador.
