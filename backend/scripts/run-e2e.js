const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function runCommand(command, args, options) {
  const result = spawnSync(command, args, {
    ...options,
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(result.error.message);
  }
  return result.status == null ? 1 : result.status;
}

const backendRoot = path.resolve(__dirname, "..");
const envTestPath = path.join(backendRoot, ".env.test");
const envTest = parseDotEnv(envTestPath);
const env = { ...process.env, ...envTest, NODE_ENV: "test" };

const binDir = path.join(backendRoot, "node_modules", ".bin");
const prismaCommand = path.join(
  binDir,
  process.platform === "win32" ? "prisma.cmd" : "prisma"
);
const jestCommand = path.join(
  binDir,
  process.platform === "win32" ? "jest.cmd" : "jest"
);

const migrateExitCode = runCommand(
  prismaCommand,
  ["migrate", "deploy", "--schema", "prisma/schema.prisma"],
  { cwd: backendRoot, stdio: "inherit", env }
);

if (migrateExitCode !== 0) {
  process.exit(migrateExitCode);
}

const extraArgs = process.argv.slice(2);
const jestExitCode = runCommand(
  jestCommand,
  ["--config", "./test/jest-e2e.json", "--runInBand", ...extraArgs],
  { cwd: backendRoot, stdio: "inherit", env }
);

process.exit(jestExitCode);
