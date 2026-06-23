const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, ".env");
const exampleEnvPath = path.join(repoRoot, ".env.example");

function readEnvTemplate() {
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, "utf8");
  }

  if (fs.existsSync(exampleEnvPath)) {
    return fs.readFileSync(exampleEnvPath, "utf8");
  }

  return "";
}

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  const separator = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  return `${content}${separator}${line}\n`;
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

const publicKeyBase64 = Buffer.from(publicKey, "utf8").toString("base64");
const privateKeyBase64 = Buffer.from(privateKey, "utf8").toString("base64");

let envContent = readEnvTemplate();
envContent = upsertEnvValue(envContent, "JWT_PUBLIC_KEY", publicKeyBase64);
envContent = upsertEnvValue(envContent, "JWT_PRIVATE_KEY", privateKeyBase64);

fs.writeFileSync(envPath, envContent);

console.log("Generated RSA JWT keys in .env.");
console.log("Restart the API container or local API process to load them.");
