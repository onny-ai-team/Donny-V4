import express from "express";
import { packsHtml } from "./packsRoute";
import fs from "fs";
import path from "path";

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
  .grid{display:grid;gap:12px}
  @media(min-width:880px){.grid{grid-template-columns:1fr 1fr}}
  .row{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--bd);border-radius:12px;background:#fafafa;padding:10px}
  .muted{color:var(--muted);font-size:12px}
</style>
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
    const body = packsHtml(data);
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
