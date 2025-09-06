import express from "express";
const app = express();
const PORT = process.env.PORT || 5055;

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", app: "donny-api", version: "v0" });
});

app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});
