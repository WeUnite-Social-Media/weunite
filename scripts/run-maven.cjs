const { spawnSync } = require("node:child_process");
const { platform } = require("node:os");
const { cwd, exit } = require("node:process");
const path = require("node:path");

const isWindows = platform() === "win32";
const wrapper = isWindows ? "mvnw.cmd" : "./mvnw";
const command = isWindows ? "cmd.exe" : "sh";
const args = isWindows
  ? ["/c", "mvnw.cmd", ...process.argv.slice(2)]
  : [wrapper, ...process.argv.slice(2)];

const result = spawnSync(command, args, {
  cwd: cwd(),
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(
    `Failed to run Maven wrapper in ${path.resolve(cwd())}:`,
    result.error,
  );
  exit(1);
}

exit(result.status ?? 0);
