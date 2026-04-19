/**
 * Detects whether the current renderer is running inside the Electron desktop
 * shell. The desktop preload exposes `window.promptTemple` via `contextBridge`.
 *
 * Use this to gate desktop-only UI (custom title bar, "rebind shortcut" panel)
 * and to hide web-only UI (browser-extension install banners) when in desktop.
 */
export const isDesktop: boolean =
  typeof window !== "undefined" &&
  typeof (window as unknown as { promptTemple?: unknown }).promptTemple !== "undefined";

export const isOverlay: boolean =
  typeof window !== "undefined" &&
  typeof (window as unknown as { promptTempleOverlay?: unknown }).promptTempleOverlay !== "undefined";
