import { app, Menu, shell, type MenuItemConstructorOptions } from "electron";
import { showMainWindow } from "./windows/main-window";
import { showOverlay } from "./windows/overlay-window";

const isMac = process.platform === "darwin";
const isDev = !app.isPackaged || process.env.DESKTOP_DEV === "1";

export function buildApplicationMenu(): void {
  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  template.push({
    label: "File",
    submenu: [
      {
        label: "Open Prompt Temple",
        accelerator: "CommandOrControl+N",
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
      isMac ? { role: "close" } : { role: "quit" },
    ],
  });

  template.push({
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" as const },
            { role: "delete" as const },
            { role: "selectAll" as const },
          ]
        : [{ role: "delete" as const }, { type: "separator" as const }, { role: "selectAll" as const }]),
    ],
  });

  template.push({
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      ...(isDev ? [{ role: "toggleDevTools" as const }] : []),
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  });

  template.push({
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac ? [{ type: "separator" as const }, { role: "front" as const }] : []),
    ],
  });

  template.push({
    role: "help",
    submenu: [
      {
        label: "Documentation",
        click: () => {
          void shell.openExternal("https://prompt-temple.com/docs");
        },
      },
      {
        label: "Report an Issue",
        click: () => {
          void shell.openExternal("https://github.com/prompt-temple/desktop/issues");
        },
      },
    ],
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
