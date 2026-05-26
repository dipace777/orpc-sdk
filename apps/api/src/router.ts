import { randomUUID } from "node:crypto";
import { contract, type ApiIdentity, type Project } from "@agent-runtime/contracts";
import { implement, ORPCError } from "@orpc/server";
import { auth } from "./auth.js";

interface RpcContext {
  headers: Headers;
}

interface AuthenticatedContext {
  apiKey: ApiIdentity;
}

const projectsByApiKey = new Map<string, Project[]>();
const base = implement(contract).$context<RpcContext>();

const requireApiKey = base.middleware(async ({ context, next }) => {
  const key = context.headers.get("x-api-key");

  if (!key) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Missing x-api-key header.",
    });
  }

  const result = await auth.api.verifyApiKey({
    body: { key },
  });

  if (!result.valid || !result.key) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Invalid API key.",
    });
  }

  const apiKey = result.key as { id: string; name?: string | null; userId?: string | null };

  return next({
    context: {
      apiKey: {
        apiKeyId: apiKey.id,
        apiKeyName: apiKey.name ?? null,
        userId: apiKey.userId ?? null,
      },
    } satisfies AuthenticatedContext,
  });
});

const authed = base.use(requireApiKey);

export const router = base.router({
  system: {
    health: base.system.health.handler(() => ({
      ok: true,
      service: "agent-runtime-api",
      time: new Date().toISOString(),
    })),
    whoami: authed.system.whoami.handler(({ context }) => context.apiKey),
  },
  projects: {
    list: authed.projects.list.handler(({ context, input }) => {
      return (projectsByApiKey.get(context.apiKey.apiKeyId) ?? []).slice(0, input.limit);
    }),
    create: authed.projects.create.handler(({ context, input }) => {
      const project: Project = {
        id: randomUUID(),
        name: input.name,
        createdAt: new Date().toISOString(),
      };
      const projects = projectsByApiKey.get(context.apiKey.apiKeyId) ?? [];
      projectsByApiKey.set(context.apiKey.apiKeyId, [project, ...projects]);
      return project;
    }),
  },
});
