/// <reference types="vite/client" />

// This file contains type declarations for the application

// Type definitions for Ethereum wallet (MetaMask)
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    chainId?: string;
  };
}

// This tells TypeScript about JSX types
import * as React from 'react';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
