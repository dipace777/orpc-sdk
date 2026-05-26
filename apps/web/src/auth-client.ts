import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/react";

export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [apiKeyClient()],
});
