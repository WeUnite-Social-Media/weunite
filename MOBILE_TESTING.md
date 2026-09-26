# Testar o app mobile do WeUnite num celular real

Guia para rodar o aplicativo **fora da máquina de quem desenvolveu**. Escrito a partir de uma
instalação real num **POCO X5 Pro 5G (HyperOS/MIUI)**, incluindo as travas que aparecem no caminho.

> **Stack real do projeto** (confira antes de seguir qualquer tutorial genérico): o app é
> **Flutter** (Dart), em `apps/mobile`. **Não** é React Native e **não** usa Expo. O backend é
> **Spring Boot** (`apps/api`) com **PostgreSQL**, e o app web é React + Vite (`apps/web`).
> O monorepo usa **pnpm + turbo**, mas o app mobile é compilado pelo **Flutter SDK**, não pelo pnpm.

---

## 1. Pré-requisitos

| Ferramenta | Versão usada | Para quê |
|---|---|---|
| Git | qualquer recente | clonar o repositório |
| Flutter SDK | **3.47.4** (Dart 3.13.3) | compilar e rodar o app |
| Android Studio | Narwhal ou mais novo | SDK do Android, drivers e emulador |
| Android SDK Platform | **API 36** (e API 35 para o emulador usado nos testes) | compilar |
| Android NDK | **28.2.13676358** | exigido pelo Gradle deste projeto |
| JDK | **17** (o que vem com o Android Studio serve) | Gradle |
| Docker Desktop | qualquer recente | subir API + banco (só quem for rodar o backend local) |
| pnpm + Node 22 | opcional | só se for mexer na web/API pelo monorepo |

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

| Arquivo | Para quê | Conteúdo |
|---|---|---|
| `config/dev.json` | emulador Android | `http://10.0.2.2:8080` (o host visto de dentro do emulador) |
| `config/lan.json` | celular real na mesma rede | `http://<IP-DA-MÁQUINA>:8080` |

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
6. Ao conectar, aceite **"Permitir depuração USB?"** marcando *Sempre permitir deste computador*.

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

O `<serial>` é o que aparece em `adb devices`. Isso compila, instala e dá acesso a *hot reload*.

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

| Permissão | Onde é usada |
|---|---|
| Internet | tudo (API REST + WebSocket do chat) |
| Galeria/fotos | imagem em post, imagem no chat, foto e capa do perfil (via `image_picker`) |
| Câmera | só se o usuário escolher tirar foto no seletor do sistema |
| Microfone | gravação de áudio no chat (em desenvolvimento) |

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
