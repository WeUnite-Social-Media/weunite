const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.resolve(__dirname, "..");
const apiEnvPath = path.join(repoRoot, "apps", "api", ".env");
const webEnvPath = path.join(repoRoot, "apps", "web", ".env");

const requiredApiVars = [
  "JWT_PUBLIC_KEY",
  "JWT_PRIVATE_KEY",
  "DB_USERNAME",
  "DB_PASSWORD",
  "MAIL_USERNAME",
  "MAIL_PASSWORD",
  "MAIL_PORT",
  "CLOUDINARY_URL",
];

const requiredWebVars = ["VITE_API_URL"];

function stripBom(content) {
  return content.replace(/^\uFEFF/, "");
}

function parseEnvFile(filePath) {
  const content = stripBom(fs.readFileSync(filePath, "utf8"));
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = rawLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = rawLine.slice(0, separatorIndex).trim();
    let value = rawLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRequiredVars(env, requiredVars, scopeLabel, errors) {
  for (const key of requiredVars) {
    if (!isPresent(env[key])) {
      errors.push(`${scopeLabel}: defina \`${key}\`.`);
    }
  }
}

function decodeBase64Utf8(value, keyName) {
  try {
    const normalized = value.trim();
    if (!normalized) {
      throw new Error("valor vazio");
    }

    const decoded = Buffer.from(normalized, "base64");
    if (decoded.length === 0) {
      throw new Error("base64 vazio");
    }

    return decoded.toString("utf8");
  } catch (error) {
    throw new Error(`\`${keyName}\` não é um base64 válido.`);
  }
}

function validateJwtPem(env, keyName, type, errors) {
  if (!isPresent(env[keyName])) {
    return;
  }

  try {
    const pem = decodeBase64Utf8(env[keyName], keyName);
    const beginMarker =
      type === "public"
        ? "-----BEGIN PUBLIC KEY-----"
        : "-----BEGIN PRIVATE KEY-----";
    const endMarker =
      type === "public"
        ? "-----END PUBLIC KEY-----"
        : "-----END PRIVATE KEY-----";

    if (!pem.includes(beginMarker) || !pem.includes(endMarker)) {
      throw new Error(
        `\`${keyName}\` precisa ser o base64 de um PEM RSA completo com cabeçalho e rodapé.`,
      );
    }

    const keyObject =
      type === "public"
        ? crypto.createPublicKey(pem)
        : crypto.createPrivateKey({ key: pem, format: "pem" });

    if (keyObject.asymmetricKeyType !== "rsa") {
      throw new Error(`\`${keyName}\` precisa ser uma chave RSA.`);
    }
  } catch (error) {
    errors.push(error.message);
  }
}

function parsePort(rawValue, fallback, label, errors) {
  const value = isPresent(rawValue) ? rawValue.trim() : String(fallback);
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    errors.push(`${label}: use uma porta válida. Valor atual: \`${value}\`.`);
    return null;
  }

  return parsed;
}

function checkTcpConnection(host, port, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });

    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error(`timeout ao conectar em ${host}:${port}`));
    });

    socket.once("error", (error) => {
      socket.destroy();
      reject(error);
    });

    socket.connect(port, host);
  });
}

async function main() {
  const errors = [];
  const info = [];

  const apiEnvExists = fs.existsSync(apiEnvPath);
  const webEnvExists = fs.existsSync(webEnvPath);

  if (!apiEnvExists) {
    errors.push(
      "API: `apps/api/.env` não existe. Crie o arquivo a partir de `apps/api/.env.example`.",
    );
  }

  if (!webEnvExists) {
    errors.push(
      "Web: `apps/web/.env` não existe. Crie o arquivo a partir de `apps/web/.env.example`.",
    );
  }

  const apiEnv = apiEnvExists ? parseEnvFile(apiEnvPath) : {};
  const webEnv = webEnvExists ? parseEnvFile(webEnvPath) : {};

  if (apiEnvExists) {
    validateRequiredVars(apiEnv, requiredApiVars, "API", errors);
    validateJwtPem(apiEnv, "JWT_PUBLIC_KEY", "public", errors);
    validateJwtPem(apiEnv, "JWT_PRIVATE_KEY", "private", errors);
  }

  if (webEnvExists) {
    validateRequiredVars(webEnv, requiredWebVars, "Web", errors);
  }

  const dbHost = isPresent(apiEnv.DB_HOST)
    ? apiEnv.DB_HOST.trim()
    : "localhost";
  const dbPort = parsePort(apiEnv.DB_PORT, 5432, "API: `DB_PORT`", errors);
  const dbName = isPresent(apiEnv.DB_NAME) ? apiEnv.DB_NAME.trim() : "weunite";
  const mailPort = parsePort(apiEnv.MAIL_PORT, 587, "API: `MAIL_PORT`", errors);

  if (dbPort !== null) {
    try {
      await checkTcpConnection(dbHost, dbPort);
      info.push(`PostgreSQL acessível em ${dbHost}:${dbPort}.`);
    } catch (error) {
      errors.push(
        `PostgreSQL indisponível em \`${dbHost}:${dbPort}\` para o banco \`${dbName}\`: ${error.message}.`,
      );
    }
  }

  if (mailPort !== null) {
    info.push(`MAIL_PORT configurada como ${mailPort}.`);
  }

  if (isPresent(webEnv.VITE_API_URL)) {
    info.push(`Web apontando para ${webEnv.VITE_API_URL.trim()}.`);
  }

  if (errors.length > 0) {
    console.error("Preflight local falhou.\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }

    console.error("\nAções recomendadas:");
    console.error(
      "- Revise os arquivos `.env` a partir dos exemplos em `apps/api` e `apps/web`.",
    );
    console.error(
      `- Garanta que o PostgreSQL local esteja ativo em ${dbHost}:${dbPort || 5432}.`,
    );
    console.error(`- Crie o banco \`${dbName}\` antes de rodar \`pnpm dev\`.`);
    process.exit(1);
  }

  console.log("Preflight local concluído com sucesso.\n");
  for (const line of info) {
    console.log(`- ${line}`);
  }

  console.log("\nPróximos comandos:");
  console.log("- pnpm dev");
  console.log("- pnpm dev:web");
  console.log("- pnpm dev:api");
}

main().catch((error) => {
  console.error("Falha inesperada no preflight local:", error);
  process.exit(1);
});
