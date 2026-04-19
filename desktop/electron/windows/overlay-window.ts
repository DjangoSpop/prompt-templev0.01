import { BrowserWindow, screen, clipboard } from "electron";
import path from "node:path";
import { getServerHandle } from "../server";
import { IPC, type OverlayOpenPayload } from "../shared/ipc-channels";

let overlayWindow: BrowserWindow | null = null;

const OVERLAY_WIDTH = 580;
const OVERLAY_HEIGHT = 360;

function preloadPath(): string {
  return path.join(__dirname, "..", "preload-overlay.js");
}

export async function createOverlayWindow(): Promise<BrowserWindow> {
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;

  const server = getServerHandle();
  if (!server) throw new Error("Next server not started");

  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: true,
    vibrancy: process.platform === "darwin" ? "under-window" : undefined,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  overlayWindow.setAlwaysOnTop(true, "floating");

  await overlayWindow.loadURL(`${server.origin}/desktop/overlay`);

  overlayWindow.on("blur", () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    if (overlayWindow.webContents.isDevToolsOpened()) return;
    overlayWindow.hide();
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow && !overlayWindow.isDestroyed() ? overlayWindow : null;
}

function readClipboardSelection(): string {
  try {
    const text = clipboard.readText();
    if (!text) return "";
    // Cap at 8000 chars to avoid pre-filling with a giant pasted code block.
    if (text.length > 8000) return "";
    return text;
  } catch {
    return "";
  }
}

export async function showOverlay(): Promise<void> {
  let win = getOverlayWindow();
  if (!win) {
    win = await createOverlayWindow();
  }
  // Position centered on the display under the cursor, at 1/3 height.
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const [w, h] = win.getSize();
  win.setPosition(
    Math.round(display.workArea.x + (display.workArea.width - w) / 2),
    Math.round(display.workArea.y + (display.workArea.height - h) / 3)
  );

  const payload: OverlayOpenPayload = {
    sourceText: readClipboardSelection(),
    timestamp: Date.now(),
  };
  win.webContents.send(IPC.Overlay.Open, payload);

  win.show();
  win.focus();
}

export function hideOverlay(): void {
  const win = getOverlayWindow();
  if (win && win.isVisible()) win.hide();
}
