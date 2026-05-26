import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { apiKey } from "@better-auth/api-key";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { env } from "./env.js";

mkdirSync(dirname(env.databasePath), { recursive: true });

export const auth = betterAuth({
  appName: "Agent Runtime",
  baseURL: env.authUrl,
  database: new Database(env.databasePath),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    apiKey({
      apiKeyHeaders: ["x-api-key"],
      enableMetadata: true,
      enableSessionForAPIKeys: true,
    }),
  ],
  secret: env.authSecret,
  trustedOrigins: [env.webOrigin],
});
