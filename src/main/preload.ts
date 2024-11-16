// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },
  paymentMethods: {
    getAll: () => ipcRenderer.invoke('payment-methods:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('payment-methods:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('payment-methods:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('payment-methods:delete', id)
  },
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('categories:create', data),
    update: (id: number, name: string) => ipcRenderer.invoke('categories:update', id, name),
    delete: (id: number) => ipcRenderer.invoke('categories:delete', id)
  }
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
