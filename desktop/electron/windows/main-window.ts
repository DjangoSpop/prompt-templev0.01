import { BrowserWindow, shell } from "electron";
import path from "node:path";
import { getServerHandle } from "../server";
import { getStore } from "../store";

let mainWindow: BrowserWindow | null = null;

function preloadPath(): string {
  return path.join(__dirname, "..", "preload-main.js");
}

export async function createMainWindow(opts: { show?: boolean } = {}): Promise<BrowserWindow> {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (opts.show !== false) {
      mainWindow.show();
      mainWindow.focus();
    }
    return mainWindow;
  }

  const server = getServerHandle();
  if (!server) throw new Error("Next server not started");

  const store = getStore();
  const bounds = store.get("windowBounds");

  mainWindow = new BrowserWindow({
    width: bounds?.width ?? 1280,
    height: bounds?.height ?? 820,
    x: bounds?.x,
    y: bounds?.y,
    minWidth: 960,
    minHeight: 600,
    show: false,
    backgroundColor: "#0B1220",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
    },
  });

  await mainWindow.loadURL(`${server.origin}/dashboard`);

  if (opts.show !== false) {
    mainWindow.show();
    mainWindow.focus();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(server.origin)) {
      event.preventDefault();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        shell.openExternal(url);
      }
    }
  });

  const persistBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const b = mainWindow.getBounds();
    store.set("windowBounds", { width: b.width, height: b.height, x: b.x, y: b.y });
  };
  mainWindow.on("resize", persistBounds);
  mainWindow.on("move", persistBounds);

  mainWindow.on("close", (event) => {
    const isQuitting = (globalThis as Record<string, unknown>).isQuitting === true;
    if (!isQuitting && process.platform !== "darwin") {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
}

export async function showMainWindow(): Promise<void> {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  } else {
    await createMainWindow({ show: true });
  }
}
