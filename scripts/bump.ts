import { execSync } from "node:child_process";
import fs from "fs";

const bump = process.argv[2] || "patch";

execSync(`npm version ${bump}`);

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

// Update Tauri config
execSync(`npx tauri config set package.version ${version}`);

// Update Cargo.toml
const cargo = fs.readFileSync("src-tauri/Cargo.toml", "utf8");
fs.writeFileSync(
  "src-tauri/Cargo.toml",
  cargo.replace(/version\s*=\s*".*"/, `version = "${version}"`)
);

console.log("✅ Version bumped to", version);
