export async function packsHtml(data: any) {
  const badge = (ok:boolean)=> ok
    ? '<span style="padding:6px 10px;border-radius:999px;background:#ecfdf5;border:1px solid #bbf7d0;color:#16a34a;font-size:12px">PASS</span>'
    : '<span style="padding:6px 10px;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;color:#ef4444;font-size:12px">FAIL</span>';

  const rows = (data.results || []).map((r:any)=>{
    const slowBadge = r.slow 
      ? '<span style="padding:4px 8px;border-radius:6px;background:#fffbeb;border:1px solid #fde68a;color:#f59e0b;font-size:11px;margin-left:8px">⚠️ slow</span>'
      : '';
    const threshold = typeof r.thresholdMs === 'number' 
      ? `<span class="muted" style="margin-left:8px;font-size:11px">≤ ${r.thresholdMs}ms</span>`
      : '';
    
    return `
    <div class="row">
      <span>${r.name.toUpperCase()} &nbsp;<span class="muted">(${r.url})</span></span>
      <span>
        ${badge(!!r.ok)} 
        <span class="muted" style="margin-left:6px">${r.ms ?? 0}ms</span>
        ${threshold}
        ${slowBadge}
      </span>
    </div>
  `}).join("");

  // Fetch last green and history
  let lastGreenHtml = '';
  let historyHtml = '';
  
  try {
    // Get last green
    const lastGreenRes = await fetch('http://localhost:5056/lab/api/packs/last-green');
    const lastGreen = await lastGreenRes.json();
    
    if (lastGreen.ok && lastGreen.sha) {
      const shortSha = lastGreen.sha.substring(0, 7);
      lastGreenHtml = `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
          <span style="padding:6px 10px;border-radius:999px;background:#f3f4f6;border:1px solid #e5e7eb;font-size:12px">
            Last Green: <strong>${shortSha}</strong>
          </span>
          <button onclick="rollbackToLastGreen('${lastGreen.sha}')" style="padding:6px 12px;border-radius:8px;background:#3b82f6;color:white;border:none;font-size:12px;cursor:pointer">
            Rollback to Last Green
          </button>
        </div>
      `;
    } else {
      lastGreenHtml = `
        <div style="margin-bottom:12px">
          <span style="padding:6px 10px;border-radius:999px;background:#f3f4f6;border:1px solid #e5e7eb;font-size:12px">
            Last Green: <strong>Not found</strong>
          </span>
        </div>
      `;
    }
    
    // Get history
    const historyRes = await fetch('http://localhost:5056/lab/api/packs/history');
    const history = await historyRes.json();
    
    if (history.items && history.items.length > 0) {
      // Create sparkline
      const points = history.items.slice(0, 10).map((pack: any) => {
        const avg = pack.results ? 
          pack.results.reduce((sum: number, r: any) => sum + (r.ms || 0), 0) / pack.results.length : 0;
        return avg;
      }).reverse();
      
      const max = Math.max(...points);
      const sparkline = points.map((p: number, i: number) => {
        const height = max > 0 ? (p / max) * 30 : 0;
        const x = i * 12;
        return `<rect x="${x}" y="${30 - height}" width="10" height="${height}" fill="#3b82f6" opacity="0.7"/>`;
      }).join('');
      
      // Create history list
      const historyList = history.items.slice(0, 10).map((pack: any, i: number) => {
        const timestamp = new Date(pack.generatedAt).toLocaleString();
        const totalMs = pack.results ? 
          pack.results.reduce((sum: number, r: any) => sum + (r.ms || 0), 0) : 0;
        const filename = history.files[i];
        
        return `
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px">
            <span>${timestamp}</span>
            <span style="display:flex;gap:8px;align-items:center">
              ${badge(pack.pass)}
              <span class="muted">${totalMs}ms</span>
              <a href="/lab/api/packs/history/${filename}" style="color:#3b82f6">json</a>
            </span>
          </div>
        `;
      }).join('');
      
      historyHtml = `
        <div style="margin-top:16px">
          <h3 style="font-size:14px;margin-bottom:8px">History (Last 10)</h3>
          <svg width="120" height="35" style="margin-bottom:12px">
            ${sparkline}
          </svg>
          <div style="max-height:200px;overflow-y:auto">
            ${historyList}
          </div>
        </div>
      `;
    }
  } catch (e) {
    console.error('Error fetching history/last-green:', e);
  }

  return `
  <div class="card">
    <h2>Acceptance Pack — Smoke</h2>
    <div class="muted" style="margin-bottom:8px">
      Host: ${data.host || "-"} • Generated: ${data.generatedAt || "-"}
    </div>
    ${lastGreenHtml}
    <div class="row">
      <strong>Overall</strong>
      ${badge(!!data.pass)}
    </div>
    <div style="height:10px"></div>
    ${rows || '<div class="muted">No checks.</div>'}
    <div style="height:12px"></div>
    <a href="/lab/api/packs/latest" style="font-size:12px;text-decoration:none;border:1px solid #e5e7eb;padding:6px 10px;border-radius:10px;background:#fff">View JSON</a>
    ${historyHtml}
  </div>
  
  <script>
    async function rollbackToLastGreen(sha) {
      try {
        const res = await fetch('http://99.76.234.25:5055/api/snapshots/rollback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sha })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('Rollback requested for ' + sha.substring(0, 7));
        } else {
          showToast('Rollback request failed', 'error');
        }
      } catch (e) {
        showToast('Rollback request failed', 'error');
      }
    }
    
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: \${type === 'error' ? '#ef4444' : '#16a34a'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
      \`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  </script>
  
  <style>
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  </style>
  `;
}