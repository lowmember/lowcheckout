import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    /**
     * Proxy de desenvolvimento para a API.
     *
     * Em produção o CORS é resolvido pelo próprio API Gateway (bloco `httpApi.cors`
     * do serverless.ts), mas o `serverless-offline` não emula isso: a preflight
     * `OPTIONS` volta 204 **sem nenhum header de CORS**, e o navegador bloqueia
     * toda chamada que carrega `x-account-id` ou `Authorization`. Servir a API sob
     * o mesmo origin em dev elimina a preflight em vez de contorná-la.
     */
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
      },
    },
  },
});
