// scripts/bump-version.mjs
import fs from "fs";
import { execSync } from "node:child_process";

const bump = process.argv[2] || "patch";

// 1. Bump package.json version
execSync(`npm version ${bump} --no-git-tag-version`);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

// 2. Update tauri.conf.json
const tauriConfPath = "src-tauri/tauri.conf.json";
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));

if (!tauriConf.package) tauriConf.package = {};
tauriConf.package.version = version;

fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));

// 3. Update Cargo.toml
const cargoPath = "src-tauri/Cargo.toml";
const cargoToml = fs.readFileSync(cargoPath, "utf8");
const updatedToml = cargoToml.replace(
  /version\s*=\s*".*"/,
  `version = "${version}"`
);
fs.writeFileSync(cargoPath, updatedToml);

console.log(`✅ Bumped ${bump} → version ${version}`);
