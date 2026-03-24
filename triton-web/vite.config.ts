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
  define: {
    global: 'window',
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 🚨 Force-map the exact virtual paths that Hiero is looking for
      "vite-plugin-node-polyfills/shims/buffer": "buffer",
      "vite-plugin-node-polyfills/shims/process": "buffer", // Using buffer for process if needed, or better use real process if available
      "buffer": "buffer",
    },
  },
}));
