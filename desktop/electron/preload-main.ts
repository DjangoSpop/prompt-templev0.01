import { contextBridge, ipcRenderer } from "electron";
import { IPC, type ShortcutKey, type ShortcutMap } from "./shared/ipc-channels";

const api = {
  platform: process.platform,
  electronVersion: process.versions.electron,
  getVersion: (): Promise<string> => ipcRenderer.invoke(IPC.App.GetVersion),

  writeClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC.Clipboard.Write, text),

  minimize: (): Promise<void> => ipcRenderer.invoke(IPC.Window.Minimize),
  maximize: (): Promise<void> => ipcRenderer.invoke(IPC.Window.Maximize),
  close: (): Promise<void> => ipcRenderer.invoke(IPC.Window.Close),

  getShortcuts: (): Promise<ShortcutMap> => ipcRenderer.invoke(IPC.Shortcuts.Get),
  setShortcut: (key: ShortcutKey, accelerator: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC.Shortcuts.Set, { key, accelerator }),

  getAutoLaunch: (): Promise<boolean> => ipcRenderer.invoke(IPC.AutoLaunch.Get),
  setAutoLaunch: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke(IPC.AutoLaunch.Set, enabled),
};

contextBridge.exposeInMainWorld("promptTemple", api);

export type PromptTempleAPI = typeof api;
