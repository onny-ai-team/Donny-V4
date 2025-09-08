import express from "express";
const app = express();
const PORT = process.env.PORT || 5055;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", app: "donny-api", version: "v0" });
});

// Rollback API stub
app.post("/api/snapshots/rollback", (req, res) => {
  const { sha } = req.body;
  
  if (!sha) {
    return res.status(400).json({ ok: false, error: "sha is required" });
  }
  
  // Log the rollback request (stub implementation)
  console.log(`[ROLLBACK STUB] Rollback requested for SHA: ${sha}`);
  
  // Return success (stub response)
  res.json({ ok: true, requested: sha });
});

app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});
