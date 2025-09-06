import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function tryCurl(name, url) {
  const start = Date.now();
  try {
    const out = execSync(`curl -fsS ${url}`, { stdio: 'pipe', encoding: 'utf8', timeout: 7000 });
    const dur = Date.now() - start;
    return { name, url, ok: true, ms: dur, body: safeJson(out) };
  } catch (e) {
    const dur = Date.now() - start;
    return { name, url, ok: false, ms: dur, error: (e.stderr || e.message || '').toString().slice(0, 500) };
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}

const hostEnv = process.env.TARGET_HOST;
let ip;
if (hostEnv && hostEnv.trim()) { ip = hostEnv.trim(); }
else {
  const ipCmd = `hostname -I | awk '{print }'`;
  ip = execSync(ipCmd, { encoding: "utf8" }).trim();
}

const checks = [
  { name: "ui",     url: `http://${ip}:5000/health` },
  { name: "api",    url: `http://${ip}:5055/api/health` },
  { name: "doctor", url: `http://${ip}:5056/lab/api/browser/health` },
];

const results = checks.map(c => tryCurl(c.name, c.url));
const allGreen = results.every(r => r.ok);

const pack = {
  kind: "acceptance.smoke",
  generatedAt: new Date().toISOString(),
  host: ip,
  results,
  pass: allGreen
};

const outPath = `${process.cwd()}/storage/acceptance/latest.json`;
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(pack, null, 2));
console.log(`Wrote ${outPath}`);
console.log(allGreen ? "PASS" : "FAIL");
process.exit(allGreen ? 0 : 1);
