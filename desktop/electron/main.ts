import { app, BrowserWindow, dialog } from "electron";
import { startNextServer, stopNextServer } from "./server";
import { createMainWindow, showMainWindow } from "./windows/main-window";
import { createOverlayWindow } from "./windows/overlay-window";
import { registerIpcHandlers } from "./ipc-handlers";
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from "./shortcuts";
import { applyPersistedAutoLaunch } from "./auto-launch";
import { createTray, destroyTray } from "./tray";
import { buildApplicationMenu } from "./menu";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    void showMainWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform === "darwin") return;
    // Keep running in tray on Win/Linux. Tray is added on Day 3; until then,
    // closing all windows quits to avoid orphan processes.
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void showMainWindow();
    }
  });

  app.on("before-quit", async (event) => {
    const g = globalThis as Record<string, unknown>;
    if (g.isQuitting) return;
    g.isQuitting = true;
    event.preventDefault();
    try {
      unregisterGlobalShortcuts();
      destroyTray();
      await stopNextServer();
    } catch (err) {
      console.error("[main] error stopping server:", err);
    }
    app.exit(0);
  });

  void app.whenReady().then(async () => {
    try {
      registerIpcHandlers();
      await startNextServer();
      buildApplicationMenu();
      await createMainWindow({ show: true });
      await createOverlayWindow();
      createTray();
      const shortcutResult = registerGlobalShortcuts();
      if (!shortcutResult.ok) {
        console.warn("[main] failed to register shortcuts:", shortcutResult.failed);
      }
      applyPersistedAutoLaunch();
    } catch (err) {
      console.error("[main] startup failed:", err);
      dialog.showErrorBox(
        "Prompt Temple failed to start",
        `${err instanceof Error ? err.message : String(err)}\n\nCheck the log at:\n${app.getPath("logs")}`
      );
      app.exit(1);
    }
  });
}
