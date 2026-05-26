import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { Activity, KeyRound, LogOut, Plus, Rocket, ShieldCheck, Terminal } from "lucide-react";
import { createAgentRuntimeClient } from "@agent-runtime/sdk";
import { apiUrl, authClient } from "./auth-client";
import "./styles.css";

const rootRoute = createRootRoute({
  component: () => (
    <main className="shell">
      <nav className="topbar">
        <Link to="/" className="brand">
          <Rocket size={20} />
          Agent Runtime
        </Link>
        <div className="nav-actions">
          <Link to="/" activeProps={{ className: "active" }}>
            Dashboard
          </Link>
          <Link to="/sdk" activeProps={{ className: "active" }}>
            SDK
          </Link>
        </div>
      </nav>
      <Outlet />
    </main>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const sdkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sdk",
  component: SdkPlayground,
});

const routeTree = rootRoute.addChildren([indexRoute, sdkRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Dashboard() {
  const session = authClient.useSession();
  const [email, setEmail] = useState("founder@example.com");
  const [password, setPassword] = useState("password1234");
  const [keyName, setKeyName] = useState("Production SDK");
  const [latestKey, setLatestKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function signIn() {
    setMessage(null);
    const { error } = await authClient.signIn.email({ email, password });
    setMessage(error?.message ?? "Signed in.");
  }

  async function signUp() {
    setMessage(null);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0] ?? "Developer",
    });
    setMessage(error?.message ?? "Account created and signed in.");
  }

  async function createApiKey() {
    setMessage(null);
    const { data, error } = await authClient.apiKey.create({
      name: keyName,
      prefix: "sk_",
      metadata: { source: "dashboard" },
    });

    if (error) {
      setMessage(error.message ?? "Could not create API key.");
      return;
    }

    setLatestKey(data?.key ?? null);
    setMessage("API key created. Copy it now; Better Auth will not show the secret again.");
  }

  async function signOut() {
    await authClient.signOut();
    setLatestKey(null);
    setMessage("Signed out.");
  }

  return (
    <section className="dashboard">
      <div className="hero">
        <div>
          <p className="eyebrow">Node + Hono + Better Auth + oRPC</p>
          <h1>Ship a typed API with keys your users can manage.</h1>
          <p>
            This dashboard creates Better Auth users and API keys, while the SDK package calls the
            oRPC API with the generated key.
          </p>
        </div>
        <div className="status-panel">
          <span className="status-dot" />
          API at {apiUrl}
        </div>
      </div>

      <div className="grid">
        <section className="panel auth-panel">
          <div className="panel-header">
            <ShieldCheck size={20} />
            <h2>Account</h2>
          </div>

          {session.data?.user ? (
            <div className="signed-in">
              <div>
                <span className="label">Signed in as</span>
                <strong>{session.data.user.email}</strong>
              </div>
              <button className="icon-button" onClick={signOut} title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={(event) => event.preventDefault()}>
              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <div className="button-row">
                <button type="button" onClick={signIn}>
                  Sign in
                </button>
                <button type="button" className="secondary" onClick={signUp}>
                  Sign up
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <KeyRound size={20} />
            <h2>API Key</h2>
          </div>
          <div className="form">
            <label>
              Key name
              <input value={keyName} onChange={(event) => setKeyName(event.target.value)} />
            </label>
            <button disabled={!session.data?.user} onClick={createApiKey}>
              <Plus size={17} />
              Create key
            </button>
          </div>
          {latestKey ? <code className="secret">{latestKey}</code> : null}
        </section>
      </div>

      {message ? <p className="toast">{message}</p> : null}
    </section>
  );
}

function SdkPlayground() {
  const [apiKey, setApiKey] = useState("");
  const [projectName, setProjectName] = useState("Launch Console");
  const [output, setOutput] = useState("Awaiting a key.");

  const client = useMemo(
    () =>
      createAgentRuntimeClient({
        apiKey,
        baseUrl: apiUrl,
      }),
    [apiKey],
  );

  async function runWhoami() {
    setOutput("Calling client.system.whoami()...");
    try {
      const result = await client.system.whoami();
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "SDK call failed.");
    }
  }

  async function createProject() {
    setOutput("Calling client.projects.create()...");
    try {
      const created = await client.projects.create({ name: projectName });
      const projects = await client.projects.list({ limit: 10 });
      setOutput(JSON.stringify({ created, projects }, null, 2));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "SDK call failed.");
    }
  }

  return (
    <section className="sdk-page">
      <div className="page-heading">
        <p className="eyebrow">Publishable package</p>
        <h1>Test the npm SDK surface.</h1>
      </div>

      <section className="panel sdk-panel">
        <div className="panel-header">
          <Terminal size={20} />
          <h2>SDK client</h2>
        </div>
        <div className="form">
          <label>
            API key
            <input
              placeholder="sk_..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <label>
            Project name
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button onClick={runWhoami}>
              <Activity size={17} />
              Whoami
            </button>
            <button className="secondary" onClick={createProject}>
              <Plus size={17} />
              Create project
            </button>
          </div>
        </div>
        <pre>{output}</pre>
      </section>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
