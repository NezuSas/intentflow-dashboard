// Construye la demo pública en docs/, que GitHub Pages sirve desde la rama main bajo /intentflow-dashboard.
// Es una exportación estática de Next.js con los datos de ejemplo (NEXT_PUBLIC_DEMO=1); el resultado va a out/
// y de ahí se copia a docs/ con los archivos que Pages necesita.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "out");
const docs = resolve(root, "docs");

const build = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NEXT_PUBLIC_DEMO: "1", NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/intentflow-dashboard" },
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(resolve(out, "index.html"))) {
  console.error("la exportación no produjo out/index.html");
  process.exit(1);
}

rmSync(docs, { recursive: true, force: true });
cpSync(out, docs, { recursive: true });
writeFileSync(resolve(docs, ".nojekyll"), "");
console.log("demo construida en docs/");
