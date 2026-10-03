# PROGRESS — Backlog mobile WeUnite (rodada 2)

> **Leia `HANDOFF.md` primeiro** (contexto completo). Este arquivo é o status resumido por item. Depois confira `git log` e `git status` na branch indicada e continue do **Próximo item**.

_Atualizado em 2026-09-18, após o commit `3aa1c37` — **PR [#38](https://github.com/WeUnite-Social-Media/weunite/pull/38)** aberto._

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
- **Contas de teste** (mesma senha de teste local para as tres; ver com o time): `caiogodas` (atleta, id 1), `anateste` (atleta, id 2), `marcateste` (empresa, id 3).
  Dados: posts 1–4; comentário da Ana no post 3; conversa id 1 (Caio↔Ana) com mensagens de texto e imagem; oportunidade id 1 (empresa 3, skill Futebol).
- **Validação obrigatória por item:** `dart format lib test`, `flutter analyze` (0 issues), `flutter test` (tudo verde), teste manual no emulador, persistência conferida (banco/após reiniciar app), commit, atualizar este arquivo, **push**.
- **Push:** autorizado e funcionando (GitHub CLI autenticado). Commitar e dar push a cada item.

## Etapa em andamento (iniciada em 2026-09-26)

Nova rodada pedida pelo usuário: trazer para o mobile o que já existe no desktop —
notificações (sino, contador, lista, filtros, marcar lida/todas), posts (menu de 3 pontos,
compartilhar, denunciar), oportunidades (busca, sugestões, minhas candidaturas, salvas,
candidatar/cancelar, menu, compartilhar, denunciar, redesenho do card) e áudio no chat.
Depois: teste completo mobile + desktop, `MOBILE_TESTING.md`, commits, PR e handoff.

**Divisão de trabalho pedida:** Opus para investigar/planejar/decidir, Sonnet para executar.
O modelo da sessão principal não pode ser trocado por ferramenta (o app bloqueia); a divisão
é feita com subagentes Sonnet executando sob análise do Opus. Registrado aqui porque o item
27 do pedido manda restaurar a configuração anterior no fim — e não há configuração em disco
a restaurar (ver seção "Git, PR e configuração de agentes").

Status por item desta etapa: ver a tabela abaixo (itens 33+).

## Etapa 2 — status por item (desktop como referência)

Legenda: ✅ concluído · 🟡 parcial · ⏳ pendente · ⛔ fora do escopo por decisão

| #   | Item                             | Status | Observações                                                                                                                                                                                                                                   |
| --- | -------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 33  | Notificações na Home             | ✅     | Sino + badge ("9+"), tela com busca, filtros, agrupamento, "Novo", marcar uma/todas, remover, realtime pelo tópico que a API já publicava. Commit `a45ee67`. Validado no emulador (contador batendo com a API, marcar todas gravou no banco). |
| 34  | Posts — compartilhar             | ⛔     | A web tem o item no menu **sem handler** e **não há rota pública de post**. Decisão do usuário: fora desta etapa. Proposta registrada: criar `/post/:id` na web.                                                                              |
| 35  | Posts — denunciar                | ✅     | Feature `reporting` genérica sobre `POST /reports/create/{userId}`, 10 motivos exatos, detalhes 500 chars, aviso e validações da web. Commit `4bc9bf6`. Denúncia real gravada no banco.                                                       |
| 36  | Posts — menu de 3 pontos         | ✅     | Só para quem não é autor, com "Denunciar" (mesma regra da web). Autor não vê menu — ver pendências.                                                                                                                                           |
| 37  | Oportunidades — pesquisa         | ✅     | Filtro no cliente com a mesma regra do `opportunityFilter.ts`; carrossel escondido durante a busca; mensagem de vazio da web. Commit `ee07a60`. **A web também foi consertada** (commit `3a187f9`) — o campo dela nunca filtrou nada.         |
| 38  | Minhas candidaturas              | ✅     | `GET /subscriber/athlete/{id}` pelo método que já existia; ordenação por prazo da web; textos de vazio exatos; cancelar remove o card.                                                                                                        |
| 39  | Oportunidades salvas             | ✅     | Rota nova reutilizando `SavedOpportunitiesCubit`/`SavedOpportunitiesList` da aba do perfil — fonte de dados única, como exigido.                                                                                                              |
| 40  | Candidatar-se                    | ✅     | Já existia (item 8 da etapa 1); agora também pelo card redesenhado e pela tela de candidaturas.                                                                                                                                               |
| 41  | Cancelar candidatura             | ✅     | Idem; na tela de candidaturas o item sai da lista.                                                                                                                                                                                            |
| 42  | Sugestões de oportunidades       | ✅     | Carrossel "Oportunidades Sugestões" sobre a lista já carregada — é o que a web faz (não existe endpoint de recomendação). Commit `29ff0bf`.                                                                                                   |
| 43  | Oportunidades — menu de 3 pontos | ✅     | No card e no detalhe, com "Denunciar", reutilizando a sheet do item 35. Dono não vê menu — ver pendências.                                                                                                                                    |
| 44  | Oportunidades — compartilhar     | ⛔     | Mesma situação do item 34: botão morto na web, sem rota pública. Fora por decisão.                                                                                                                                                            |
| 45  | Oportunidades — denunciar        | ✅     | Mesmo fluxo e endpoint do item 35, com `type: OPPORTUNITY`.                                                                                                                                                                                   |
| 46  | Design do card de oportunidade   | ✅     | Hierarquia da web: empresa + "ha {tempo}", título, descrição, habilidades, local / "Ate dd/MM/yyyy" / "{n} candidatos", salvar e candidatar no rodapé. `timeAgo` é porte fiel do `getTimeAgo`.                                                |
| 47  | Chat — áudio                     | 🟡     | Em implementação no momento desta atualização. Caminho decidido: igual ao da web (upload em `/messages/upload` + detecção por extensão da URL), sem mexer no backend (o enum não tem AUDIO e o tipo é descartado antes de chegar nele).       |
| 48  | MOBILE_TESTING.md                | ✅     | Escrito a partir da instalação real no POCO X5 Pro, com as travas do MIUI e o contorno que funcionou.                                                                                                                                         |

### Pendências registradas desta etapa

- **Compartilhar** (posts e oportunidades): precisa de rota pública na web para o link funcionar.
- **Autor/dono não vê menu de 3 pontos**: as únicas ações que a web oferece a ele são editar,
  excluir, ver inscritos e compartilhar — nenhuma existe no mobile ainda.
- **Tela "Ver inscritos"** (empresa dona), que a web tem em `/opportunity/:id/subscribers`.
- **Aba "Comentários"** no perfil, que a web tem e o mobile não (`GET /comment/get/user/{id}`).
- **Sem API de homologação**: um APK só funciona na mesma rede de quem roda o backend.

### Travas do MIUI encontradas ao testar no celular real (POCO X5 Pro, serial `b99d3e5a`)

- `flutter run`/`adb install` falham com `INSTALL_FAILED_USER_RESTRICTED` mesmo com "Instalar via
  USB" ligado. **Funciona:** `adb push <apk> /data/local/tmp/wu.apk` + `adb shell pm install -r -t
/data/local/tmp/wu.apk`.
- `adb shell input tap/text` é bloqueado (`SecurityException: INJECT_EVENTS`): no aparelho real não
  dá para automatizar toques, só ler tela/logs. O QA automatizado continua no emulador.

## Etapa 4 - Video em post (2026-10-03)

_Branch `chore/mobile-launcher-icon`, commit `c11ce6b`. Nao subido para a main ainda._

Pedido: "nao consigo mandar video pelo mobile". **Nao e no chat** - la nem o web
tem (`accept="image/*,.pdf,.doc,.docx,.txt"` no `MessageInput.tsx`, e o enum da
API e `TEXT, IMAGE, FILE`). E no **post**, e estava pela metade: o web aceitava
escolher e enviar video (`CreatePost.tsx` com `accept="image/*, video/*"`), mas
`Post.tsx` renderizava tudo dentro de um `<img>`, entao o video virava imagem
quebrada. Dava para mandar e ninguem via.

| Camada            | Antes                                                              | Agora                |
| ----------------- | ------------------------------------------------------------------ | -------------------- |
| API               | aceita (`resource_type: auto`), devolve URL de video em `imageUrl` | igual                |
| Web - escolher    | sim                                                                | sim                  |
| Web - exibir      | **nao** (`<img>`)                                                  | `<video controls>`   |
| Mobile - escolher | **nao**                                                            | `pickMedia`          |
| Mobile - exibir   | **nao**                                                            | player com progresso |

Arquivos novos: `features/feed/domain/post_media.dart` (formatos, limites e
deteccao de video), `features/feed/presentation/widgets/post_video.dart`,
`apps/web/src/features/feed/utils/postMedia.ts`,
`test/features/feed/post_media_test.dart`. Dependencia nova: `video_player`.

### Dois furos achados testando de verdade

1. O schema do web permitia **50 MB** de video, mas a API corta todo multipart
   em 10 MB (`spring.servlet.multipart.max-file-size` e `.max-request-size`).
   Video entre 10 e 50 MB passava no navegador e morria no servidor. Os dois
   clientes agora usam 10 MB.
2. O app deixava publicar so com midia e a API respondia
   "Validation failed for object='post'": o texto e obrigatorio
   (`CreatePostRequestDTO`, e `text: z.string().min(1)` no web).

### Validacao

Emulador, com mp4 real gravado por `adb shell screenrecord`: post id 7 criado
com `.../video/upload/.../gffxd0rck0v6bpo0pmis.mp4`; no app a barra de progresso
andou de x=229 para x=878 em 2s (tocando); no site o `<video>` reportou
250x500 e 3,52s. 385 testes verdes, analyze 0 issues, web com typecheck/lint/
build limpos.

### Pendencia

O APK **nao foi instalado no celular do usuario**: `INSTALL_FAILED_UPDATE_INCOMPATIBLE`,
a chave de debug da maquina mudou. Para instalar e preciso desinstalar antes
(`adb -s b99d3e5a uninstall com.example.weunite_mobile`), o que apaga a sessao.
Nao feito sem autorizacao.

Video **no chat** continua nao existindo em lugar nenhum; exigiria mexer no enum
da API.

## Merges na `main` (2026-09-26)

Tudo o que as etapas 1 e 2 produziram esta na `main`, em tres merges, sem quebrar web nem mobile:

| PR                                                             | Commit na `main` | Conteudo                                                                                                                                                                                            |
| -------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#38](https://github.com/WeUnite-Social-Media/weunite/pull/38) | `17cf3d9`        | Backlog mobile inteiro + paridade com o desktop (etapas 1 e 2).                                                                                                                                     |
| [#33](https://github.com/WeUnite-Social-Media/weunite/pull/33) | `b02980a`        | Verificacao de e-mail (trabalho do colega). Dois conflitos resolvidos mantendo os dois lados; `verifyEmail` adaptado para `AuthDto`/`decodeResponseData` e passando a guardar a expiracao do token. |
| [#39](https://github.com/WeUnite-Social-Media/weunite/pull/39) | `56a736a`        | Criacao de oportunidade, portada do PR #37 com o credito de autoria preservado (o #37 recebeu um comentario explicando, nao foi fechado).                                                           |

A CI ficou verde pela primeira vez desde que o app Flutter entrou no monorepo: o `ci.yml` ganhou
`subosito/flutter-action@v2` + `flutter pub get`, e o build do APK ficou **fora** do pipeline
(`turbo run build --filter=!@weunite/mobile`), porque o runner nao tem Android SDK. Lint, typecheck
e os testes do Flutter rodam normalmente.

Rollback: qualquer um dos tres merges pode ser revertido isoladamente (`git revert -m 1 <sha>`).

## Etapa 3 - Autenticacao mobile (itens 31-52)

_Branch `feat/mobile-auth-parity`, a partir de `origin/main` (`56a736a`). Commit `b8b8719`._

**O que o web realmente tem** (levantado antes de escrever qualquer linha):

| Arquivo web                                       | Papel                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `features/auth/components/Login.tsx`              | login, olho na senha, link "Esqueceu sua senha?", botao Google **sem handler** |
| `features/auth/components/SignUp.tsx`             | cadastro de atleta, barra de forca, checkbox de termos, `TermsModal`           |
| `features/auth/components/SignUpCompany.tsx`      | cadastro de clube, mascara de CNPJ, **sem** barra de forca                     |
| `features/auth/pages/VerifyEmail.tsx`             | codigo de 6 digitos (`InputOTP`); "Reenviar codigo" **nao reenvia**            |
| `features/auth/pages/SendResetPassword.tsx`       | e-mail + reenvio real com contador de 60s                                      |
| `features/auth/pages/VerifyResetToken.tsx`        | codigo de 6 digitos do reset                                                   |
| `features/auth/pages/ResetPassword.tsx`           | nova senha + confirmacao + barra de forca                                      |
| `features/auth/stores/useAuthStore.ts`            | estado (zustand + persist), jwt e user                                         |
| `features/auth/api/authService.ts`                | os 7 endpoints                                                                 |
| `shared/schemas/common/user.schema.ts`            | nome, username, e-mail, senha                                                  |
| `features/auth/schemas/*.schema.ts`               | login, cadastro, recuperacao                                                   |
| `shared/validators/cnpjValidator.ts`              | digitos verificadores do CNPJ                                                  |
| `features/auth/hooks/usePasswordStrength.ts`      | score 0-100 (20 por criterio)                                                  |
| `features/legal/components/TermsOfUseArticle.tsx` | texto dos termos                                                               |

**API** (`AuthController`): `POST /auth/signup`, `/auth/signup/company`, `/auth/login`,
`/auth/verify-email/{email}`, `/auth/send-reset-password`, `/auth/verify-reset-token/{email}`,
`/auth/reset-password/{token}`. Nenhuma rota social, nenhum reenvio de confirmacao.

| #   | Item                                | Status | Observacoes                                                                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 31  | Analise completa do auth web        | OK     | Tabela acima; os 12 pontos pedidos foram levantados antes de mexer no mobile.                                                                                                                                                                                                                                                    |
| 32  | Cadastro pelo mobile nao funcionava | OK     | **Causa achada:** o app chamava `/auth/signup/company` **sem senha**, e as duas rotas usam o mesmo `CreateUserRequestDTO`, cujo `password` e `@NotBlank @ValidPassword`. Confirmado contra a API real: payload antigo -> `400 {"password":"Senha invalida"}`; payload novo -> `201`.                                             |
| 33  | Verificacao de e-mail               | OK     | Ja existia (PR #33) e foi mantida; tela redesenhada, campo de 6 digitos que envia sozinho ao completar, e a sessao que a API devolve passa a ser guardada com expiracao. **Reenvio nao existe na API** - nao foi inventado.                                                                                                      |
| 34  | Forca da senha                      | OK     | `passwordStrength` e porte exato do `usePasswordStrength` (20 por criterio). Barra + checklist dos 5 requisitos.                                                                                                                                                                                                                 |
| 35  | Confirmacao de senha                | OK     | Nos dois cadastros e na nova senha. Mensagem "As senhas devem ser iguais", a mesma do `resetPasswordSchema`. **A web nao tem confirmacao no cadastro** - diferenca proposital.                                                                                                                                                   |
| 36  | Mostrar/esconder senha              | OK     | `PasswordFormField` usado em todos os campos sensiveis (login, cadastro, confirmacao, nova senha, confirmacao da nova, clube). So alterna `obscureText`: nao mexe no texto nem no foco.                                                                                                                                          |
| 37  | Aceite dos termos                   | OK     | Checkbox + "Ler termos e condicoes" abrindo os Termos de Uso com o texto do web. **Enforcado no mobile e corrigido na web**: `required` nao faz nada no checkbox do Radix, entao o site deixava cadastrar sem aceite. Nao ha politica de privacidade no projeto - nao foi inventada URL.                                         |
| 38  | Esqueceu a senha                    | OK     | Tres telas novas sobre os tres endpoints que o web usa, incluindo o contador de 60s do reenvio. Fluxo inteiro exercitado contra a API real.                                                                                                                                                                                      |
| 39  | Login com Google                    | FORA   | **Nao ha o que reaproveitar.** O botao do web nao tem `onClick`, provider, client id nem endpoint; `/api/auth` tem 7 rotas, nenhuma social. Implementar exigiria criar autenticacao nova no backend - o oposto da regra "nao criar um segundo sistema". O mobile ficou **sem** o botao, em vez de ganhar um segundo botao morto. |
| 40  | Cadastro de clube - senha           | OK     | Senha, confirmacao, olho, forca e termos, iguais ao atleta. Era o campo que faltava (item 32).                                                                                                                                                                                                                                   |
| 41  | Cadastro de clube - forca           | OK     | Mesmo `auth_validation.dart` do atleta e do reset. **A web tambem ganhou a barra**, pelo mesmo hook do cadastro de atleta.                                                                                                                                                                                                       |
| 42  | Cadastro de clube - fluxo completo  | OK     | Campos do web: nome, username, e-mail, senha, CNPJ com mascara progressiva e digitos verificadores. Nao ha logo, endereco, documentos nem responsaveis no cadastro web - nada foi inventado.                                                                                                                                     |
| 43  | Validacoes iguais as do web         | OK     | Um arquivo so (`features/auth/domain/auth_validation.dart`) para atleta, clube e recuperacao. Testes travam as regras contra os schemas do web.                                                                                                                                                                                  |
| 44  | Mensagens de erro                   | OK     | O app mostra a mensagem que a API devolve ("Usuario ja existe", "Verifique seu email para fazer login", "Token invalido", "Usuario nao encontrado"), via `_extractApiErrorMessage`. `decodeResponseMessage` faz o mesmo no caminho de sucesso.                                                                                   |
| 45  | Loading e duplo envio               | OK     | Guard `if (state.isLoading) return;` no cubit + botoes desabilitados com spinner em todas as acoes.                                                                                                                                                                                                                              |
| 46  | Sessao e persistencia               | OK     | `TokenStorage` com expiracao; `verifyEmail` passou a gravar a expiracao como o login ja fazia. Nao existe refresh token na API.                                                                                                                                                                                                  |
| 47  | Navegacao                           | OK     | Rotas `/verify-email/:email`, `/send-reset-password`, `/verify-reset-token/:email`, `/reset-password/:token`, todas liberadas para visitante; `/signup?tab=company` abre direto o cadastro de clube.                                                                                                                             |
| 48  | Design                              | OK     | Wordmark, titulos e textos do web, adaptados: um scroll por tela, campos de largura cheia, abas Atleta/Clube em vez de duas rotas, codigo em um campo so (seis caixas separadas quebram o foco no Android e impedem colar).                                                                                                      |
| 49  | Bateria de testes                   | OK     | 373 testes automatizados + os seis roteiros rodados no emulador contra a API real (ver acima).                                                                                                                                                                                                                                   |
| 50  | Reteste do web                      | OK     | `typecheck`, `lint` e `build` limpos; login, cadastro de atleta e de clube, feed, oportunidades, chat e perfil conferidos no navegador.                                                                                                                                                                                          |
| 51  | Documentacao                        | OK     | Esta secao + secao no `HANDOFF.md`.                                                                                                                                                                                                                                                                                              |
| 52  | Doc para testar no celular          | OK     | Secao 10 do `MOBILE_TESTING.md`: regras de senha, como ler o codigo no banco quando nao ha SMTP, os roteiros e o que **nao** da para testar.                                                                                                                                                                                     |

### Diferencas propositais em relacao ao web (e por que)

1. **Confirmacao de senha nos cadastros.** O teclado do celular erra mais e o erro fica escondido
   atras dos pontinhos; a conta so e usavel se a senha estiver certa.
2. **Maximo de 30 caracteres na senha.** So a API cobrava (`ValidPasswordValidator.MAX_LENGTH`);
   o schema do web nao tem teto, entao o navegador aceita e o servidor recusa.
3. **Conjunto de simbolos da API, nao o do zod.** `/[^A-Za-z0-9]/` aceita `~`, que o
   `ValidPasswordValidator` recusa. O app usa a lista do servidor e avisa antes de enviar.
4. **Sem botao do Google** (item 39).
5. **Sem botao de reenviar o codigo de confirmacao** - nao existe endpoint; o do web so reinicia
   um contador.

### Armadilha encontrada na API (e evitada)

`POST /auth/send-reset-password` responde `{"message":"Codigo enviado!"}` - **sem a chave `data`**.
Usar `decodeResponseData` aqui estouraria `FormatException('ResponseDTO without data')` num caso de
sucesso. Por isso existe `decodeResponseMessage`, que le so a mensagem e nunca lanca.

### Fluxos exercitados contra a API real (backend no Docker)

| Fluxo                                                            | Resultado                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `POST /auth/signup/company` com o payload **antigo** (sem senha) | `400 {"password":"Senha invalida"}` - o bug do item 32, reproduzido |
| `POST /auth/signup/company` com o payload **novo**               | `201 Cadastro concluido! Verifique seu email`                       |
| `POST /auth/signup` (atleta)                                     | `201`                                                               |
| Username duplicado / e-mail duplicado                            | `409 Usuario ja existe`                                             |
| Login antes de verificar o e-mail                                | `400 Verifique seu email para fazer login`                          |
| `POST /auth/verify-email/{email}` com o codigo do banco          | `200` + jwt + `expiresIn`                                           |
| Login depois de verificar                                        | `200`                                                               |
| `POST /auth/send-reset-password`                                 | `200 Codigo enviado!` (sem `data`)                                  |
| `verify-reset-token` com codigo errado                           | `400 Token invalido`                                                |
| `verify-reset-token` com codigo certo                            | `200 Codigo verificado!`                                            |
| `reset-password` com senha fraca                                 | `400` com a regra que faltou                                        |
| `reset-password` com senha valida                                | `200 Senha redefinida!`                                             |
| Login com a senha nova / com a antiga                            | `200` / `401 Usuario ou senha invalidos`                            |
| `send-reset-password` para e-mail inexistente                    | `404 Usuario nao encontrado`                                        |

### Bug encontrado rodando o fluxo no emulador (e corrigido)

Depois de redefinir a senha, o app caia na tela "Page Not Found" do go_router.
A senha **tinha** sido trocada; o problema era so de navegacao.

Causa: login, cadastro e os tres passos da recuperacao compartilham um
`AuthCubit`, e cada tela continua montada embaixo da seguinte. Como cada uma
navegava a partir de um `BlocListener`, a mensagem de sucesso do ultimo passo
chegava tambem nas de baixo: a tela do codigo, dois niveis abaixo, rodava a
propria navegacao de novo e empurrava `/reset-password/` sem codigo. Os
snackbars se empilhavam pelo mesmo motivo.

Correcao (`runAuthAction`, commit `acac6cf`): a tela chama a acao, espera e
trata a resposta ali mesmo. Nenhuma tela de auth ouve mais o cubit para
navegar. `password_recovery_flow_test.dart` percorre os tres passos e trava o
caso, mais codigo errado, e-mail inexistente, confirmacao diferente e senha
fraca.

### Roteiros rodados no emulador (API real no Docker)

TESTE 1 - novo usuario

- abrir cadastro pelo link "atleta" do login
- senha fraca: barra vermelha em 40%, so dois itens marcados
- olho mostra e esconde a senha sem apagar o texto nem tirar o foco
- cadastrar sem termos: "Aceite os termos para criar sua conta." e nada e enviado
- confirmacao diferente: "As senhas devem ser iguais" e nada e enviado
- "Ler termos e condicoes" abre o documento com a data 28/03/2026
- aceitar os termos e cadastrar: snackbar com a mensagem da API
  ("Cadastro concluido! Verifique seu email") e a tela do codigo
- codigo de 6 digitos lido no banco: envia sozinho no sexto digito e entra no
  feed ja autenticado; o perfil mostra a conta nova

TESTE 2 - e-mail/usuario ja existente

- "Usuario ja existe" e o usuario continua no formulario

TESTE 3 - login

- senha errada: "Usuario ou senha invalidos"
- senha certa: entra
- force-stop + reabrir: continua logado

TESTE 4 - Google: nao existe no projeto (item 39)

TESTE 5 - esqueceu a senha

- e-mail -> "Codigo enviado!" -> tela do codigo com o e-mail na tela
- codigo errado: "Token invalido"
- codigo certo: "Codigo verificado!" -> tela da nova senha
- confirmacao diferente: "As senhas devem ser iguais"
- senha valida: "Senha redefinida!" e volta para o login limpo
- entra com a senha nova; a antiga da 401

TESTE 6 - cadastro de clube

- link "clube" do login abre a aba Clube direto
- CNPJ com mascara progressiva; `11.222.333/0001-82` e recusado com
  "CNPJ invalido" antes de sair do app
- `11.222.333/0001-81` passa, conta criada, e-mail verificado, perfil do clube
  com a aba "Oportunidades"

Cruzado: a conta criada **no app** entra no **site**, inclusive com a senha
redefinida pelo app.

## Status dos itens

Legenda: ✅ concluído e validado no emulador · 🟡 parcial · ⏳ pendente · ⛔ bloqueado

| #   | Item                                 | Status | Observações                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Barra de pesquisa na Home            | ✅     | Barra no topo do feed → `/search` (debounce 300ms). Seções Pessoas/Posts/Oportunidades, loading, vazio, erro. Commit `3277333`.                                                                                                                                                                              |
| 2   | Pesquisa de usuários (nome/username) | ✅     | Seção "Pessoas" com `GET /user/search`; avatar, nome, @username, chip Empresa; toque abre o perfil.                                                                                                                                                                                                          |
| 3   | Imagem em posts                      | ✅     | Picker, preview, remover, "Trocar imagem", upload Cloudinary, feed e perfil, persiste. ("Trocar imagem" só analisado, não exercitado no emulador.)                                                                                                                                                           |
| 4   | Post atualiza no perfil              | ✅     | `PostEvents` sincroniza feed↔perfil. Validado após force-stop + relaunch.                                                                                                                                                                                                                                    |
| 5   | Nome do autor no feed                | ✅     | **Bug de backend**: alias `u.name AS userName` colidia com `username`. Alias → `authorName` (`ac901c4`) + teste de persistência. Corrige também a web.                                                                                                                                                       |
| 6   | Abrir perfil ao clicar no usuário    | ✅     | `openUserProfile` em PostCard, comentários, card/detalhe de oportunidade e busca. Chat **não** alterado (regra do item). `UserProfileScreen` lista os posts do usuário.                                                                                                                                      |
| 7   | Salvar oportunidade                  | ✅     | Toggle + leitura de volta (`isSaved`), ícone preenchido, flag carregada na listagem, persiste.                                                                                                                                                                                                               |
| 8   | Candidatura                          | ✅     | Toggle + `isSubscribed`, contador ajusta, duplo toque bloqueado (`pendingIds`), persiste.                                                                                                                                                                                                                    |
| 9   | Detalhes da oportunidade             | ✅     | Sheet com status, empresa clicável, descrição, skills, local, prazo, publicação, candidatos e ações. Campos inexistentes no banco (requisitos/modalidade/vagas) **não foram inventados**.                                                                                                                    |
| 10  | Etiquetas de habilidade ilegíveis    | ✅     | `chipTheme` com cores explícitas + teste de contraste WCAG (`bc5ec0f`).                                                                                                                                                                                                                                      |
| 11  | Edição do perfil                     | ✅     | Validado no emulador (gravou altura/peso/posição/pé em `athlete_profile`). Tela "Editar perfil" (nome, username, bio, privado, altura, peso, posição, perna, nascimento, skills, foto, capa, remover capa) → `PUT /user/update/{username}` + `DELETE /user/banner/delete/{username}`. Commit `19b6435`.      |
| 12  | Chat atualiza automaticamente        | ✅     | `ChatCubit` assina o tópico STOMP de todas as conversas; prévia, horário, badge e reordenação.                                                                                                                                                                                                               |
| 13  | Estado vazio no chat                 | ✅     | Ícone + texto + CTA "Nova conversa" (busca do chat, item 19) + pull-to-refresh.                                                                                                                                                                                                                              |
| 14  | Marcar mensagens como lidas          | ✅     | `PUT /conversations/{id}/read/{userId}` ao abrir e ao receber com a tela aberta; badge zera; conferido no banco.                                                                                                                                                                                             |
| 15  | Destaque dos itens da lista de chat  | ✅     | Card branco com borda (verde quando não lida), avatar, nome, prévia, horário relativo e badge vermelho.                                                                                                                                                                                                      |
| 16  | Fotos no chat                        | ✅     | `POST /messages/upload` → URL → mensagem STOMP `type: IMAGE`; bolha renderiza a imagem.                                                                                                                                                                                                                      |
| 17  | Emojis no chat                       | ✅     | UTF-8 preservado (`jsonEncode`) + seletor rápido de 20 emojis no compositor.                                                                                                                                                                                                                                 |
| 18  | PROGRESS.md / continuidade           | ✅     | Este arquivo + `HANDOFF.md`.                                                                                                                                                                                                                                                                                 |
| 19  | Nova conversa a partir do chat       | ✅     | Tela `/chat/new`: só usuários, sem posts/oportunidades, eu mesmo fora da lista; toque abre/cria a conversa e **não** o perfil. Entradas: barra no topo da aba Chat, FAB e CTA do estado vazio. Validado — criou a conversa 2, a lista atualizou, e buscar de novo abriu a **mesma** conversa.                |
| 20  | Oportunidades da empresa no perfil   | ✅     | `CompanyOpportunitiesCubit` + `CompanyOpportunitiesList` na aba "Oportunidades" do perfil da empresa e em `/profile/:userId` de empresa; abre o detalhe. Recarrega no pull-to-refresh (`refreshTick`). Validado com 3 oportunidades, incluindo uma criada pela API durante o teste.                          |
| 21  | Enviar mensagem pelo perfil          | ✅     | Botão **"Conversar"** no perfil de terceiros (mesmo par do `HeaderProfile` da web); abre a conversa existente ou cria. Validado: abriu a conversa 1 com a Ana, com histórico, sem duplicar.                                                                                                                  |
| 22  | Seguir usuários                      | ✅     | `Seguir`/`Deixar de seguir` no perfil; `POST /follow/followAndUnfollow/{a}/{b}`, estado lido de `GET /follow/get/{a}/{b}` (`ACCEPTED`) e relido após o toggle; contador acompanha. Validado seguir → persistir ao reabrir → deixar de seguir (tabela `follow`).                                              |
| 23  | Seguir clubes/empresas               | ✅     | Mesmo componente e mesma regra do item 22 — a web e a API não distinguem papel aqui. Validado no perfil da empresa.                                                                                                                                                                                          |
| 25  | Características do atleta            | ✅     | Aba "Sobre" replica o `AboutProfile` da web (Idade, Posição, Pé dominante, Altura, Peso com `N/A`, + habilidades). Editar perfil passou a gravar **altura em metros** (gravava cm, virava "182m") e o pé dominante virou seleção com as 3 opções da web, preservando valor legado. Validado: 1.82m / Destro. |
| 26  | Peneiras — inscrição do atleta       | ✅     | A ação existia só no detalhe, abaixo da dobra. Agora o **card** tem "Candidatar-se" (como o card da web) e no detalhe o botão é fixo no rodapé; rótulos iguais aos da web. Validado: candidatura gravada em `subscriber` a partir do perfil da empresa.                                                      |
| 27  | Peneiras — salvar                    | ✅     | O bookmark já existia na aba Oportunidades; passou a existir também nas oportunidades listadas no perfil da empresa (para quem vê como atleta), com as flags resolvidas igual à listagem principal.                                                                                                          |

| 29 | Abas no perfil de outro usuário | ✅ | `ProfileTabs` extraído do meu perfil e usado nos dois: Posts / Sobre / Oportunidades (empresa). Só o conteúdo da aba selecionada aparece. Mesma divisão do `FeedProfile.tsx` da web (que também só mostra a aba de oportunidades em perfil de empresa). |
| 30 | Aba "Salvos" no meu perfil | ✅ | `SavedOpportunitiesCubit` + `SavedOpportunitiesList` sobre `GET /saved-opportunities/athlete/{id}` — o mesmo endpoint da página "Oportunidades salvas" da web, através do método de data source que já alimentava as flags. Abre o detalhe, remove dos salvos (a web não permite), estado vazio com o texto da web, e recarrega ao selecionar a aba. |
| 31 | Status de visualização no chat | ✅ | Duplo check nas minhas mensagens (cinza → verde), campo `isRead` do `MessageDTO`, igual ao `Message.tsx` da web. Além disso o app assina `/topic/conversation/{id}/read` — tópico que a API **já publicava** e a web não escuta — e publica em `/app/chat.markAsRead` junto do PUT REST, então o check fica verde em tempo real. |
| 32 | Badge de não lidas na navegação | ✅ | Badge vermelho (com corte "9+", como a web faz no badge de notificações) no ícone de Chat, derivado de `ChatState.totalUnreadCount` — a soma do `unreadCount` das conversas já mantidas pelo `ChatCubit`. Sem contador paralelo e sem requisição extra. A web não tem esse badge. |

> Não houve item 24 nem 28 na lista enviada pelo usuário.

## Próximo item

Itens 1–27 concluídos e validados no emulador. Sugestão de continuidade (paridade com a web):

1. Telas que a web tem e o mobile não: **"Oportunidades salvas"** e **"Minhas candidaturas"** (`/opportunity/saved`, `/opportunity/my-opportunities`) e **"Ver inscritos"** para a empresa dona (`/opportunity/:id/subscribers`).
2. `/posts/:postId` (detalhe do post) ainda é placeholder.
3. Criação/edição de oportunidade pelo mobile (hoje só pela API/web).
4. Listas de seguidores/seguindo (na web os contadores abrem modais).

## Bugs conhecidos (fora da lista, encontrados em QA)

- `/posts/:postId` (`PostDetailScreen`) é placeholder.
- `GET /api/user/search` também casa por e-mail (possível exposição) — decisão do time.
- Pull-to-refresh em `UserProfileScreen` mostra spinner de tela cheia — cosmético.
- `ChatController` confia no `senderId` do payload STOMP (backend; decisão do time).
- `AppUser` em cache não reflete edição de nome/foto até novo login.

## Pendências

- Menu de 3 pontos do `PostCard`: implementado só o item "Denunciar" (não-autor). A web
  mostra "Editar"/"Excluir"/"Compartilhar" para o autor do post — o mobile ainda não tem
  fluxo de editar/excluir post, e "Compartilhar" foi deixado de fora desta etapa por
  decisão do time: a web não tem rota pública de post (`/posts/:postId` continua
  placeholder) e o botão de compartilhar dela é um no-op. Até isso existir, o autor não
  vê nenhum menu no card.
- (2026-09-26) `OpportunityCard`/`OpportunityDetailSheet` redesenhados (hierarquia da web,
  menu de 3 pontos com "Denunciar" para quem não é dono, carrossel "Oportunidades
  Sugestões"). A empresa dona **não** vê menu nem rodapé no card: a web mostra
  "Ver inscritos (N)", "Editar", "Excluir" e "Compartilhar" para o dono, e o mobile ainda
  não tem tela de inscritos nem fluxo de editar/excluir oportunidade — decisão desta etapa
  foi não criar essa tela e deixar o dono sem ação nenhuma no card/detalhe, com comentário
  no código (`opportunity_card.dart`) explicando o motivo, em vez de expor um menu parcial.

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
- (2026-09-18) A busca do Chat é um cubit próprio (`UserSearchCubit`), não o `SearchCubit` da Home: a Home busca 3 fontes e abre perfil; o chat busca só usuários e abre conversa.
- (2026-09-18) `/chat/new` **devolve** o id da conversa com `context.pop(id)` em vez de `pushReplacement`: com replace o `await` da aba Chat terminava cedo e a lista não recarregava.
- (2026-09-18) `/chat/new` é declarada **antes** de `/chat/:conversationId` no router, senão "new" seria lido como id.
- (2026-09-18) O FAB da aba Chat tem `heroTag` próprio (o FAB do feed continua vivo no `IndexedStack`).
- (2026-09-18) `CurrentUserProvider` passou a ser exposto no `MultiRepositoryProvider` (a busca do chat exclui o próprio usuário).
- (2026-09-18) Follow: estado vem de `GET /follow/get/{a}/{b}` e é **relido** após o toggle; a web deduz pela string da mensagem ("Seguiu"), o que é frágil.
- (2026-09-18) Altura é gravada em **metros** (a web usa metros e renderiza "1.82m"); o mobile gravava centímetros.
- (2026-09-18) O pé dominante virou seleção com as 3 opções da web, mantendo como opção o valor já salvo para não apagar dado legado.
- (2026-09-18) `ProfileTabs` é um só componente para os dois perfis; a web faz igual (`FeedProfile` serve o meu perfil e o de terceiros, mudando só pela role do dono).
- (2026-09-18) A aba de oportunidades/salvos recarrega ao ser **selecionada** (bump do `refreshTick`): sem isso, algo salvo no desktop não aparecia até dar pull-to-refresh.
- (2026-09-18) O recibo de leitura usa o tópico `/topic/conversation/{id}/read` que o backend já publicava; o mobile passou a publicar em `/app/chat.markAsRead` **além** do PUT REST, porque o REST não faz broadcast. Nada novo foi criado na API.
- (2026-09-18) O badge da navegação lê `ChatState.totalUnreadCount` (soma do `unreadCount` das conversas). Não criar contador próprio para a barra.

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
- `270c0da` — cria o `HANDOFF.md` e atualiza este arquivo.
- `e64e59f` — itens 19 e 20 (UI): `UserSearchCubit`, `NewConversationScreen`, rota `/chat/new`, barra/FAB na aba Chat, `CompanyOpportunitiesCubit` + `CompanyOpportunitiesList` nas telas de perfil, `CurrentUserProvider` no provider tree.
- `2c8f203` — correções achadas no emulador: a lista de conversas não recarregava depois de criar, e as oportunidades da empresa não recarregavam no pull-to-refresh.
- `c9282c2` — itens 21, 22, 23, 25, 26 e 27: `UserProfileActions` (Seguir/Conversar), leitura e toggle de follow, `AboutProfile`, editar perfil em metros + seleção de pé dominante, `SubscribeButton` no card e fixo no detalhe, ações nas oportunidades do perfil da empresa.

## Git, PR e configuração de agentes

- Branch: `feat/mobile-backlog`, empilhada em `feat/mobile-post-image-and-profile-posts` (base do PR).
- **PR [#38](https://github.com/WeUnite-Social-Media/weunite/pull/38)** — "feat(mobile): fecha o backlog de 27 itens usando o desktop como referencia": 18 commits, 109 arquivos, nenhum arquivo de `apps/web`.
- Não havia PR anterior para esta branch (os PRs #33, #35 e #37 são das branches anteriores da pilha e não foram tocados).
- Commits desta última etapa: `3bd096f` (abas + aba Salvos), `4187800` (duplo check + badge), `3aa1c37` (recarregar a aba ao selecionar).
- **Agentes:** nenhuma configuração de agente/modelo foi alterada em disco nesta sessão — não existe `.claude/agents` no repositório nem no perfil do usuário, e `~/.claude/settings.json` só tem `autoUpdatesChannel` e `theme` (inalterados). O uso de agentes mais fortes foi apenas a execução de subagentes de leitura dentro da sessão, que não persiste configuração. Portanto **não há o que restaurar**; nada foi adivinhado.

## CI conhecida (falha pré-existente)

O check `validate` do GitHub Actions falha em `@weunite/mobile#lint` com `sh: 1: flutter: not found`: o `ci.yml` instala pnpm/Node/Java mas não o Flutter, e os scripts do pacote mobile chamam `flutter`. **Não é causado por este trabalho** — o mesmo check falha no PR #37, de uma branch anterior. Correção sugerida: passo `subosito/flutter-action@v2` no workflow. Detalhes na seção 39 do `HANDOFF.md`.

## Testes

- Mobile: `dart format` limpo; `flutter analyze` **0 issues**; `flutter test` **197 verdes**.
- API: `PostInteractionPersistenceTest` (10) + `PostServiceTest` (10) verdes no container.
- Emulador: itens **1–27 validados** (detalhe na seção 25 do `HANDOFF.md`).
- Pendente de validação: apenas o botão "Trocar imagem" do compositor de post.
