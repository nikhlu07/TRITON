import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    nodePolyfills({
      include: ['buffer', 'events', 'process', 'util', 'stream', 'string_decoder'],
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true, // 👈 Required for Hiero Ledger & Vercel builds
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 🛡️ Ultimate Build Fix: Force-direct path resolution for Node shims
      process: "vite-plugin-node-polyfills/shims/process",
      buffer: "vite-plugin-node-polyfills/shims/buffer",
    },
  },
}));
