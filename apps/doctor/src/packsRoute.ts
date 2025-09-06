export function packsHtml(data: any) {
  const badge = (ok:boolean)=> ok
    ? '<span style="padding:6px 10px;border-radius:999px;background:#ecfdf5;border:1px solid #bbf7d0;color:#16a34a;font-size:12px">PASS</span>'
    : '<span style="padding:6px 10px;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;color:#ef4444;font-size:12px">FAIL</span>';

  const rows = (data.results || []).map((r:any)=>`
    <div class="row">
      <span>${r.name.toUpperCase()} &nbsp;<span class="muted">(${r.url})</span></span>
      <span>${badge(!!r.ok)} <span class="muted" style="margin-left:6px">${r.ms ?? 0} ms</span></span>
    </div>
  `).join("");

  return `
  <div class="card">
    <h2>Acceptance Pack — Smoke</h2>
    <div class="muted" style="margin-bottom:8px">
      Host: ${data.host || "-"} • Generated: ${data.generatedAt || "-"}
    </div>
    <div class="row">
      <strong>Overall</strong>
      ${badge(!!data.pass)}
    </div>
    <div style="height:10px"></div>
    ${rows || '<div class="muted">No checks.</div>'}
    <div style="height:12px"></div>
    <a href="/lab/api/packs/latest" style="font-size:12px;text-decoration:none;border:1px solid #e5e7eb;padding:6px 10px;border-radius:10px;background:#fff">View JSON</a>
  </div>`;
}
