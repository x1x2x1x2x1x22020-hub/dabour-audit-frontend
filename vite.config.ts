import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

// Canonical API port is 8080 (.replit maps local 8080 -> external 80, and the
// api-server defaults to it too). API_TARGET only overrides for exotic setups.
const apiProxyTarget = process.env.API_TARGET || "http://127.0.0.1:8080";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
    server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      // Expose the local api-server (Express) to the Vite dev front-end so that
      // screens such as the AML/Anti-Money-Laundering name screener POST to
      // /api/aml-screen reach the backend instead of Vite's SPA fallback (404).
      // `timeout`/`proxyTimeout` are in MILLISECONDS — the online AML look-up
      // makes several upstream HTTP calls (Wikipedia) so give it a generous
      // window (120s).
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        // NOTE: `ws` is intentionally NOT enabled here. The AML /api routes are
        // plain HTTP (JSON) — enabling ws made http-proxy try to upgrade every
        // request, which stalled slow (multi-second) online lookups and caused
        // HTTP 000 timeouts.
        timeout: 120000,
        proxyTimeout: 120000,
        configure: (proxy) => {
          proxy.on("error", (err: Error) => {
            console.error("[vite:proxy] /api error", err.message);
          });
        },
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
