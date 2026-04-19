import { app, BrowserWindow, clipboard, ipcMain } from "electron";
import { IPC, DEFAULT_SHORTCUTS, type ShortcutKey, type ShortcutMap } from "./shared/ipc-channels";
import { getStore } from "./store";
import { hideOverlay } from "./windows/overlay-window";
import { showMainWindow } from "./windows/main-window";
import { rebindShortcut } from "./shortcuts";
import { setAutoLaunch } from "./auto-launch";

let registered = false;

export function registerIpcHandlers(): void {
  if (registered) return;
  registered = true;

  ipcMain.handle(IPC.App.GetVersion, () => app.getVersion());
  ipcMain.handle(IPC.App.GetPlatform, () => process.platform);

  ipcMain.handle(IPC.Clipboard.Write, (_event, text: unknown) => {
    if (typeof text !== "string") return false;
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle(IPC.Window.Minimize, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.handle(IPC.Window.Maximize, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.handle(IPC.Window.Close, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  // Overlay
  ipcMain.handle(IPC.Overlay.Hide, () => {
    hideOverlay();
  });
  ipcMain.handle(IPC.Overlay.Copy, (_event, text: unknown) => {
    if (typeof text === "string") clipboard.writeText(text);
    hideOverlay();
    return true;
  });
  ipcMain.handle(IPC.Overlay.OpenInMain, async () => {
    hideOverlay();
    await showMainWindow();
  });

  // Shortcuts
  ipcMain.handle(IPC.Shortcuts.Get, (): ShortcutMap => {
    const store = getStore();
    return store.get("shortcuts") ?? DEFAULT_SHORTCUTS;
  });
  ipcMain.handle(
    IPC.Shortcuts.Set,
    (_event, payload: { key: ShortcutKey; accelerator: string }) => {
      const result = rebindShortcut(payload.key, payload.accelerator);
      return result.ok;
    }
  );

  // Auto-launch
  ipcMain.handle(IPC.AutoLaunch.Get, () => getStore().get("autoLaunch"));
  ipcMain.handle(IPC.AutoLaunch.Set, (_event, enabled: boolean) => {
    setAutoLaunch(Boolean(enabled));
    return true;
  });
}
