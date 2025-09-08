import express from "express";
import { packsHtml } from "./packsRoute";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const app = express();
const PORT = process.env.PORT || 5056;

// --- Health ---
app.get("/lab/api/browser/health", (_req, res) => {
  res.status(200).json({ status: "ok", browser: "ready", version: "v0" });
});

// --- Acceptance Pack JSON ---
app.get("/lab/api/packs/latest", (_req, res) => {
  try {
    const p = path.join(__dirname, "../../../storage/acceptance/latest.json");
    const raw = fs.readFileSync(p, "utf8");
    res.type("application/json").send(raw);
  } catch (e: any) {
    res.status(404).json({error:"latest.json not found"});
  }
});

// --- Packs History ---
app.get("/lab/api/packs/history", (_req, res) => {
  try {
    const historyDir = path.join(__dirname, "../../../storage/acceptance/history");
    const indexPath = path.join(historyDir, "index.json");
    
    if (!fs.existsSync(indexPath)) {
      return res.json({ files: [], items: [] });
    }
    
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const items = [];
    
    for (const filename of index.slice(0, 10)) {
      try {
        const filePath = path.join(historyDir, filename);
        const pack = JSON.parse(fs.readFileSync(filePath, "utf8"));
        items.push(pack);
      } catch {}
    }
    
    res.json({ files: index, items });
  } catch (e: any) {
    res.json({ files: [], items: [] });
  }
});

// --- Last Green Pack ---
app.get("/lab/api/packs/last-green", (_req, res) => {
  try {
    // Check latest first
    const latestPath = path.join(__dirname, "../../../storage/acceptance/latest.json");
    if (fs.existsSync(latestPath)) {
      const latest = JSON.parse(fs.readFileSync(latestPath, "utf8"));
      if (latest.pass === true) {
        return res.json({ ok: true, sha: latest.ci?.sha || null, pack: latest });
      }
    }
    
    // Check history
    const historyDir = path.join(__dirname, "../../../storage/acceptance/history");
    const indexPath = path.join(historyDir, "index.json");
    
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      
      for (const filename of index) {
        try {
          const filePath = path.join(historyDir, filename);
          const pack = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (pack.pass === true) {
            return res.json({ ok: true, sha: pack.ci?.sha || null, pack });
          }
        } catch {}
      }
    }
    
    res.json({ ok: false });
  } catch (e: any) {
    res.json({ ok: false });
  }
});

// --- Gate Status Endpoint ---
app.get("/lab/gate/status", (_req, res) => {
  try {
    // Read the latest acceptance pack
    const packPath = path.join(__dirname, "../../../storage/acceptance/latest.json");
    const raw = fs.readFileSync(packPath, "utf8");
    const pack = JSON.parse(raw);
    
    // Get the latest git SHA
    let sha = "unknown";
    try {
      sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    } catch {}
    
    // Build status response
    const status = {
      ok: pack.pass === true,
      sha: sha,
      when: pack.generatedAt || new Date().toISOString(),
      prUrl: pack.prUrl || null
    };
    
    // Append to history file for sparkline
    const historyPath = path.join(__dirname, "../../../storage/acceptance/history.jsonl");
    const historyEntry = JSON.stringify({
      ...status,
      timestamp: new Date().toISOString()
    }) + "\n";
    
    try {
      fs.appendFileSync(historyPath, historyEntry);
    } catch {
      // Create file if it doesn't exist
      fs.writeFileSync(historyPath, historyEntry);
    }
    
    res.json(status);
  } catch (e: any) {
    res.json({
      ok: false,
      sha: "unknown",
      when: new Date().toISOString(),
      error: "No acceptance data available"
    });
  }
});

// --- Gate History for Sparkline ---
app.get("/lab/gate/history", (_req, res) => {
  try {
    const historyPath = path.join(__dirname, "../../../storage/acceptance/history.jsonl");
    const lines = fs.readFileSync(historyPath, "utf8").trim().split("\n");
    
    // Get last 7 days of data
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const history = lines
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .filter(entry => new Date(entry.timestamp).getTime() > sevenDaysAgo)
      .map(entry => ({
        ok: entry.ok,
        timestamp: entry.timestamp
      }));
    
    res.json(history);
  } catch {
    res.json([]);
  }
});

// --- Simple HTML layout helper ---
function page(title: string, body: string) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Donny Doctor — ${title}</title>
<style>
  :root{--panel:#fff;--text:#0f172a;--muted:#6b7280;--bd:#e5e7eb;--ok:#16a34a;--warn:#f59e0b;--bad:#ef4444;--shadow:0 8px 24px rgba(15,23,42,.06)}
  body{margin:0;background:#f7f8fa;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--text)}
  .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
  header{display:flex;gap:12px;align-items:center;margin-bottom:16px}
  .logo{width:40px;height:40px;border-radius:10px;background:#111827;color:#fff;display:grid;place-items:center;box-shadow:var(--shadow)}
  nav{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 16px}
  nav a{padding:8px 12px;border-radius:999px;border:1px solid var(--bd);background:var(--panel);text-decoration:none;color:var(--text);font-size:14px;box-shadow:var(--shadow)}
  .card{background:var(--panel);border:1px solid var(--bd);border-radius:16px;box-shadow:var(--shadow);padding:16px}
  h2{margin:0 0 10px 0;font-size:16px}
  .pill{display:inline-block;margin-right:8px;margin-top:6px;padding:6px 10px;border-radius:999px;border:1px solid var(--bd);background:#f3f4f6;font-size:12px}
  .ok{color:var(--ok);background:#ecfdf5;border-color:#bbf7d0}
  .warn{color:var(--warn);background:#fffbeb;border-color:#fde68a}
  .bad{color:var(--bad);background:#fef2f2;border-color:#fecaca}
  .grid{display:grid;gap:12px}
  @media(min-width:880px){.grid{grid-template-columns:1fr 1fr}}
  .row{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--bd);border-radius:12px;background:#fafafa;padding:10px}
  .muted{color:var(--muted);font-size:12px}
  .gate-status{display:flex;align-items:center;gap:12px;background:var(--panel);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:16px;box-shadow:var(--shadow)}
  .gate-pill{padding:8px 14px;border-radius:999px;font-weight:bold;font-size:13px}
  .gate-pass{background:#10b981;color:white}
  .gate-fail{background:#ef4444;color:white}
  .sparkline{height:30px;flex:1;max-width:200px;display:flex;align-items:flex-end;gap:2px}
  .spark{flex:1;min-height:2px;background:#e5e7eb;border-radius:2px;transition:all 0.2s}
  .spark.pass{background:#10b981}
  .spark.fail{background:#ef4444}
  .gate-info{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .gate-link{color:#3b82f6;text-decoration:none;font-size:13px}
  .gate-link:hover{text-decoration:underline}
</style>
<script>
async function loadGateStatus() {
  try {
    const [statusRes, historyRes] = await Promise.all([
      fetch('/lab/gate/status'),
      fetch('/lab/gate/history')
    ]);
    const status = await statusRes.json();
    const history = await historyRes.json();
    
    // Update gate pill
    const pill = document.getElementById('gate-pill');
    if (pill) {
      pill.className = status.ok ? 'gate-pill gate-pass' : 'gate-pill gate-fail';
      pill.textContent = status.ok ? 'PASS' : 'FAIL';
    }
    
    // Update SHA and time
    const info = document.getElementById('gate-info');
    if (info) {
      const timeAgo = getTimeAgo(status.when);
      info.innerHTML = \`<span class="muted">SHA:</span> \${status.sha} • <span class="muted">\${timeAgo}</span>\`;
      
      if (!status.ok && status.prUrl) {
        info.innerHTML += \` • <a href="\${status.prUrl}" class="gate-link" target="_blank">Open failing PR →</a>\`;
      }
    }
    
    // Update sparkline
    const sparkline = document.getElementById('sparkline');
    if (sparkline && history.length > 0) {
      // Group by hour for better visualization
      const hourlyData = {};
      const now = Date.now();
      
      for (let i = 0; i < 168; i++) { // 7 days * 24 hours
        const hour = new Date(now - (i * 60 * 60 * 1000));
        const key = hour.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        hourlyData[key] = null;
      }
      
      history.forEach(h => {
        const key = h.timestamp.slice(0, 13);
        if (hourlyData.hasOwnProperty(key)) {
          // Take the last status for each hour
          hourlyData[key] = h.ok;
        }
      });
      
      const sparks = Object.entries(hourlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-50) // Show last 50 hours
        .map(([_, ok]) => {
          if (ok === null) return '<div class="spark"></div>';
          const cls = ok ? 'spark pass' : 'spark fail';
          const height = ok ? '100%' : '60%';
          return \`<div class="\${cls}" style="height:\${height}"></div>\`;
        })
        .join('');
      
      sparkline.innerHTML = sparks;
    }
  } catch (e) {
    console.error('Failed to load gate status:', e);
  }
}

function getTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

// Load gate status on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', loadGateStatus);
  // Refresh every 30 seconds
  setInterval(loadGateStatus, 30000);
}
</script>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">D</div>
      <div>
        <h1 style="margin:0;font-size:18px">Donny Doctor</h1>
        <div class="muted">Control Tower • ${title}</div>
      </div>
    </header>
    
    <!-- Lab Gate Status -->
    <div class="gate-status">
      <div style="font-weight:bold;font-size:14px">Lab Gate</div>
      <div id="gate-pill" class="gate-pill gate-pass">PASS</div>
      <div id="sparkline" class="sparkline"></div>
      <div id="gate-info" class="gate-info muted">Loading...</div>
    </div>

    <nav>
      <a href="/lab/doctor/kundli">Kundli</a>
      <a href="/lab/doctor/blueprint"><strong>Blueprint</strong></a>
      <a href="/lab/doctor/snapshots">Snapshots</a>
      <a href="/lab/doctor/packs">Packs</a>
      <a href="/lab/doctor/logs">Logs</a>
    </nav>

    ${body}
    <div style="height:20px"></div>
  </div>
</body></html>`;
}

// --- Tabs (stub content for now) ---
app.get("/lab/doctor/kundli", (_req,res)=>{
  const body = `<div class="card">
    <h2>Kundli (stub)</h2>
    <div class="muted">Live system profile will render here in Phase 3–4.</div>
    <div class="pill ok">UI:5000</div><div class="pill ok">API:5055</div><div class="pill ok">Doctor:5056</div>
  </div>`;
  res.type("html").send(page("Kundli", body));
});

app.get("/lab/doctor/blueprint", (_req,res)=>{
  const body = `
  <div class="grid">
    <div class="card">
      <h2>Milestone: Doctor Core</h2>
      <div class="row"><span>Kundli v1 renders & validates</span><span class="pill ok">PASS • stub</span></div>
      <div class="row"><span>Snapshots: create/restore</span><span class="pill warn">IN PROGRESS • stub</span></div>
      <div class="row"><span>Acceptance Pack gate visible</span><span class="pill warn">IN PROGRESS • stub</span></div>
    </div>
    <div class="card">
      <h2>Milestone: Dashboard Pages</h2>
      <div class="row"><span>White dashboard routes</span><span class="pill ok">PASS • stub</span></div>
      <div class="row"><span>Global chat popup</span><span class="pill warn">IN PROGRESS • stub</span></div>
      <div class="row"><span>Buttons wired</span><span class="pill ok">PASS • stub</span></div>
    </div>
    <div class="card">
      <h2>Milestone: Watchdog</h2>
      <div class="row"><span>Health signals</span><span class="pill warn">PENDING • stub</span></div>
      <div class="row"><span>Kuma/n8n hooks</span><span class="pill warn">PENDING • stub</span></div>
      <div class="row"><span>Incident freeze</span><span class="pill warn">PENDING • stub</span></div>
    </div>
  </div>`;
  res.type("html").send(page("Blueprint", body));
});

app.get("/lab/doctor/snapshots", (_req,res)=>{
  const body = `<div class="card"><h2>Snapshots (stub)</h2>
    <div class="muted">Pre-promote snapshot & 10-day retention will appear here in Phase 5.</div></div>`;
  res.type("html").send(page("Snapshots", body));
});

app.get("/lab/doctor/packs", async (_req,res)=>{
  try {
    const r = await fetch("http://localhost:5056/lab/api/packs/latest");
    const data = await r.json();
    const body = await packsHtml(data);
    res.type("html").send(page("Packs", body));
  } catch(e) {
    const body = `<div class="card"><h2>Acceptance Packs</h2><div class=\"muted\">No pack found yet.</div></div>`;
    res.type("html").send(page("Packs", body));
  }
});

app.get("/lab/doctor/logs", (_req,res)=>{
  const body = `<div class="card"><h2>Logs (stub)</h2>
    <div class="muted">Tail PM2/app logs here later.</div></div>`;
  res.type("html").send(page("Logs", body));
});

// Default: send to Blueprint
app.get("/lab/doctor", (_req,res)=>res.redirect("/lab/doctor/blueprint"));

app.listen(PORT, () => {
  console.log(`Doctor running on :${PORT}`);
});
