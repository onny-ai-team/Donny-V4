module.exports = {
  apps: [
    { name: "donny-ui",     cwd: "apps/ui",     script: "pnpm", args: "dev",   env: { PORT: "5000" } },
    { name: "donny-api",    cwd: "apps/api",    script: "pnpm", args: "start", env: { PORT: "5055" } },
    { name: "donny-doctor", cwd: "apps/doctor", script: "pnpm", args: "start", env: { PORT: "5056" } }
  ]
}
