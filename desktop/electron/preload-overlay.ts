import { contextBridge, ipcRenderer } from "electron";
import { IPC, type OverlayOpenPayload } from "./shared/ipc-channels";

const overlayApi = {
  onOpen(handler: (payload: OverlayOpenPayload) => void): () => void {
    const listener = (_event: unknown, payload: OverlayOpenPayload) => handler(payload);
    ipcRenderer.on(IPC.Overlay.Open, listener);
    return () => {
      ipcRenderer.removeListener(IPC.Overlay.Open, listener);
    };
  },
  hide(): Promise<void> {
    return ipcRenderer.invoke(IPC.Overlay.Hide);
  },
  copy(text: string): Promise<boolean> {
    return ipcRenderer.invoke(IPC.Overlay.Copy, text);
  },
  openInMain(): Promise<void> {
    return ipcRenderer.invoke(IPC.Overlay.OpenInMain);
  },
};

contextBridge.exposeInMainWorld("promptTempleOverlay", overlayApi);

export type PromptTempleOverlayAPI = typeof overlayApi;
