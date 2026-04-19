import { app } from "electron";
import { fork, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync, mkdirSync, createWriteStream, type WriteStream } from "node:fs";
import path from "node:path";
import { getStore, getOrCreateNextAuthSecret } from "./store";

interface ServerHandle {
  port: number;
  origin: string;
  kill: () => Promise<void>;
}

let handle: ServerHandle | null = null;
let logStream: WriteStream | null = null;

function isDev(): boolean {
  return !app.isPackaged || process.env.DESKTOP_DEV === "1";
}

function resolveStandaloneEntry(): string {
  if (app.isPackaged) {
    // electron-builder unpacks resources/standalone/** outside asar.
    // process.resourcesPath points to the resources/ directory.
    return path.join(process.resourcesPath, "standalone", "server.js");
  }
  // Dev: run the standalone build copied into desktop/resources/standalone
  const here = path.dirname(__filename);
  const candidate = path.resolve(here, "..", "..", "resources", "standalone", "server.js");
  if (existsSync(candidate)) return candidate;
  // Fallback: the raw .next/standalone in the repo root.
  const repoRoot = path.resolve(here, "..", "..", "..");
  return path.join(repoRoot, ".next", "standalone", "server.js");
}

function readDesktopEnvFile(): Record<string, string> {
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, ".env.desktop")]
    : [
        path.resolve(path.dirname(__filename), "..", "..", "resources", ".env.desktop"),
      ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const out: Record<string, string> = {};
      const text = readFileSync(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (key) out[key] = value;
      }
      return out;
    } catch (err) {
      console.error("[server] failed to read .env.desktop:", err);
    }
  }
  return {};
}

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      if (typeof addr === "object" && addr) {
        const port = addr.port;
        srv.close(() => resolve(port));
      } else {
        srv.close();
        reject(new Error("failed to allocate port"));
      }
    });
  });
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.unref();
    srv.once("error", () => resolve(false));
    srv.listen(port, "127.0.0.1", () => {
      srv.close(() => resolve(true));
    });
  });
}

async function pollReady(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const probePaths = ["/api/health", "/api/v1/health"];
  let lastErr: unknown;
  while (Date.now() < deadline) {
    for (const probePath of probePaths) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}${probePath}`, {
          method: "GET",
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok || res.status === 404) {
          // 404 means the server is up but the route doesn't exist — still ready.
          return;
        }
      } catch (err) {
        lastErr = err;
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Next standalone server failed to become ready in ${timeoutMs}ms: ${lastErr}`);
}

function openLogStream(): WriteStream {
  if (logStream) return logStream;
  const dir = app.getPath("logs");
  mkdirSync(dir, { recursive: true });
  logStream = createWriteStream(path.join(dir, "next-server.log"), { flags: "a" });
  return logStream;
}

export async function startNextServer(): Promise<ServerHandle> {
  if (handle) return handle;

  const store = getStore();
  let port = store.get("port") ?? 0;
  if (!port || !(await isPortAvailable(port))) {
    port = await getFreePort();
    store.set("port", port);
  }

  const entry = resolveStandaloneEntry();
  if (!existsSync(entry)) {
    throw new Error(
      `Next standalone server not found at: ${entry}. Run \`npm run build\` from the desktop/ folder first.`
    );
  }

  const log = openLogStream();
  const envFromFile = readDesktopEnvFile();
  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    ...envFromFile,
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NEXTAUTH_URL: `http://127.0.0.1:${port}`,
    NEXTAUTH_SECRET: envFromFile.NEXTAUTH_SECRET || getOrCreateNextAuthSecret(),
  };

  log.write(`\n[${new Date().toISOString()}] starting Next standalone on port ${port}\n`);

  const child: ChildProcess = fork(entry, [], {
    cwd: path.dirname(entry),
    env: childEnv,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
    execArgv: [],
  });

  child.stdout?.on("data", (chunk) => log.write(chunk));
  child.stderr?.on("data", (chunk) => log.write(chunk));

  child.on("exit", (code, signal) => {
    log.write(`[${new Date().toISOString()}] Next server exited code=${code} signal=${signal}\n`);
    if (handle && handle.port === port) handle = null;
  });

  await pollReady(port, 15000);

  const kill = async () => {
    if (child.killed || child.exitCode !== null) return;
    return new Promise<void>((resolve) => {
      const onExit = () => resolve();
      child.once("exit", onExit);
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed && child.exitCode === null) child.kill("SIGKILL");
        resolve();
      }, 3000);
    });
  };

  handle = { port, origin: `http://127.0.0.1:${port}`, kill };
  return handle;
}

export function getServerHandle(): ServerHandle | null {
  return handle;
}

export async function stopNextServer(): Promise<void> {
  const h = handle;
  if (!h) return;
  await h.kill();
  handle = null;
  if (logStream) {
    logStream.end();
    logStream = null;
  }
}

export { isDev };
