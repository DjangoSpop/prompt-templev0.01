import { globalShortcut } from "electron";
import { showOverlay } from "./windows/overlay-window";
import { showMainWindow } from "./windows/main-window";
import { getStore } from "./store";
import { DEFAULT_SHORTCUTS, type ShortcutKey, type ShortcutMap } from "./shared/ipc-channels";

let registered: ShortcutMap | null = null;

function readShortcuts(): ShortcutMap {
  return getStore().get("shortcuts") ?? DEFAULT_SHORTCUTS;
}

export function registerGlobalShortcuts(): { ok: boolean; failed: ShortcutKey[] } {
  unregisterGlobalShortcuts();
  const shortcuts = readShortcuts();
  const failed: ShortcutKey[] = [];

  const tryRegister = (key: ShortcutKey, accelerator: string, handler: () => void) => {
    try {
      const ok = globalShortcut.register(accelerator, handler);
      if (!ok) failed.push(key);
    } catch (err) {
      console.error(`[shortcuts] register ${key}=${accelerator} failed:`, err);
      failed.push(key);
    }
  };

  tryRegister("quickCapture", shortcuts.quickCapture, () => {
    void showOverlay();
  });
  tryRegister("mainWindow", shortcuts.mainWindow, () => {
    void showMainWindow();
  });

  registered = shortcuts;
  return { ok: failed.length === 0, failed };
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
  registered = null;
}

export function rebindShortcut(key: ShortcutKey, accelerator: string): { ok: boolean; failed: ShortcutKey[] } {
  const store = getStore();
  const current = store.get("shortcuts") ?? DEFAULT_SHORTCUTS;
  store.set("shortcuts", { ...current, [key]: accelerator });
  return registerGlobalShortcuts();
}

export function getRegisteredShortcuts(): ShortcutMap | null {
  return registered;
}
