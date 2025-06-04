import { Buffer } from 'buffer';

// Polyfill pour la variable `global` utilisée par sockjs-client
(window as any).global = window;

// Polyfill pour Buffer
(window as any).global.Buffer = (window as any).global.Buffer || require('buffer').Buffer;

// Polyfill pour process
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (callback: () => void) => setTimeout(callback, 0)
};

// Polyfill pour les APIs manquantes
if (typeof (window as any).global.setImmediate === 'undefined') {
  (window as any).global.setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(callback, 0, ...args);
  };
}
