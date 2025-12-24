// src/polyfills.ts
import { Buffer } from 'buffer';

// Hack: Gán Buffer và global vào window object
if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
  // Khởi tạo process rỗng để tránh lỗi "process is not defined"
  window.process = { 
    env: {}, 
    version: '', 
    nextTick: (cb: any) => setTimeout(cb, 0) 
  } as any;
}