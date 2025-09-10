// src/global.d.ts
export {};

declare global {
  interface Window {
    triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
  }
}
