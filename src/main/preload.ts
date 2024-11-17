// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Account, AccountFormData, Investment, InvestmentFormData } from '@/shared/types';

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
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    update: (key: string, value: string) =>
      ipcRenderer.invoke('settings:update', key, value),
  },
  income: {
    getAll: () => ipcRenderer.invoke('income:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('income:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('income:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('income:delete', id),
    updateMonthlyTotals: (id: number, totals: string) =>
      ipcRenderer.invoke('income:updateMonthlyTotals', id, totals),
  },
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll') as Promise<Account[]>,
    create: (data: AccountFormData) => ipcRenderer.invoke('accounts:create', data),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id),
  },
  vehicles: {
    getAll: () => ipcRenderer.invoke('vehicles:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('vehicles:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('vehicles:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('vehicles:delete', id),
  },
  investments: {
    getAll: () => ipcRenderer.invoke('investments:getAll') as Promise<Investment[]>,
    create: (data: InvestmentFormData) => ipcRenderer.invoke('investments:create', data),
    update: (id: number, data: InvestmentFormData) => ipcRenderer.invoke('investments:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('investments:delete', id),
    updateMonthlyTotals: (id: number, totals: string) =>
      ipcRenderer.invoke('investments:updateMonthlyTotals', id, totals),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
