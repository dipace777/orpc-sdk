import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth.js";
import { env } from "./env.js";
import { router } from "./router.js";

const app = new Hono();
const rpcHandler = new RPCHandler(router);

app.use(logger());
app.use(
  "*",
  cors({
    origin: env.webOrigin,
    allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    maxAge: 600,
  }),
);

app.get("/", (c) =>
  c.json({
    ok: true,
    service: "agent-runtime-api",
    auth: "/api/auth/*",
    rpc: "/rpc",
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context: {
      headers: c.req.raw.headers,
    },
    prefix: "/rpc",
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

serve(
  {
    fetch: app.fetch,
    port: env.apiPort,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);
