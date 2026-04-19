import { app } from "electron";
import { getStore } from "./store";

/**
 * Wraps `app.setLoginItemSettings`. macOS + Windows are supported natively;
 * Linux relies on the system's autostart spec which Electron does NOT manage,
 * so we no-op there for Sprint 1 and surface a hint in the settings UI.
 */
export function setAutoLaunch(enabled: boolean): void {
  getStore().set("autoLaunch", enabled);
  if (process.platform === "linux") return;
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
    });
  } catch (err) {
    console.error("[auto-launch] setLoginItemSettings failed:", err);
  }
}

export function getAutoLaunch(): boolean {
  return getStore().get("autoLaunch") === true;
}

export function applyPersistedAutoLaunch(): void {
  setAutoLaunch(getAutoLaunch());
}
