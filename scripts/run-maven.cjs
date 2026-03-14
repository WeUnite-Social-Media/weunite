const { spawnSync } = require("node:child_process");
const { platform } = require("node:os");
const { cwd, exit } = require("node:process");
const path = require("node:path");

const wrapper = platform() === "win32" ? "mvnw.cmd" : "./mvnw";
const command = platform() === "win32" ? "cmd.exe" : wrapper;
const args =
  platform() === "win32"
    ? ["/c", "mvnw.cmd", ...process.argv.slice(2)]
    : process.argv.slice(2);

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
