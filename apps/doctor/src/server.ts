import express from "express";
const app = express();
const PORT = process.env.PORT || 5056;

app.get("/lab/api/browser/health", (_req, res) => {
  res.status(200).json({ status: "ok", browser: "ready", version: "v0" });
});

app.listen(PORT, () => {
  console.log(`Doctor running on :${PORT}`);
});
