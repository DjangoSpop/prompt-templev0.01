export const IPC = {
  Clipboard: {
    Write: "clipboard:write",
  },
  Window: {
    Minimize: "window:minimize",
    Maximize: "window:maximize",
    Close: "window:close",
  },
  Overlay: {
    Open: "overlay:open",
    Hide: "overlay:hide",
    Copy: "overlay:copy",
    OpenInMain: "overlay:open-in-main",
  },
  Shortcuts: {
    Get: "shortcuts:get",
    Set: "shortcuts:set",
  },
  AutoLaunch: {
    Get: "autolaunch:get",
    Set: "autolaunch:set",
  },
  App: {
    GetVersion: "app:get-version",
    GetPlatform: "app:get-platform",
  },
} as const;

export type ShortcutKey = "quickCapture" | "mainWindow";

export interface ShortcutMap {
  quickCapture: string;
  mainWindow: string;
}

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  quickCapture: "CommandOrControl+Shift+Space",
  mainWindow: "CommandOrControl+Shift+P",
};

export interface OverlayOpenPayload {
  sourceText: string;
  timestamp: number;
}
