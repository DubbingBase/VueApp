// scripts/bump-version.mjs
import fs from "fs";
import { execSync } from "child_process";

const bump = process.argv[2] || "patch";

console.log(`🔧 Bumping ${bump} version...`);

// 1. Bump package.json version
execSync(`npm version ${bump} --no-git-tag-version`, { stdio: "inherit" });
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

// 2. Update Tauri config
const tauriConfPath = "src-tauri/tauri.conf.json";
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
tauriConf.package = tauriConf.package || {};
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

console.log(`✅ Bumped to version ${version}`);

// 4. Commit and tag
execSync(`git add .`, { stdio: "inherit" });
execSync(`git commit -m "chore: bump version to v${version}"`, { stdio: "inherit" });
execSync(`git tag v${version}`, { stdio: "inherit" });

console.log(`🏷️  Created tag v${version}`);

// 5. Push to remote
execSync(`git push && git push origin v${version}`, { stdio: "inherit" });

console.log(`🚀 Published tag v${version} to remote`);
