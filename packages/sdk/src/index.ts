import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { contract } from "./contract.js";

export type AgentRuntimeClient = ContractRouterClient<typeof contract>;

export interface CreateAgentRuntimeClientOptions {
  apiKey: string;
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}

export function createAgentRuntimeClient(options: CreateAgentRuntimeClientOptions): AgentRuntimeClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  const link = new RPCLink({
    url: `${baseUrl}/rpc`,
    fetch: options.fetch,
    headers: async () => {
      const extraHeaders =
        typeof options.headers === "function" ? await options.headers() : (options.headers ?? {});

      return {
        ...extraHeaders,
        "x-api-key": options.apiKey,
      };
    },
  });

  return createORPCClient(link) as AgentRuntimeClient;
}

export { contract };
export type { ApiContract, ApiIdentity, Project } from "./contract.js";
