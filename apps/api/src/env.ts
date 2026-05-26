import "dotenv/config";

export const env = {
  apiPort: Number(process.env.PORT ?? 8787),
  authSecret:
    process.env.BETTER_AUTH_SECRET ?? "development-secret-change-me-please-32-chars",
  authUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:8787",
  databasePath: process.env.DATABASE_PATH ?? "./data/auth.sqlite",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
};
