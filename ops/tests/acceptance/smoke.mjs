import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/** ---- Helpers ---- **/
function tryCurl(name, url) {
  const start = Date.now();
  try {
    // -f: fail on HTTP errors, -sS: silent but show errors
    const out = execSync(`curl -fsS --max-time 7 ${url}`, {
      stdio: "pipe",
      encoding: "utf8",
      timeout: 8000,
    });
    const ms = Date.now() - start;
    return { name, url, ok: true, ms, body: safeJson(out) };
  } catch (e) {
    const ms = Date.now() - start;
    const err =
      (e.stderr || e.stdout || e.message || "").toString().slice(0, 800);
    return { name, url, ok: false, ms, error: err };
  }
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return { raw: s };
  }
}

function pickHost() {
  const envHost = (process.env.TARGET_HOST || "").trim();
  if (envHost) return envHost;
  // Fallback to first local IP
  try {
    const cmd = `hostname -I | awk '{print $1}'`;
    const ip = execSync(cmd, { encoding: "utf8" }).trim();
    if (ip) return ip;
  } catch (_) {}
  return "127.0.0.1";
}

/** ---- Config ---- **/
const HOST = pickHost();

// Soft latency thresholds (warn-only)
const THRESHOLDS_MS = {
  ui: 500, // UI should respond under 500ms
  api: 300, // API under 300ms
  doctor: 400, // Doctor under 400ms
};

// Targets
const checks = [
  { name: "ui", url: `http://${HOST}:5000/health` },
  { name: "api", url: `http://${HOST}:5055/api/health` },
  { name: "doctor", url: `http://${HOST}:5056/lab/api/browser/health` },
];

/** ---- Run ---- **/
const raw = checks.map((c) => tryCurl(c.name, c.url));

// Decorate with threshold info + warnings (does NOT fail build)
const warnings = [];
const results = raw.map((r) => {
  const threshold = THRESHOLDS_MS[r.name] ?? null;
  const slow =
    r.ok && typeof threshold === "number" ? r.ms > threshold : false;
  if (slow) {
    warnings.push(
      `⚠️ ${r.name.toUpperCase()} is slow: ${r.ms}ms (>${threshold}ms).`
    );
  }
  return {
    ...r,
    thresholdMs: threshold,
    slow,
  };
});

// Health = only functional success (latency warnings don't fail)
const pass = results.every((r) => r.ok);

/** ---- Pack & Output ---- **/
const pack = {
  kind: "acceptance.smoke",
  generatedAt: new Date().toISOString(),
  host: HOST,
  thresholdsMs: THRESHOLDS_MS,
  results, // [{ name, url, ok, ms, body?/error?, thresholdMs, slow }]
  warnings, // ["⚠️ UI is slow: ...", ...]
  pass,
};

const outPath = `${process.cwd()}/storage/acceptance/latest.json`;
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(pack, null, 2));

// Console summary
console.log(`Wrote ${outPath}`);
for (const r of results) {
  const tag = r.ok ? "✅" : "❌";
  const t = typeof r.ms === "number" ? `${r.ms}ms` : "-";
  const slowFlag = r.slow ? " ⚠️ slow" : "";
  console.log(`${tag} ${r.name.padEnd(6)} ${t}${slowFlag} → ${r.url}`);
}
if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`- ${w}`);
}

console.log(pass ? "PASS" : "FAIL");
process.exit(pass ? 0 : 1);
