const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.join(workspaceRoot, "node_modules")];

config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
];

config.resolver.blockList = [
  /[/\\]node_modules[/\\]\.ignored_[^/\\]+$/,
  /[/\\]packages[/\\]eslint-config[/\\].*/,
  /[/\\]packages[/\\]typescript-config[/\\].*/,
];

module.exports = config;
