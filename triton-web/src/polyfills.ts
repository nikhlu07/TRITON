import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  // @ts-ignore
  window.global = window;
  // @ts-ignore
  window.process = { env: {} };
}
