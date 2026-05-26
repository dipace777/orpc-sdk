# Agent Runtime SDK

Typed client for the Agent Runtime API.

```ts
import { createAgentRuntimeClient } from "@agent-runtime/sdk";

const client = createAgentRuntimeClient({
  apiKey: process.env.AGENT_RUNTIME_API_KEY!,
  baseUrl: "https://api.example.com",
});

const identity = await client.system.whoami();
```

The SDK also exports the oRPC contract at `@agent-runtime/sdk/contract`.
