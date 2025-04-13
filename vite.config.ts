/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: ['socket.io-client']
  },
  build: {
    commonjsOptions: {
      include: [/socket.io-client/, /node_modules/]
    }
  },
  server: {
    port: 8086,
    cors: true
  }
});
