# Implementação da tela de detalhes da publicação

## 1. O que foi implementado

Esta implementação resolveu uma parte importante que estava pendente no projeto WeUnite: a abertura de uma publicação em uma tela própria.

Antes da alteração:

- o sistema já sabia consultar uma publicação pela API;
- o aplicativo web já possuía alguns componentes usados pelo feed;
- o aplicativo mobile possuía uma rota chamada `/posts/:postId`;
- essa rota mobile mostrava apenas uma tela provisória com a mensagem “Detalhe do post ainda não implementado”.

Depois da alteração:

- ao tocar em uma publicação no mobile, o usuário é levado para uma tela com os dados completos;
- ao tocar no conteúdo de uma publicação na web, o navegador abre uma página própria;
- a página consulta o servidor e mostra conteúdo, imagem, autor, curtidas e comentários;
- notificações relacionadas a uma publicação levam diretamente para o detalhe;
- o botão Compartilhar da web agora gera uma URL pública da publicação;
- quando o compartilhamento não é disponível pelo navegador, o endereço é copiado para a área de transferência.

A implementação não criou um novo sistema de publicação e não duplicou regras de negócio. Ela reaproveitou os endpoints existentes da API.

---

## 2. Por que esta funcionalidade foi escolhida

Esta foi considerada uma das mudanças com melhor custo-benefício no estado atual do projeto.

### Motivos

1. **O backend já possuía o recurso necessário.**

   A API já expõe `GET /api/posts/get/{postId}` e devolve os dados completos de uma publicação.

2. **A estrutura mobile já tinha a rota reservada.**

   A rota `/posts/:postId` já existia no roteador, mas usava uma tela provisória.

3. **A tela ajuda vários fluxos já existentes.**
   - notificações de curtida;
   - notificações de comentário;
   - resposta a comentários;
   - compartilhamento;
   - abertura pelo feed;
   - abertura pelo perfil;
   - abertura pelo resultado de pesquisa.

4. **Ela corrige uma lacuna conhecida.**

   Antes, algumas notificações não tinham um destino adequado e precisavam abrir o feed antes de mostrar os comentários.

5. **Ela usa a arquitetura atual.**

   A aplicação já está dividida em API, web e mobile. A alteração foi feita nas partes responsáveis pela apresentação e pelo consumo dos dados, sem mover regras de negócio para o frontend.

---

## 3. Como o projeto está organizado

### API

A API principal está em `apps/api` e utiliza Spring Boot.

Ela possui o controlador e o serviço responsáveis pelas publicações em:

- `apps/api/src/main/java/com/weunite/api/posts/controller/PostController.java`
- `apps/api/src/main/java/com/weunite/api/posts/service/PostService.java`

O endpoint usado por esta tarefa é:

```text
GET /api/posts/get/{postId}
```

Exemplo:

```text
GET /api/posts/get/12
```

Esse endpoint consulta a publicação pelo identificador e devolve um objeto dentro de uma resposta padrão da API.

### Web

A aplicação web está em `apps/web` e utiliza React, Vite e React Router.

Os principais componentes desta entrega são:

- `apps/web/src/features/feed/pages/PostDetailPage.tsx`
- `apps/web/src/features/feed/routes/HomeRoutes.tsx`
- `apps/web/src/features/feed/components/post/Post.tsx`
- `apps/web/src/features/feed/state/usePosts.ts`
- `apps/web/src/features/feed/api/postService.ts`

### Mobile

O aplicativo mobile está em `apps/mobile` e utiliza Flutter e Dart.

Os principais componentes desta entrega são:

- `apps/mobile/lib/features/feed/presentation/screens/post_detail_screen.dart`
- `apps/mobile/lib/features/feed/presentation/widgets/post_card.dart`
- `apps/mobile/lib/features/feed/data/feed_remote_data_source.dart`
- `apps/mobile/lib/features/feed/data/feed_repository_impl.dart`
- `apps/mobile/lib/features/feed/domain/repositories/feed_repository.dart`
- `apps/mobile/lib/features/feed/data/feed_models.dart`
- `apps/mobile/lib/features/feed/data/feed_models.g.dart`

---

## 4. Funcionamento da API

O controlador já continha o endpoint antes desta implementação:

```java
@GetMapping("/get/{postId}")
public ResponseEntity<ResponseDTO<PostDTO>> getPost(@PathVariable Long postId)
```

O serviço busca a publicação no banco de dados e utiliza o mapper para converter a entidade em um `PostDTO`.

O formato básico da resposta é:

```json
{
  "message": "Publicação consultada com sucesso!",
  "data": {
    "id": "12",
    "text": "Texto da publicação",
    "imageUrl": "https://...",
    "likes": [],
    "comments": [],
    "createdAt": "2026-11-22T20:30:00Z",
    "updatedAt": "2026-11-22T20:30:00Z",
    "user": {
      "id": 7,
      "name": "Nome do usuário",
      "username": "usuario"
    }
  }
}
```

As propriedades podem ter nomes diferentes conforme os modelos reais, mas os campos utilizados nesta implementação são:

- `id`: identificador da publicação;
- `text`: texto da publicação;
- `imageUrl`: endereço da imagem;
- `likes`: lista de curtidas;
- `comments`: lista de comentários;
- `createdAt`: data de criação;
- `user`: autor da publicação.

Nenhuma nova rota foi criada no backend.

---

## 5. Alterações realizadas no web

### 5.1. Nova página de detalhes

Foi criado o componente `PostDetailPage`.

Essa página:

1. lê o identificador da publicação pela URL;
2. converte o texto do identificador em número;
3. usa `useGetPost` para consultar a API;
4. mostra o esqueleto de carregamento;
5. mostra uma mensagem de erro com botão de tentativa novamente;
6. renderiza o componente `Post` quando a consulta termina.

Arquivo:

```text
apps/web/src/features/feed/pages/PostDetailPage.tsx
```

### 5.2. Nova rota web

A rota foi registrada em `HomeRoutes`:

```text
/post/:postId
```

Exemplo real:

```text
/post/12
```

Ela está protegida por `PrivateRoutes`, portanto o usuário precisa estar autenticado.

Arquivo:

```text
apps/web/src/features/feed/routes/HomeRoutes.tsx
```

Também foi registrado o prefixo `/post/*` no arquivo principal de rotas:

```text
apps/web/src/app/App.tsx
```

### 5.3. Navegação ao tocar na publicação

O componente `Post` agora possui uma ação que monta a rota:

```text
/post/{id da publicação}
```

A navegação foi adicionada ao clicar no conteúdo da publicação.

Isso permite que o mesmo cartão usado no feed também leve para uma página detalhada.

### 5.4. Compartilhamento

O menu Compartilhar agora utiliza a API de compartilhamento nativa do navegador quando ela existe.

Quando não existe:

- o endereço da página é criado;
- o endereço é copiado usando `navigator.clipboard`;
- a URL fica disponível para colar em outro aplicativo ou conversa.

O endereço gerado segue o formato:

```text
https://dominio-do-site/post/{id}
```

---

## 6. Alterações realizadas no mobile

### 6.1. Tela provisória substituída

A tela provisória foi substituida por uma implementação que consulta o repositório mobile.

Arquivo:

```text
apps/mobile/lib/features/feed/presentation/screens/post_detail_screen.dart
```

Enquanto a informação está sendo buscada:

- aparece um indicador de carregamento.

Se ocorrer um erro:

- aparece uma mensagem amigável;
- aparece um botão “Tentar novamente”.

Quando a publicação é encontrada:

- o usuário recebe o cartão completo da publicação;
- o usuário pode atualizar a tela arrastando para baixo;
- o usuário pode curtir ou abrir os comentários.

### 6.2. Contrato da publicação completa

Foi criado o modelo `PostDetailDto`.

Ele representa o formato completo retornado por `GET /posts/get/{postId}`.

Propriedades adicionadas:

- `id`;
- `text`;
- `imageUrl`;
- `likes`;
- `comments`;
- `createdAt`;
- `user`.

Também foi criado `PostLikeDto`, usado para interpretar cada curtida da lista.

Essa representação evita acessar campos JSON de forma improvisada. Os campos são validados pelo gerador de serialização e devem corresponder à resposta da API.

Arquivo:

```text
apps/mobile/lib/features/feed/data/feed_models.dart
```

O arquivo `feed_models.g.dart` contém o código gerado de conversão JSON.

### 6.3. Consulta ao servidor

Foi adicionado ao `FeedRemoteDataSource` o método:

```dart
Future<PostDetailDto> getPost({required int postId})
```

Esse método:

1. chama `GET /posts/get/$postId`;
2. verifica o envelope `ResponseDTO`;
3. obtém o campo `data`;
4. converte o mapa JSON em `PostDetailDto`;
5. transforma erros HTTP em `AppException`.

Arquivo:

```text
apps/mobile/lib/features/feed/data/feed_remote_data_source.dart
```

### 6.4. Conversão para a entidade da tela

Foi adicionada a mesma cadeia usada nas outras partes do mobile:

```text
JSON da API
  -> PostDetailDto
  -> Post
  -> PostCard
```

O método `toEntity` conta os elementos das listas para obter:

- quantidade de curtidas;
- quantidade de comentários.

Ele também verifica se o identificador do usuário autenticado aparece na lista de curtidas para saber se o usuário já curtiu.

Arquivo:

```text
apps/mobile/lib/features/feed/data/feed_repository_impl.dart
```

### 6.5. Interface que abre o detalhe

O parâmetro `onOpen` foi adicionado ao `PostCard`.

Quando informado, ele envolve o cartão com uma área clicável. Quando não informado, o cartão continua funcionando normalmente.

A navegação foi conectada em:

- feed principal;
- tela de pesquisa;
- lista de publicações do perfil;
- notificações relacionadas a publicações.

Rotas utilizadas:

```text
/posts/{id}
```

Exemplo:

```text
/posts/12
```

---

## 7. Relacionamento entre web e mobile

A implementação mantém paridade entre as plataformas:

| Ação                 | Web                                  | Mobile                             |
| -------------------- | ------------------------------------ | ---------------------------------- |
| Abrir publicação     | `/post/{id}`                         | `/posts/{id}`                      |
| Consultar publicação | `GET /posts/get/{id}`                | `GET /posts/get/{id}`              |
| Mostrar carregamento | Esqueleto                            | Indicador circular                 |
| Mostrar erro         | Mensagem e botão                     | Mensagem e botão                   |
| Curtir               | Componente existente                 | Repositório existente              |
| Comentários          | Modal existente                      | Bottom sheet existente             |
| Atualizar publicação | React Query                          | `RefreshIndicator`                 |
| Compartilhar         | Compartilhamento nativo ou clipboard | Ainda não foi o foco desta entrega |

Os nomes das rotas são diferentes porque seguem as convenções já existentes em cada aplicativo. O recurso consultado no backend é o mesmo.

---

## 8. Alterações nos arquivos do projeto

### Web

Arquivos modificados:

- `apps/web/src/app/App.tsx`
- `apps/web/src/features/feed/components/post/Post.tsx`
- `apps/web/src/features/feed/routes/HomeRoutes.tsx`

Arquivo novo:

- `apps/web/src/features/feed/pages/PostDetailPage.tsx`

### Mobile

Arquivos modificados:

- `apps/mobile/lib/features/feed/data/feed_models.dart`
- `apps/mobile/lib/features/feed/data/feed_models.g.dart`
- `apps/mobile/lib/features/feed/data/feed_remote_data_source.dart`
- `apps/mobile/lib/features/feed/data/feed_repository_impl.dart`
- `apps/mobile/lib/features/feed/domain/repositories/feed_repository.dart`
- `apps/mobile/lib/features/feed/presentation/screens/feed_screen.dart`
- `apps/mobile/lib/features/feed/presentation/screens/post_detail_screen.dart`
- `apps/mobile/lib/features/feed/presentation/widgets/post_card.dart`
- `apps/mobile/lib/features/notifications/presentation/screens/notifications_screen.dart`
- `apps/mobile/lib/features/profile/presentation/widgets/profile_posts_list.dart`
- `apps/mobile/lib/features/search/presentation/screens/search_screen.dart`

Nenhuma migration de banco de dados foi criada.

Nenhum endpoint novo foi criado.

Nenhum arquivo de segredo ou configuração local foi alterado.

---

## 9. Conceitos técnicos explicados

### DTO

DTO significa _Data Transfer Object_, ou objeto de transferência de dados.

No projeto, o DTO representa o formato recebido da API. Ele evita que a tela trabalhe diretamente com dados JSON sem regras ou nomes definidos.

### Repository

O Repository é uma camada intermediária.

Ele recebe chamadas da interface e decide quais métodos remotos precisam ser executados.

No mobile, por exemplo:

```text
tela -> repository -> remote data source -> API
```

### Realtime

Não foi necessário alterar o realtime nesta entrega.

Curtidas, comentários e atualizações continuam utilizando os mecanismos já existentes no projeto.

### JSON

JSON é o formato usado pela API para enviar objetos e listas.

Exemplos:

- objeto: publicação;
- lista: curtidas;
- lista: comentários;
- texto: nome do usuário;
- número: identificador.

### Resposta com envelope

Alguns endpoints devolvem um objeto de resposta que contém:

- `message`;
- `data`.

No mobile foi usado `decodeResponseData` para obter somente o campo `data`.

Isso evita trabalhar com um objeto errado ou ignorar a estrutura real da resposta.

---

## 10. Resultado esperado

Ao abrir uma publicação pelo feed, perfil, pesquisa ou notificação:

1. o sistema recebe o identificador;
2. faz uma consulta a `GET /posts/get/{id}`;
3. mostra o resultado na tela própria;
4. permite atualizar os dados;
5. permite curtir;
6. permite abrir comentários;
7. permite acessar o perfil do autor;
8. permite compartilhar no web.

Se o identificador não existir ou tiver sido removido:

- a API retornará um erro;
- o mobile mostrará a tela de erro;
- o web mostrará a tela de erro;
- ambos oferecerão uma nova tentativa.

---

## 11. Validações realizadas

### Web

Foi executado:

```text
pnpm --filter @weunite/web exec tsc -b --noEmit
```

Resultado:

- passou sem erros.

Durante uma tentativa anterior de validação, o TypeScript criou arquivos `.js` como saída do processo. Esses arquivos gerados foram removidos do projeto para não serem enviados junto da implementação.

### Mobile

Não foi possível executar o `dart format`, `build_runner`, `flutter analyze` ou `flutter test` porque o Dart e o Flutter não estão disponíveis no PATH deste ambiente.

Também foi necessário manualmente preservar o arquivo gerado `feed_models.g.dart` até o ambiente do projeto conseguir executar o código generator.

Antes de considerar o mobile validado, é necessário executar no computador com Flutter instalado:

```text
cd apps/mobile
dart format lib test
dart run build_runner build --delete-conflicting-outputs
flutter analyze
flutter test
flutter run --dart-define-from-file=config/dev.json
```

---

## 12. Testes manuais recomendados

### Web

Teste os seguintes fluxos:

1. entrar no sistema;
2. abrir uma publicação;
3. verificar se o conteúdo foi exibido;
4. verificar se a imagem apareceu;
5. clicar no nome ou avatar do autor;
6. verificar se o perfil abriu corretamente;
7. curtir a publicação;
8. abrir comentários;
9. publicar um comentário;
10. clicar em Compartilhar;
11. copiar o endereço gerado;
12. abrir o endereço em outra aba;
13. conferir que o mesmo post é exibido.

Também teste:

- publicação sem texto;
- publicação sem imagem;
- publicação inexistente;
- publicação apagada;
- usuário sem sessão;
- falha temporária da API.

### Mobile

Teste os seguintes fluxos:

1. abrir o feed;
2. tocar em uma publicação;
3. confirmar que a tela própria foi aberta;
4. conferir autor, texto e imagem;
5. puxar para atualizar;
6. curtir;
7. abrir comentários;
8. criar um comentário;
9. voltar ao feed;
10. confirmar que os contadores foram atualizados;
11. tocar em uma publicação da busca;
12. tocar em uma publicação do perfil;
13. abrir uma publicação pela notificação;
14. testar publicação inexistente;
15. testar API desligada.

---

## 13. Pontos que ainda podem ser melhorados

Esta implementação resolveu o detalhe da publicação, mas alguns assuntos não foram introduzidos nesta tarefa:

- compartilhar no mobile;
- editar publicação pelo mobile;
- excluir publicação pelo mobile;
- página pública sem autenticação;
- preview social quando o endereço é enviado em redes sociais;
- versão compartilhável que funcione sem a necessidade de login;
- cache offline detalhado;
- carregamento paginado dos comentários na tela mobile;
- testes automatizados dedicados à tela de detalhes.

Essas melhorias são possíveis, mas não devem ser confundidas com a implementação atual.

---

## 14. Resumo simples

De forma resumida:

- a API já possuía o endpoint necessário;
- o web ganhou uma página chamada `/post/:postId`;
- o mobile deixou de usar uma tela provisória e passou a consultar `GET /posts/get/{postId}`;
- o web ganhou navegação pelo conteúdo do cartão e compartilhamento;
- o mobile ganhou navegação pelo feed, pesquisa, perfil e notificações;
- nenhum endpoint novo ou alteração no banco foi necessária;
- a validação web passou;
- a validação mobile ainda depende de um ambiente com Flutter instalado.

---

## 15. Estado final e próximos passos

Estado atual:

- implementação realizada;
- arquivos alterados na working tree;
- nenhum commit foi criado;
- nenhuma alteração foi enviada para o remoto.

Antes do commit, execute a revisão dos arquivos modificados:

```text
git diff --stat
git diff
```

Depois execute os testes disponíveis no ambiente.

Por fim, adicione os arquivos, crie o commit e envie a branch para o GitHub.

---

## 16. Correção da tela preta observada na rota do post

Durante o teste no navegador, a rota `/post/1` carregava em uma página escura sem mostrar o cartão da publicação.

Foi identificado que a rota de detalhe estava configurada por mais de um nível de roteamento:

```text
App.tsx
  -> HomeRoutes
     -> rota /post/:postId
```

Embora o endpoint `GET /api/posts/get/1` estivesse funcionando e devolvendo os dados da publicação, a tela não aparecia na interface.

A configuração foi simplificada em `apps/web/src/app/App.tsx`:

```text
App.tsx
  -> PrivateRoutes
     -> rota direta /post/:postId
        -> PostDetailPage
```

Isso mantém a proteção de autenticação e registra a página de detalhe diretamente no roteador principal.

A configuração anterior foi removida da lista de rotas internas do `HomeRoutes`.

Após o ajuste:

- a página `/post/1` mostrou o autor, texto e contadores;
- o conteúdo retornado pela API apareceu no navegador;
- o TypeScript passou com `tsc -b --noEmit`;
- o Docker permaneceu ativo na porta `3000` para web, `8080` para API e `5432` para PostgreSQL.
