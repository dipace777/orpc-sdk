# Agent Runtime

A minimal Turborepo monorepo for a TypeScript product with:

- `apps/api`: Node.js + Hono + Better Auth + Better Auth API keys + oRPC
- `apps/web`: React + Vite + TanStack Router dashboard
- `packages/contracts`: contract-first oRPC API surface
- `packages/sdk`: publishable npm client that sends `x-api-key`

## Quick Start

```sh
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Open the web app at `http://localhost:5173`. Create an account, generate an API key in the dashboard, then use it with the SDK tester.

## Publish the SDK

The SDK package is in `packages/sdk`. Rename `@agent-runtime/sdk` to a package name you own, then:

```sh
pnpm --filter @agent-runtime/sdk build
pnpm --filter @agent-runtime/sdk publish --access public
```

Consumer usage:

```ts
import { createAgentRuntimeClient } from "@agent-runtime/sdk";

const client = createAgentRuntimeClient({
  apiKey: "sk_...",
  baseUrl: "https://api.example.com",
});

const identity = await client.system.whoami();
```
