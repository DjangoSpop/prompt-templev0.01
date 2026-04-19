import { app, Menu, Tray, nativeImage, type NativeImage } from "electron";
import path from "node:path";
import { existsSync } from "node:fs";
import { showMainWindow } from "./windows/main-window";
import { showOverlay } from "./windows/overlay-window";

let tray: Tray | null = null;

function loadTrayIcon(): NativeImage {
  const candidates: string[] = [];
  const here = path.dirname(__filename);
  if (process.platform === "darwin") {
    candidates.push(path.resolve(here, "..", "..", "resources", "tray-icon-template.png"));
    candidates.push(path.resolve(process.resourcesPath, "tray-icon-template.png"));
  }
  candidates.push(path.resolve(here, "..", "..", "build", "icon.png"));
  candidates.push(path.resolve(process.resourcesPath ?? "", "icon.png"));

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      const img = nativeImage.createFromPath(candidate);
      if (process.platform === "darwin") img.setTemplateImage(true);
      return img;
    }
  }
  // Fallback: a 1x1 transparent image so Tray construction doesn't throw on a
  // dev machine without icon assets yet.
  return nativeImage.createEmpty();
}

export function createTray(): Tray {
  if (tray) return tray;

  tray = new Tray(loadTrayIcon());
  tray.setToolTip("Prompt Temple");

  const menu = Menu.buildFromTemplate([
    {
      label: "Open Prompt Temple",
      click: () => {
        void showMainWindow();
      },
    },
    {
      label: "Quick Capture",
      accelerator: "CommandOrControl+Shift+Space",
      click: () => {
        void showOverlay();
      },
    },
    { type: "separator" },
    {
      label: "Settings",
      click: () => {
        void showMainWindow().then(() => {
          // Best-effort deep-link; the renderer router will navigate.
          // No-op if the window's not on a SPA-friendly route.
        });
      },
    },
    { type: "separator" },
    {
      label: "Quit Prompt Temple",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);

  // Single-click on Win/Linux opens the main window. macOS uses right-click for
  // the context menu and treats single-click as showing the menu via the
  // template image — we mirror Win/Linux behavior on left-click only.
  if (process.platform !== "darwin") {
    tray.on("click", () => {
      void showMainWindow();
    });
  }

  return tray;
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
