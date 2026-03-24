import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
    // 🛡️ Ensure global objects are mapped correctly for Hiero & Hedera SDKs
    global: 'window',
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 🚨 Absolute fallback for Hiero Ledger & Vercel
      buffer: "buffer",
      process: "buffer", 
    },
  },
}));
