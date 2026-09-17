# PROGRESS — Backlog mobile WeUnite (rodada 2)

> **Leia este arquivo primeiro** ao retomar em outra sessão/contexto. Depois confira `git log` e `git status` na branch indicada abaixo e continue do **Próximo item**.

## Contexto para retomar

- **Clone de trabalho:** `C:\Users\Caio\weunite-mobile-agent` (repo `WeUnite-Social-Media/weunite`).
- **Branch de trabalho:** `feat/mobile-backlog` (criada a partir de `feat/mobile-post-image-and-profile-posts`, que por sua vez empilha as fases 0–7).
  Cadeia: `feat/mobile-feed-interactions-and-creation` → fases 0..7 → `feat/mobile-post-image-and-profile-posts` → `feat/mobile-backlog`.
- **App:** Flutter em `apps/mobile` (Clean Architecture `data/domain/presentation`, Cubits, Dio, go_router). Regras em `apps/mobile/AGENTS.md` — seguir.
- **"Desktop"** = `apps/web` (React). Referência visual/comportamental. Só alterar a web se o item exigir.
- **API:** Spring em `apps/api`, roda no Docker. Compose: `infra/docker/compose.dev.yml` (perfil `api`). `.env` real (e-mail + Cloudinary + JWT) fica em `C:\dev\weunite\.env` (gitignored).
  - **Atenção:** o container da API monta o código de onde o `docker compose` foi executado. Se houver mudança de backend neste clone, suba a API **a partir deste clone** (copiar `.env` para a raiz dele). O volume do Postgres (`docker_weunite_postgres_data`) é o mesmo nos dois clones, os dados são preservados.
- **Rodar app:** emulador `Pixel_8_API_35`; `cd apps/mobile; flutter run -d emulator-5554 --dart-define-from-file=config/dev.json`.
- **Contas de teste** (senha `WeUnite@2026`): `caiogodas` (atleta, id 1), `anateste` (atleta, id 2), `marcateste` (empresa, id 3). Dados: 3 posts, 1 conversa (1↔2), 1 oportunidade (id 1).
- **Validação obrigatória por item:** `dart format lib test`, `flutter analyze` (0 issues), `flutter test` (tudo verde), teste manual no emulador (adb + uiautomator), persistência conferida no banco/após reiniciar app, commit, push.
- **Push:** o usuário autorizou subir as branches e commitar continuamente. Em 2026-09-17 o push falhou por credencial GitHub inválida — o usuário precisa rodar um `git push` no terminal dele para logar (Git Credential Manager). Enquanto isso, commits ficam locais.

## Status dos itens

Legenda: ✅ concluído e validado · 🟡 parcial · ⏳ pendente · ⛔ bloqueado

| # | Item | Status | Observações |
|---|------|--------|-------------|
| 1 | Barra de pesquisa na Home | ⏳ | Web só pesquisa usuários (`/user/search`, debounce 300ms) e filtra oportunidades no cliente. API não tem busca de posts. |
| 2 | Pesquisa de usuários (nome/username) | ⏳ | `GET /api/user/search?query=` (retorna `ResponseDTO<List<UserDTO>>`, só e-mail verificado; também casa por e-mail). |
| 3 | Imagem em posts | ✅ | Feito na rodada anterior (branch `feat/mobile-post-image-and-profile-posts`). Falta revalidar troca de imagem + reinício do app. |
| 4 | Post atualiza no perfil | 🟡 | Sync feed↔perfil via `PostEvents` feito e testado. Falta validar persistência após reiniciar o app. |
| 5 | Nome do autor no feed | ⏳ | `PostCard` mostra `authorName`; o `FeedPostSummaryDTO.user.name` vem = username? investigar. |
| 6 | Abrir perfil ao clicar no usuário | ⏳ | Rota `/profile/:userId` existe (`UserProfileScreen`). Não aplicar no chat. |
| 7 | Salvar oportunidade | ⏳ | `POST /saved-opportunities/toggle/{athleteId}/{opportunityId}`, `GET .../isSaved/...`, `GET .../athlete/{athleteId}`. Botão hoje é `onPressed: () {}`. |
| 8 | Candidatura | ⏳ | `POST /subscriber/toggleSubscriber/{athleteId}/{opportunityId}`, `GET /subscriber/isSubscribed/...`, `GET /subscriber/athlete/{athleteId}`. |
| 9 | Detalhes da oportunidade | ⏳ | Campos reais: title, description, location, dateEnd, skills, createdAt, updatedAt, company(UserDTO), subscribersCount. Não existem requisitos/modalidade/vagas/status no banco — não inventar. |
| 10 | Etiquetas de habilidade ilegíveis | ⏳ | `chipTheme` sem cor de texto → label branco. |
| 11 | Edição do perfil | ⏳ | `PUT /api/user/update/{username}` multipart (`user` JSON: name, username, bio, isPrivate, height, weight, footDomain, position, birthDate, skills; `profileImage`, `bannerImage`). `DELETE /api/user/banner/delete/{username}`. |
| 12 | Chat atualiza automaticamente | ⏳ | Conversa aberta já recebe via STOMP. Lista de conversas não assina nada. |
| 13 | Estado vazio no chat | ⏳ | Tela em branco + sem pull-to-refresh. |
| 14 | Marcar mensagens como lidas | ⏳ | `PUT /conversations/{id}/read/{userId}` e STOMP `/app/chat.markAsRead`. App nunca chama. |
| 15 | Destaque dos itens da lista de chat | ⏳ | Comparar com web `ConversationList.tsx`. |
| 16 | Fotos no chat | ⏳ | `POST /api/messages/upload` (params `file`, `conversationId`, `senderId`). `Message.type` tem enum. |
| 17 | Emojis no chat | ⏳ | Validar UTF-8 ponta a ponta (STOMP, banco, preview). Avaliar seletor. |
| 18 | PROGRESS.md / continuidade | ✅ | Este arquivo. Atualizar a cada item. |

## Próximo item

**Item 10** (rápido, isolado) e depois **5 → 6 → 1/2 → 7 → 8 → 9 → 13 → 14 → 12 → 15 → 16 → 17 → 11**, revalidando 3/4 no caminho.

## Bugs conhecidos (fora da lista, encontrados em QA)

- `/posts/:postId` (`PostDetailScreen`) é placeholder.
- `UserProfileScreen` (perfil de terceiros) não lista posts.
- `GET /api/user/search` também casa por e-mail (possível exposição de e-mail em busca) — só registrar, decisão do time.

## Decisões técnicas

- (2026-09-17) `PostEvents` (bus por sessão) sincroniza listas de posts entre telas; não chamar cubit de outra tela diretamente.

## Registro de trabalho

### Rodada anterior (já commitada)
- Branch `feat/mobile-post-image-and-profile-posts`: `image_picker`; imagem em post (multipart `image`); `ProfilePostsCubit` + aba Posts do perfil; `PostEvents`; fix pull-to-refresh do feed. 162 testes verdes.

### Rodada atual
- (vazio)

## Testes

- Realizados: ver "Registro de trabalho".
- Pendentes: revalidar 3/4 após reinício do app.
