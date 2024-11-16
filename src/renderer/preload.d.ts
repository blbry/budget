import { PaymentMethod, PaymentMethodFormData, Category } from "@/shared/types";

export interface ElectronHandler {
  ipcRenderer: {
    sendMessage(channel: string, ...args: unknown[]): void;
    on(channel: string, func: (...args: unknown[]) => void): void;
    once(channel: string, func: (...args: unknown[]) => void): void;
  };
  app: {
    getVersion(): Promise<string>;
  };
}

declare global {
  interface Window {
    electron: {
      paymentMethods: {
        getAll: () => Promise<PaymentMethod[]>;
        create: (data: PaymentMethodFormData) => Promise<number>;
        update: (id: number, data: PaymentMethodFormData) => Promise<void>;
        delete: (id: number) => Promise<void>;
      };
      categories: {
        getAll: () => Promise<Category[]>;
      };
      app: {
        getVersion: () => Promise<string>;
      };
    };
  }
}

export {};
