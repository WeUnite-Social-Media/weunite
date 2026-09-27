# Testar o app mobile do WeUnite num celular real

Guia para rodar o aplicativo **fora da máquina de quem desenvolveu**. Escrito a partir de uma
instalação real num **POCO X5 Pro 5G (HyperOS/MIUI)**, incluindo as travas que aparecem no caminho.

> **Stack real do projeto** (confira antes de seguir qualquer tutorial genérico): o app é
> **Flutter** (Dart), em `apps/mobile`. **Não** é React Native e **não** usa Expo. O backend é
> **Spring Boot** (`apps/api`) com **PostgreSQL**, e o app web é React + Vite (`apps/web`).
> O monorepo usa **pnpm + turbo**, mas o app mobile é compilado pelo **Flutter SDK**, não pelo pnpm.

---

## 1. Pré-requisitos

| Ferramenta           | Versão usada                                           | Para quê                                              |
| -------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Git                  | qualquer recente                                       | clonar o repositório                                  |
| Flutter SDK          | **3.47.4** (Dart 3.13.3)                               | compilar e rodar o app                                |
| Android Studio       | Narwhal ou mais novo                                   | SDK do Android, drivers e emulador                    |
| Android SDK Platform | **API 36** (e API 35 para o emulador usado nos testes) | compilar                                              |
| Android NDK          | **28.2.13676358**                                      | exigido pelo Gradle deste projeto                     |
| JDK                  | **17** (o que vem com o Android Studio serve)          | Gradle                                                |
| Docker Desktop       | qualquer recente                                       | subir API + banco (só quem for rodar o backend local) |
| pnpm + Node 22       | opcional                                               | só se for mexer na web/API pelo monorepo              |

Confira o ambiente com:

```bash
flutter doctor -v
```

Tudo que estiver com ✗ relacionado a Android precisa ser resolvido antes. O item
"Android license status unknown" se resolve com `flutter doctor --android-licenses`.

---

## 2. Clonar e configurar

```bash
git clone https://github.com/WeUnite-Social-Media/weunite.git
cd weunite
git checkout feat/mobile-backlog
```

> A branch do trabalho mobile é `feat/mobile-backlog` (PR #38). Confirme com o time se já houve
> merge em `feat/mobile` ou `main`.

Instale as dependências do app:

```bash
cd apps/mobile
flutter pub get
```

### Arquivos de ambiente

O app **não usa `.env`**: as URLs entram por `--dart-define-from-file`, apontando para um JSON em
`apps/mobile/config/`. Há dois prontos:

| Arquivo           | Para quê                   | Conteúdo                                                    |
| ----------------- | -------------------------- | ----------------------------------------------------------- |
| `config/dev.json` | emulador Android           | `http://10.0.2.2:8080` (o host visto de dentro do emulador) |
| `config/lan.json` | celular real na mesma rede | `http://<IP-DA-MÁQUINA>:8080`                               |

As duas variáveis são `WEUNITE_API_URL` e `WEUNITE_WS_URL`. **Ajuste o IP de `config/lan.json`
para o IP da sua máquina** (`ipconfig` no Windows, `ip addr` no Linux) antes de rodar no celular.

O backend, esse sim, usa um `.env` na raiz do repositório. Ele **não está versionado** e contém
credenciais reais. Peça ao time o arquivo ou os valores; as chaves esperadas são:

```
DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_DOCKER_*
API_HOST_PORT, SERVER_PORT, CORS_ALLOWED_ORIGINS
JWT_PUBLIC_KEY, JWT_PRIVATE_KEY      # PEM RSA em base64
MAIL_USERNAME, MAIL_PASSWORD, MAIL_PORT
CLOUDINARY_URL
VITE_API_URL, VITE_WS_URL, VITE_MEDIA_URL
```

**Nunca** coloque os valores reais em commits, prints ou nesta documentação.

---

## 3. Subir o backend

Na raiz do repositório:

```bash
docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api up -d
```

Para subir também a web (opcional):

```bash
docker compose --env-file .env -f infra/docker/compose.dev.yml --profile api --profile web up -d
```

Conferindo:

```bash
curl http://localhost:8080/api/posts/get     # deve responder 200 (ou 401 sem token)
docker logs weunite-api --tail 30
```

Contas de teste do ambiente local: `caiogodas` (atleta), `anateste` (atleta) e `marcateste`
(empresa). **A senha não está no repositório** — peça ao time.

---

## 4. Rodar no emulador (mais simples, e é onde o QA automatizado roda)

```bash
cd apps/mobile
flutter emulators --launch Pixel_8_API_35     # ou abra pelo Android Studio
flutter run -d emulator-5554 --dart-define-from-file=config/dev.json
```

No emulador, `10.0.2.2` é o endereço do host — por isso o `dev.json` funciona sem configurar rede.

---

## 5. Rodar num celular Android real

### 5.1 Preparar o aparelho

1. **Configurações → Sobre o telefone** → toque 7× em **"Número da versão"** (no Xiaomi/POCO é
   **"Versão do HyperOS"** ou **"Versão do MIUI"**) até aparecer "Você agora é um desenvolvedor".
2. **Configurações → Sistema → Opções do desenvolvedor** (no Xiaomi: **Configurações adicionais →
   Opções do desenvolvedor**).
3. Ative **Depuração USB**.
4. **Xiaomi/POCO:** ative também **"Instalar via USB"** e, se quiser automação de toques,
   **"Depuração USB (Configurações de segurança)"**. As duas pedem login numa conta Mi e podem
   voltar a desligar sozinhas — veja a seção de problemas.
5. Conecte o cabo e escolha o modo **Transferência de arquivos (MTP)** — a Xiaomi exige MTP para o
   ADB funcionar.
6. Ao conectar, aceite **"Permitir depuração USB?"** marcando _Sempre permitir deste computador_.

### 5.2 Verificar que o computador enxerga o aparelho

```bash
adb devices -l
```

- `device` → pronto.
- `unauthorized` → falta aceitar o aviso na tela do celular.
- lista vazia → depuração USB desligada, cabo só de carga, ou driver ausente.

### 5.3 Apontar o app para a API

O celular **não** enxerga `localhost` da sua máquina. Descubra o IP do computador na rede e coloque
em `apps/mobile/config/lan.json`:

```json
{
  "WEUNITE_API_URL": "http://192.168.15.50:8080/api",
  "WEUNITE_WS_URL": "http://192.168.15.50:8080/ws"
}
```

Celular e computador precisam estar **na mesma rede Wi-Fi**. Teste de dentro do celular:

```bash
adb shell curl -s -o /dev/null -w "%{http_code}" http://192.168.15.50:8080/api/posts/get
```

Se não responder `200`, veja "API não responde" na seção de problemas.

### 5.4 Instalar e rodar

```bash
cd apps/mobile
flutter run -d <serial-do-aparelho> --dart-define-from-file=config/lan.json
```

O `<serial>` é o que aparece em `adb devices`. Isso compila, instala e dá acesso a _hot reload_.

**Se a instalação falhar com `INSTALL_FAILED_USER_RESTRICTED`** (acontece em Xiaomi/POCO mesmo com
"Instalar via USB" ligado), instale por baixo do bloqueio:

```bash
flutter build apk --debug --dart-define-from-file=config/lan.json
adb push build/app/outputs/flutter-apk/app-debug.apk /data/local/tmp/weunite.apk
adb shell pm install -r -t /data/local/tmp/weunite.apk
adb shell monkey -p com.example.weunite_mobile -c android.intent.category.LAUNCHER 1
```

Para ver logs e usar hot reload depois de instalar assim:

```bash
flutter attach -d <serial>
```

---

## 6. Testar sem depender da máquina de quem desenvolveu

O projeto **não** usa Expo, TestFlight nem distribuição interna configurada. O caminho que funciona
hoje é **gerar um APK e enviar para o colega**:

```bash
cd apps/mobile
flutter build apk --release --dart-define-from-file=config/<ambiente>.json
# saída: build/app/outputs/flutter-apk/app-release.apk
```

Mande o `.apk` (WhatsApp, Drive, e-mail) e o colega instala tocando no arquivo, autorizando
"Instalar apps desconhecidos" para o aplicativo que abriu o APK.

**Limitação importante e honesta:** o APK aponta para a URL que estava no JSON no momento do build.
Com `config/lan.json`, ele só funciona **na mesma rede** da máquina que está rodando a API, e apenas
enquanto ela estiver ligada. Para o colega testar de qualquer lugar é preciso a API publicada num
servidor acessível pela internet (homologação) e um `config/<ambiente>.json` apontando para ela —
**isso ainda não existe no projeto**; combine com o time antes de prometer.

Para atualizar o app, gere um APK novo e instale por cima (mesma assinatura de debug/release).

---

## 7. Permissões usadas pelo app

| Permissão     | Onde é usada                                                               |
| ------------- | -------------------------------------------------------------------------- |
| Internet      | tudo (API REST + WebSocket do chat)                                        |
| Galeria/fotos | imagem em post, imagem no chat, foto e capa do perfil (via `image_picker`) |
| Câmera        | só se o usuário escolher tirar foto no seletor do sistema                  |
| Microfone     | gravação de áudio no chat (em desenvolvimento)                             |

O Android pede cada uma na hora do uso; se alguma for negada, o app segue funcionando sem aquela
função.

---

## 8. Problemas comuns

**`adb devices` não lista o celular**
Cabo só de carga, depuração USB desligada ou modo USB em "Somente carregamento". Troque para MTP e
reconecte. No Windows, `Get-PnpDevice | findstr /i "phone"` ajuda a ver se o sistema reconhece o
aparelho.

**`unauthorized` em `adb devices`**
Falta aceitar o aviso na tela. Se ele não aparecer: `adb kill-server && adb start-server`, ou revogue
as autorizações em Opções do desenvolvedor e reconecte.

**`INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`**
Trava do MIUI/HyperOS. Ative "Instalar via USB" (exige conta Mi); se continuar, use o
`adb shell pm install` mostrado na seção 5.4 — foi o que funcionou no aparelho testado.

**`adb shell input tap/text` retorna `SecurityException: INJECT_EVENTS`**
Xiaomi bloqueia entrada simulada sem a opção "Depuração USB (Configurações de segurança)", que exige
conta Mi e costuma se desativar sozinha. Sem ela, dá para instalar, ler a tela (`uiautomator dump`),
tirar print (`screencap`) e ver logs — mas não automatizar toques. O QA automatizado roda no emulador.

**O app abre mas não carrega nada (API não responde)**

1. `docker ps` — os contêineres `weunite-api` e `weunite-postgres` estão de pé?
2. O IP em `config/lan.json` é o da máquina agora? (IP de DHCP muda.)
3. Celular e PC no mesmo Wi-Fi?
4. Firewall do Windows bloqueando a porta: num PowerShell **como administrador**
   `New-NetFirewallRule -DisplayName "WeUnite API 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private`.
5. Alternativa sem rede, pelo próprio cabo: `adb reverse tcp:8080 tcp:8080` e use
   `config/dev.json` com `localhost`.

**Alterações na web não aparecem no navegador (Docker no Windows)**
O watcher do Vite não enxerga mudanças vindas do bind mount: `docker restart weunite-web`.

**Build do Gradle falha pedindo NDK**
Instale a versão exata (28.2.13676358) pelo SDK Manager do Android Studio.

**Porta 8080 ocupada**
`netstat -ano | findstr :8080` e encerre o processo, ou mude `API_HOST_PORT` no `.env`.

---

## 9. Checklist de validação

Entre com um usuário **atleta** e confira:

- [ ] Home carrega o feed com nome e foto dos autores.
- [ ] Sino no topo mostra o número de notificações não lidas.
- [ ] Abrir notificações: buscar, filtrar, marcar uma como lida, marcar todas, tocar numa e ir para o conteúdo.
- [ ] Pesquisa da Home traz pessoas, posts e oportunidades.
- [ ] Criar post com imagem; ele aparece no feed e no seu perfil.
- [ ] Curtir e comentar um post.
- [ ] Menu de três pontos num post de outra pessoa → Denunciar.
- [ ] Oportunidades: buscar, abrir detalhe, salvar, remover dos salvos.
- [ ] Candidatar-se e cancelar a candidatura; o estado muda na hora.
- [ ] Minhas candidaturas e Oportunidades salvas listam o que você marcou.
- [ ] Perfil: abas Posts/Sobre/Salvos; editar perfil (altura em metros) e ver em "Sobre".
- [ ] Perfil de outra pessoa: Seguir / Deixar de seguir e Conversar.
- [ ] Chat: enviar texto, emoji e imagem; ver o duplo check ficar azul quando lerem.
- [ ] Chat: badge vermelho no ícone some ao abrir a conversa.
- [ ] Nova conversa pela busca do chat (abre a existente, não duplica).

Com um usuário **empresa**:

- [ ] Perfil tem a aba "Oportunidades" com as vagas publicadas.
- [ ] Abrir o detalhe de uma oportunidade.
- [ ] Iniciar conversa com um atleta pelo chat.

### Autenticação

- [ ] Criar conta de atleta e entrar depois de confirmar o e-mail.
- [ ] Senha fraca é recusada com a regra que falta escrita na tela.
- [ ] Olho mostra e esconde a senha sem apagar o que foi digitado.
- [ ] Confirmação diferente bloqueia o cadastro.
- [ ] Sem aceitar os termos o cadastro não sai.
- [ ] Termos de Uso abrem e fecham.
- [ ] Criar clube com CNPJ mascarado e senha.
- [ ] CNPJ inválido é recusado antes de enviar.
- [ ] E-mail ou usuário já cadastrado mostra "Usuário já existe".
- [ ] Esqueci a senha: código, nova senha, entrar com ela.
- [ ] Fechar e reabrir o app mantém a sessão.

---

## 10. Testar a autenticação (criar conta, confirmar e-mail, recuperar senha)

Esta parte não precisa de nenhuma configuração especial de build: **não há
login com Google e não há deep link**. Todo o fluxo acontece dentro do app, e
a confirmação de e-mail é por **código de seis dígitos**, não por link.

### 10.1 O e-mail precisa sair da API

Quem envia o código é a API, pelo SMTP configurado no `.env` da máquina que
sobe o backend (as variáveis de e-mail estão listadas no `.env.example`). Se
esse SMTP não estiver configurado, o cadastro é criado mas **nenhum e-mail
chega**, e você fica preso na tela do código.

Dois caminhos:

- **Com SMTP configurado:** use um e-mail de verdade que você consiga abrir.
- **Sem SMTP (ou em máquina de desenvolvimento):** leia o código direto no
  banco, que é o que o QA faz aqui:

```bash
docker exec weunite-postgres psql -U postgres -d weunite -t -A -c "select verification_token from tb_user where email='SEU_EMAIL'"
```

O mesmo código serve para a confirmação de e-mail e para a redefinição de
senha (a coluna é reaproveitada pelos dois fluxos).

### 10.2 Regras de senha (as mesmas do site)

A senha precisa ter, ao mesmo tempo:

- 8 a 30 caracteres;
- uma letra maiúscula;
- uma letra minúscula;
- um número;
- um símbolo, entre `!@#$%^&*()_+-=[]{};':"\|,.<>/?`.

O app mostra essa lista embaixo do campo, com uma barra de força, e vai
marcando cada item conforme você digita. Símbolo fora dessa lista (`~`, `´`)
é recusado — a API também recusaria.

Nome e nome de usuário têm no mínimo 5 caracteres. Esse detalhe pega muita
gente: "bob" não serve como usuário.

### 10.3 Roteiro — criar uma conta de atleta

1. Abra o app e toque em **atleta**, no rodapé da tela de login.
2. Preencha nome, username, e-mail.
3. Digite uma senha fraca de propósito (`abcdefgh`) e confira que a barra fica
   vermelha e os itens continuam desmarcados.
4. Toque no olho do campo de senha: o texto aparece; toque de novo: some.
5. Corrija para uma senha válida e confira que a barra fica verde.
6. Digite uma confirmação **diferente** e tente cadastrar: tem que aparecer
   "As senhas devem ser iguais" e nada é enviado.
7. Acerte a confirmação e tente cadastrar **sem** marcar os termos: tem que
   aparecer "Aceite os termos para criar sua conta.".
8. Toque em "Ler termos e condições": abre o documento; feche.
9. Marque o aceite e toque em **Cadastrar**.
10. O app vai para a tela do código e mostra o e-mail cadastrado.
11. Digite o código de seis dígitos. Ao completar o sexto dígito ele já envia.
12. Deu certo: você entra direto no feed — a confirmação já devolve a sessão.

### 10.4 Roteiro — criar um clube

Igual ao de atleta, com a aba **Clube** e mais um campo:

- **CNPJ**: digite só números; a máscara `XX.XXX.XXX/0000-XX` é aplicada
  sozinha. Um CNPJ com dígito verificador errado é recusado antes de sair do
  app ("CNPJ inválido"). Para testar, `11.222.333/0001-81` é válido.

O clube tem senha, confirmação, olho, barra de força e termos, exatamente
como o atleta.

### 10.5 Roteiro — esqueci a senha

1. Na tela de login, toque em **Esqueceu sua senha?**.
2. Informe o e-mail da conta e toque em **Confirmar**.
3. O botão de reenviar fica bloqueado por 60 segundos, contando na tela.
4. Na tela seguinte, digite um código errado primeiro: tem que aparecer
   "Token inválido".
5. Digite o código certo, defina a nova senha e a confirmação (as mesmas
   regras de força valem aqui).
6. Você volta para o login. Entre com a **senha nova**; a antiga não funciona
   mais.

Um e-mail que não existe responde "Usuário não encontrado" — é o
comportamento atual da API, igual no site.

### 10.6 Sessão

Feche o app pela lista de recentes e abra de novo: você continua logado. O
token vale 15 dias; quando expira, o app volta para o login com
"Sua sessão expirou. Entre novamente.". Sair pelo ícone no topo da Home
limpa a sessão na hora.

### 10.7 O que **não** dá para testar

- **Login com Google.** O botão existe só no site, sem nenhuma ação por trás:
  não há provider, client id nem endpoint na API (`/api/auth` tem sete rotas,
  nenhuma social). Por isso o app não tem esse botão.
- **Reenviar o código de confirmação de e-mail.** Não existe endpoint de
  reenvio. O botão "Reenviar código" do site só reinicia um contador, sem
  mandar nada. O reenvio do **fluxo de recuperação de senha** é de verdade e
  funciona.
