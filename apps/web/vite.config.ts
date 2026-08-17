import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = path.resolve(__dirname, "../..");

function parseEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((env, rawLine) => {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        return env;
      }

      const separatorIndex = rawLine.indexOf("=");

      if (separatorIndex === -1) {
        return env;
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
      return env;
    }, {});
}

const localEnv = {
  ...parseEnvFile(path.join(repoRoot, ".env")),
  ...parseEnvFile(path.join(__dirname, ".env")),
};

for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/actuator": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
