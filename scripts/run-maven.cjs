const { spawnSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const { platform } = require("node:os");
const { cwd, exit } = require("node:process");
const path = require("node:path");

const isWindows = platform() === "win32";
const wrapper = isWindows ? "mvnw.cmd" : "./mvnw";
const command = isWindows ? "cmd.exe" : "sh";
const args = isWindows
  ? ["/c", "mvnw.cmd", ...process.argv.slice(2)]
  : [wrapper, ...process.argv.slice(2)];

function mergeOptionValue(currentValue, nextOptions) {
  const currentOptions = (currentValue || "")
    .split(/\s+/)
    .map((option) => option.trim())
    .filter(Boolean);

  const mergedOptions = [...currentOptions];

  for (const option of nextOptions) {
    if (!mergedOptions.includes(option)) {
      mergedOptions.push(option);
    }
  }

  return mergedOptions.join(" ");
}

function stripBom(content) {
  return content.replace(/^\uFEFF/, "");
}

function parseEnvFile(filePath) {
  const content = stripBom(readFileSync(filePath, "utf8"));
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

const envPath = path.join(cwd(), ".env");
const dotenvValues = existsSync(envPath) ? parseEnvFile(envPath) : {};

const javaToolOptions = mergeOptionValue(process.env.JAVA_TOOL_OPTIONS, [
  "-Dfile.encoding=UTF-8",
  "-Dsun.stdout.encoding=UTF-8",
  "-Dsun.stderr.encoding=UTF-8",
]);

const result = spawnSync(command, args, {
  cwd: cwd(),
  stdio: "inherit",
  shell: false,
  env: {
    ...dotenvValues,
    ...process.env,
    JAVA_TOOL_OPTIONS: javaToolOptions,
  },
});

if (result.error) {
  console.error(
    `Failed to run Maven wrapper in ${path.resolve(cwd())}:`,
    result.error,
  );
  exit(1);
}

exit(result.status ?? 0);
