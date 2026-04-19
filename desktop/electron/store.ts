import Store from "electron-store";
import { randomBytes } from "node:crypto";
import { DEFAULT_SHORTCUTS, type ShortcutMap } from "./shared/ipc-channels";

interface DesktopSchema {
  port: number | null;
  shortcuts: ShortcutMap;
  autoLaunch: boolean;
  nextAuthSecret: string;
  windowBounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  } | null;
}

const defaults: DesktopSchema = {
  port: null,
  shortcuts: DEFAULT_SHORTCUTS,
  autoLaunch: false,
  nextAuthSecret: "",
  windowBounds: null,
};

let storeInstance: Store<DesktopSchema> | null = null;

export function getStore(): Store<DesktopSchema> {
  if (!storeInstance) {
    storeInstance = new Store<DesktopSchema>({
      name: "prompt-temple-desktop",
      defaults,
    });
  }
  return storeInstance;
}

export function getOrCreateNextAuthSecret(): string {
  const store = getStore();
  let secret = store.get("nextAuthSecret");
  if (!secret) {
    secret = randomBytes(32).toString("hex");
    store.set("nextAuthSecret", secret);
  }
  return secret;
}
